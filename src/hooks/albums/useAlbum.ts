import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Album } from "@/types";
import { useLibrary } from "@/contexts/LibraryContext";
import { selectAlbumById } from "@/utils/redux/selectors/librarySelectors";

type UseAlbumResult = {
  album: Album | null;
  isLoading: boolean;
  error: Error | null;
};

export function useAlbum(id: string): UseAlbumResult {
  const album = useSelector(selectAlbumById(id));
  const { getAlbum } = useLibrary();

  useEffect(() => {
    getAlbum(id).catch(() => {
      // type shit
    });
  }, [id]);

  return {
    album,
    isLoading: !album,
    error: null,
  };
}