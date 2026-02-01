import { useWindowDimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { selectGridColumns } from '@/utils/redux/selectors/settingsSelectors';

const GRID_HORIZONTAL_PADDING = 8;
const GRID_GAP = 8;
const ITEM_MARGIN_H = 8; // AlbumItem/ArtistItem/PlaylistItem have marginHorizontal: 8

export function useGridLayout() {
  const { width } = useWindowDimensions();
  const gridColumns = useSelector(selectGridColumns);

  const totalPadding = GRID_HORIZONTAL_PADDING * 2;
  const totalItemMargins = gridColumns * (ITEM_MARGIN_H * 2);
  // FlashList numColumns divides row into equal cells - no built-in gap between columns
  const gridItemWidth =
    (width - totalPadding - totalItemMargins) / gridColumns;

  return {
    gridColumns,
    gridItemWidth,
    gridGap: GRID_GAP,
    gridPadding: GRID_HORIZONTAL_PADDING,
  };
}