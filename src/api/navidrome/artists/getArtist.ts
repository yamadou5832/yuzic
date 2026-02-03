import { AlbumBase, Artist, ArtistBase, CoverSource } from "@/types";
import { getAlbumInfo } from "../albums/getAlbumInfo";

const API_VERSION = "1.16.0";
const CLIENT_NAME = "Yuzic";

export type GetArtistResult = Artist | null;

export async function getArtist(
  serverUrl: string,
  username: string,
  password: string,
  artistId: string
): Promise<GetArtistResult> {
  const url =
    `${serverUrl}/rest/getArtist.view` +
    `?u=${encodeURIComponent(username)}` +
    `&p=${encodeURIComponent(password)}` +
    `&v=${API_VERSION}` +
    `&c=${CLIENT_NAME}` +
    `&f=json` +
    `&id=${artistId}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Navidrome getArtist failed: ${res.status}`);

  const raw = await res.json();
  const artist = raw?.["subsonic-response"]?.artist;
  if (!artist) return null;

  const artistCover: CoverSource = artist.coverArt
    ? { kind: "navidrome", coverArtId: artist.coverArt }
    : { kind: "none" };

  const artistBase: ArtistBase = {
    id: artist.id,
    cover: artistCover,
    name: artist.name,
    subtext: "Artist"
  };

  const albumInfos = await Promise.all(
    artist.album.map((a: { id: string }) =>
      getAlbumInfo(serverUrl, username, password, a.id)
    )
  );

  const albums: AlbumBase[] = artist.album.map((album: any, i: number) => {
    const cover: CoverSource = album.coverArt
      ? { kind: "navidrome", coverArtId: album.coverArt }
      : { kind: "none" };

    return {
      id: album.id,
      title: album.name,
      cover,
      subtext: `Album • ${artist.name}`,
      year: album.year,
      artist: artistBase,
      genres: album.genre ? [album.genre] : [],
      created: album.created ? new Date(album.created) : new Date(0),
      mbid: albumInfos[i]?.musicBrainzId ?? null,
    };
  });

  return {
    id: artist.id,
    name: artist.name,
    cover: artistCover,
    subtext: "Artist",
    ownedAlbums: albums
  };
}