import { AppBskyFeedDefs } from '@atproto/api'
import { atom, useAtom } from 'jotai'

const feedGenerators = atom<AppBskyFeedDefs.GeneratorView[] | null>(null)

export const useFeedGeneratorsAtom = () => useAtom(feedGenerators)



