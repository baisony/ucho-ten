import { atom, useAtom } from "jotai"
import { StateSnapshot } from "react-virtuoso"

export interface ScrollPosition {
    [key: string]: StateSnapshot
}

const scrollPositions = atom<ScrollPosition>({})

export const useScrollPositions = () => useAtom(scrollPositions)
