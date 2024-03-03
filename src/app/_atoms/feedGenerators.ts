import { GeneratorView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { atom, useAtom } from "jotai"

const feedGenerators = atom<GeneratorView[] | null>(null)

export const useFeedGeneratorsAtom = () => useAtom(feedGenerators)
