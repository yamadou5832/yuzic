// Auth / connection
export { testConnection } from './auth';

// Artists
export {
  lookupArtist,
  getArtists,
  ensureArtist,
  deleteArtist,
} from './artists';

// Albums
export {
  downloadAlbum,
} from './albums';

// Queue
export {
  fetchQueue,
  fetchQueueWithDiff,
  detectFinishedQueueItems,
} from './queue';
export type { LidarrQueueRecord } from './queue';