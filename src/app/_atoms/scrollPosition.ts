import { atom, useAtom } from "jotai"

interface range {
    startIndex: number
    endIndex: number | null
    startOffset: number
}
interface position {
    ranges: range[]
    scrollTop: number
}

export interface ScrollPosition {
    [key: string]: position
}

const scrollPositions = atom<ScrollPosition[]>([])

export const useScrollPositions = () => useAtom(scrollPositions)
