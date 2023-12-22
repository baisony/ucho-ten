import { atom, useAtom } from "jotai"

export interface ScrollPosition {
    [key: string]: any
}
const scrollPositions = atom<ScrollPosition[]>([])

export const useScrollPositions = () => useAtom(scrollPositions)
