import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"

export interface MuteWord {
    category: string | null
    word: string
    end: number | null
    selectPeriod: number | null
    isActive: boolean
    targets: string[]
    muteAccountIncludesFollowing: boolean
    updatedAt: number
    createdAt: number
    deletedAt: Date | null
}

const wordMutes = atomWithStorage<MuteWord[]>("muteWords", [])

export const useWordMutes = () => useAtom(wordMutes)
