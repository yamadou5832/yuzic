import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Artist } from "@/types";
import { useLibrary } from "@/contexts/LibraryContext";
import { selectArtistById } from "@/utils/redux/selectors/librarySelectors";

type UseArtistResult = {
  artist: Artist | null;
  isLoading: boolean;
  error: Error | null;
};

export function useArtist(id: string): UseArtistResult {
  const artist = useSelector(selectArtistById(id));
  const { getArtist } = useLibrary();

  useEffect(() => {
    getArtist(id).catch(() => {
      /* optional error handling */
    });
  }, [id]);

  return {
    artist,
    isLoading: !artist,
    error: null,
  };
}