import React from 'react'
import { View, Dimensions } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import MediaTile from './MediaTile'
import LoaderCard from './LoaderCard'

const H_PADDING = 16
const VISIBLE_ITEMS = 2.5

type GenreEntry = {
  genre: string
  albums: any[]
}

type Props = {
  data: GenreEntry[]
  ready: boolean
}

export default function GenresForYouSection({
  data,
  ready,
}: Props) {
  const screenWidth = Dimensions.get('window').width
  const gridGap = 12

  const tileSize =
    (screenWidth - H_PADDING * 2 - gridGap * 2) /
    VISIBLE_ITEMS

  if (!ready) {
    return (
      <View style={{ paddingHorizontal: H_PADDING }}>
        <LoaderCard
          width={screenWidth - H_PADDING * 2}
          height={tileSize}
          radius={14}
        />
      </View>
    )
  }

  return (
    <FlashList
      horizontal
      data={data}
      keyExtractor={item => item.genre}
      estimatedItemSize={tileSize}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: H_PADDING,
      }}
      ItemSeparatorComponent={() => (
        <View style={{ width: gridGap }} />
      )}
      renderItem={({ item }) => (
        <MediaTile
          cover={item.albums[0]?.cover}
          title={item.genre}
          subtitle=""
          size={tileSize}
          radius={4}
          onPress={() => {}}
        />
      )}
    />
  )
}