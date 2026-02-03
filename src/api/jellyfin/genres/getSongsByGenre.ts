import { CoverSource, Song } from '@/types'
import { buildJellyfinStreamUrl } from '@/utils/builders/buildStreamUrls'

export type GetSongsByGenreResult = Song[]

async function fetchAlbumsByGenre(
  serverUrl: string,
  token: string,
  genre: string
) {
  const url =
    `${serverUrl}/Items` +
    `?IncludeItemTypes=MusicAlbum` +
    `&Genres=${encodeURIComponent(genre)}` +
    `&Recursive=true`

  const res = await fetch(url, {
    headers: {
      'X-Emby-Token': token,
      'X-Emby-Authorization':
        `MediaBrowser Client="Yuzic", Device="Mobile", DeviceId="yuzic-device", Version="1.0.0", Token="${token}"`,
    },
  })

  if (!res.ok) {
    throw new Error(
      `Jellyfin fetchAlbumsByGenre failed: ${res.status}`
    )
  }

  return res.json()
}

async function fetchSongsForAlbum(
  serverUrl: string,
  token: string,
  albumId: string
) {
  const url =
    `${serverUrl}/Items` +
    `?ParentId=${albumId}` +
    `&IncludeItemTypes=Audio` +
    `&Fields=MediaSources,RunTimeTicks,Genres,Album,AlbumArtist,Artists,UserData,PlayCount`

  const res = await fetch(url, {
    headers: {
      'X-Emby-Token': token,
      'X-Emby-Authorization':
        `MediaBrowser Client="Yuzic", Device="Mobile", DeviceId="yuzic-device", Version="1.0.0", Token="${token}"`,
    },
  })

  if (!res.ok) {
    throw new Error(
      `Jellyfin fetchSongsForAlbum failed: ${res.status}`
    )
  }

  return res.json()
}

function normalizeGenreSongEntry(
  s: any,
  serverUrl: string,
  token: string
): Song {
  const ticks =
    s.RunTimeTicks ??
    s.MediaSources?.[0]?.RunTimeTicks ??
    0

  const cover: CoverSource = s.Id
    ? { kind: 'jellyfin', itemId: s.Id }
    : { kind: 'none' }

  const ms = s.MediaSources?.[0]
  const audioStream = ms?.MediaStreams?.find((m: any) => m.Type === 'Audio')

  return {
    id: s.Id,
    title: s.Name,
    artist: s.ArtistItems?.[0]?.Name ?? 'Unknown Artist',
    artistId: s.ArtistItems?.[0]?.Id ?? '',
    cover,
    duration: String(
      Math.round(Number(ticks) / 10_000_000)
    ),
    streamUrl: buildJellyfinStreamUrl(
      serverUrl,
      token,
      s.Id
    ),
    albumId: s.AlbumId ?? '',
    bitrate: (audioStream?.BitRate ?? ms?.Bitrate) ?? undefined,
    sampleRate: audioStream?.SampleRate ?? undefined,
    bitsPerSample: audioStream?.BitDepth ?? undefined,
    mimeType: ms?.Container ? `audio/${ms.Container}` : undefined,
    dateReleased: s.PremiereDate ?? undefined,
    disc: s.ParentIndexNumber ?? undefined,
    trackNumber: s.IndexNumber ?? undefined,
    dateAdded: s.DateCreated ?? undefined,
    genres: normalizeGenres(s.Genres),
  }
}

export async function getSongsByGenre(
  serverUrl: string,
  token: string,
  genre: string
): Promise<GetSongsByGenreResult> {
  const albumRes = await fetchAlbumsByGenre(
    serverUrl,
    token,
    genre
  )

  const albums = albumRes?.Items ?? []
  if (!albums.length) return []

  const songResults = await Promise.all(
    albums.map((album: any) =>
      fetchSongsForAlbum(serverUrl, token, album.Id)
        .then(res => res?.Items ?? [])
        .catch(() => [])
    )
  )

  const songs = songResults.flat()

  return songs.map(s =>
    normalizeGenreSongEntry(s, serverUrl, token)
  )
}