import { AlbumBase, ExternalAlbumBase } from "./Album";
import { CoverSource } from "./Cover";

export interface ArtistBase {
    id: string;
    cover: CoverSource;
    name: string;
    subtext: string;
    /** MusicBrainz ID when available from server (Navidrome, Jellyfin) */
    mbid?: string | null;
}

export interface Artist extends ArtistBase {
    ownedAlbums: AlbumBase[];
}

export interface ExternalArtistBase {
    id: string;
    name: string;
    cover: CoverSource;
    subtext: string;
}

export interface ExternalArtist extends ExternalArtistBase {
    albums: ExternalAlbumBase[];
}