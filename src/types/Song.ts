import { CoverSource } from "./Cover";

export interface Song {
    id: string;
    title: string;
    artist: string;
    artistId: string;
    cover: CoverSource;
    duration: string;
    streamUrl: string;
    albumId: string;
    /** File path; omitted when not available. */
    filePath?: string;
    /** Bitrate in kbps; omitted when not available. */
    bitrate?: number;
    /** Sample rate in Hz; omitted when not available. */
    sampleRate?: number;
    /** Bits per sample; omitted when not available. */
    bitsPerSample?: number;
    /** MIME type; omitted when not available. */
    mimeType?: string;
    /** Release date; omitted when not available. */
    dateReleased?: string;
    /** Disc number; omitted when not available. */
    disc?: number;
    /** Track number; omitted when not available. */
    trackNumber?: number;
    /** Date added to library; omitted when not available. */
    dateAdded?: string;
    /** BPM; omitted when not available. */
    bpm?: number;
    /** Genres; omitted when not available. */
    genres?: string[];
}

export interface ExternalSong {
    id: string;
    title: string;
    artist: string;
    cover: CoverSource;
    duration: string;
    albumId: string;
}