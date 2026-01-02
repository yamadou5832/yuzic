import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Song } from '@/types';
import { useLibrary } from '@/contexts/LibraryContext';
import { usePlaying } from '@/contexts/PlayingContext';
import { toast } from '@backpackapp-io/react-native-toast';
import { useDispatch, useSelector } from 'react-redux';
import { selectOpenaiApiKey } from '@/utils/redux/selectors/settingsSelectors';
import { addPromptToHistory } from '@/utils/redux/slices/settingsSlice';

interface AIContextType {
    input: string;
    setInput: (val: string) => void;
    generateQueue: (input: string) => Promise<Song[]>;
    generatedQueue: Song[];
    setGeneratedQueue: (queue: Song[]) => void;
    isLoading: boolean;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const useAI = () => {
    const context = useContext(AIContext);
    if (!context) {
        throw new Error('useAI must be used within an AIProvider');
    }
    return context;
};

export const AIProvider = ({ children }: { children: ReactNode }) => {
    const dispatch = useDispatch();
    const { albums, genres, fetchGenres, starred } = useLibrary();
    const { playSongInCollection } = usePlaying();
    const openaiApiKey = useSelector(selectOpenaiApiKey);

    const [input, setInput] = useState('');
    const [generatedQueue, setGeneratedQueue] = useState<Song[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const tryParseJson = (text: string): any => {
        try {
            const trimmed = text.trim();

            if (trimmed.startsWith('[') && !trimmed.endsWith(']')) {
                const lastComma = trimmed.lastIndexOf(',');
                const maybeFixed = trimmed.substring(0, lastComma) + ']';
                return JSON.parse(maybeFixed);
            }

            return JSON.parse(trimmed);
        } catch (err) {
            console.error('JSON Parse Error:', err, '\nOriginal Text:', text);
            return null;
        }
    };

    const cleanAIText = (text: string): string => {
        return text.replace(/```json/g, '').replace(/```/g, '').trim();
    };

    type OpenAICallParams = {
        systemPrompt: string;
        userPrompt: string;
        temperature?: number;
    };

    const callOpenAIString = async ({
        systemPrompt,
        userPrompt,
        temperature = 0.3,
    }: OpenAICallParams): Promise<string> => {
        if (!openaiApiKey) {
            toast.error('OpenAI API key not set.');
            throw new Error('Missing OpenAI API Key');
        }

        const res = await fetch(
            'https://rawarr-server-af0092d911f6.herokuapp.com/api/openai/string',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemPrompt,
                    userPrompt,
                    temperature,
                    apiKey: openaiApiKey,
                }),
            }
        );

