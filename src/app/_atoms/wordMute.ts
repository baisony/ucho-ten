import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"

interface MuteWord {
    category: string | null
    word: string
    end: string | null
    isActive: boolean
    targets: string[]
    muteAccountIncludesFollowing: boolean
}

const wordMutes = atomWithStorage<MuteWord[]>(
    "muteWords",
    []
)

export const useWordMutes = () => useAtom(wordMutes)