        const data = await res.json();
        return (data.content || '').trim();
    };

    const callOpenAIJson = async (params: OpenAICallParams): Promise<any> => {
        const text = await callOpenAIString(params);
        const cleaned = cleanAIText(text);
        return tryParseJson(cleaned);
    };

    const classifyPromptType = async (
        prompt: string
    ): Promise<'genre' | 'artist'> => {
        try {
            const result = await callOpenAIString({
                systemPrompt:
                    "Classify the user's prompt as either 'genre' or 'artist'. " +
                    "If the prompt asks for a specific artist, album, or band, return 'artist'. " +
                    "If the prompt is about a vibe, mood, genre, or activity, return 'genre'. " +
                    "Return only the word 'genre' or 'artist'.",
                userPrompt: prompt,
                temperature: 0.3,
            });

            const lower = result.toLowerCase();
            if (lower === 'artist' || lower === 'genre') return lower;
            return 'genre';
        } catch {
            toast.error('AI failed to classify prompt.');
            return 'genre';
        }
    };

    const getGenresForPrompt = async (
        prompt: string,
        genreNames: string[]
    ): Promise<string[]> => {
        const result = await callOpenAIJson({
            systemPrompt:
                'You are a music genre matching assistant. ' +
                'Return a JSON array of genres from the list that best match the prompt.',
            userPrompt: `Prompt: "${prompt}"\n\nGenres:\n${genreNames.join(', ')}`,
            temperature: 0.4,
        });

        return Array.isArray(result) ? result : [];
    };

    const getSongWeight = (song: Song): number => {
        const isFavorite = starred.songs.some(s => s.id === song.id);
        const favoriteBoost = isFavorite ? 2 : 1;

        return Math.sqrt(1) * favoriteBoost;
    };

    const weightedShuffle = (songs: Song[], count = 100): Song[] => {
        const result: Song[] = [];
        const pool = [...songs];

        for (let i = 0; i < count && pool.length; i++) {
            const totalWeight = pool.reduce(
                (sum, song) => sum + getSongWeight(song),
                0
            );
            const threshold = Math.random() * totalWeight;

            let cumulative = 0;
            let index = 0;

            for (let j = 0; j < pool.length; j++) {
                cumulative += getSongWeight(pool[j]);
                if (cumulative >= threshold) {
                    index = j;
                    break;
                }
            }

            result.push(...pool.splice(index, 1));
        }

        return result;
    };

    const generateQueue = async (userPrompt: string): Promise<Song[]> => {
        setIsLoading(true);
        setInput(userPrompt);

        try {
            const promptType = await classifyPromptType(userPrompt);

            if (promptType === 'genre') {
                if (!genres.length) {
                    await fetchGenres();
                }

                const genreNames = genres.map(g => g.name);
                const selectedGenres = await getGenresForPrompt(
                    userPrompt,
                    genreNames
                );

                const matchedSongs = genres
                    .filter(g => selectedGenres.includes(g.name))
                    .flatMap(g => g.songs);

                if (!matchedSongs.length) return [];

                const queue = weightedShuffle(matchedSongs, 100);
                setGeneratedQueue(queue);

                if (queue.length) {
                    await playSongInCollection(queue[0], {
                        id: 'ai-generated',
                        title: `AI Queue • ${userPrompt}`,
                        cover: '',
                        subtext: "Playlist",
                        userPlayCount: 0,
                        songs: queue,
                    });
                }

                dispatch(addPromptToHistory({ prompt: userPrompt, queue }));
                return queue;
            }

            const albumGenresMap = new Map<string, Set<string>>();

            genres.forEach(g => {
                g.songs.forEach(s => {
                    if (!albumGenresMap.has(s.albumId)) {
                        albumGenresMap.set(s.albumId, new Set());
                    }
                    albumGenresMap.get(s.albumId)!.add(g.name);
                });
            });

            const albumText = albums
                .map((a, i) => {
                    const genresForAlbum = Array.from(
                        albumGenresMap.get(a.id) ?? []
                    );

                    return `${i + 1}. "${a.title}" by ${a.artist.name}${genresForAlbum.length ? ` — ${genresForAlbum.join(', ')}` : ''
                        } [${a.id}]`;
                })
                .join('\n');

            const selectedAlbumIds: string[] = await callOpenAIJson({
                systemPrompt:
                    'Select a diverse mix of albums matching the prompt. ' +
                    'Return only a JSON array of album IDs.',
                userPrompt: `Prompt: "${userPrompt}"\n\nAlbums:\n${albumText}`,
            });

            const relevantSongs = genres
                .flatMap(g => g.songs)
                .filter(s => selectedAlbumIds?.includes(s.albumId));

            if (!relevantSongs.length) return [];

            const songText = relevantSongs
                .map(
                    (s, i) =>
                        `${i + 1}. "${s.title}" — ${s.artist} [${s.id}]`
                )
                .join('\n');

            const selectedSongIds: string[] = await callOpenAIJson({
                systemPrompt:
                    'Create a playlist of up to 100 unique songs. ' +
                    'Return only a JSON array of song IDs.',
                userPrompt: `Prompt: "${userPrompt}"\n\nSongs:\n${songText}`,
            });

            const queue = relevantSongs.filter(s =>
                selectedSongIds?.includes(s.id)
            );

            setGeneratedQueue(queue);

            if (queue.length) {
                await playSongInCollection(queue[0], {
                    id: 'ai-generated',
                    title: `AI Queue • ${userPrompt}`,
                    cover: '',
                    subtext: "Playlist",
                    userPlayCount: 0,
                    songs: queue,
                });
            }

            dispatch(addPromptToHistory({ prompt: userPrompt, queue }));
            return queue;
        } catch (err) {
            console.error('AI error:', err);
            toast.error('AI failed to generate a playlist.');
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AIContext.Provider
            value={{
                input,
                setInput,
                generateQueue,
                generatedQueue,
                setGeneratedQueue,
                isLoading
            }}
        >
            {children}
        </AIContext.Provider>
    );
};