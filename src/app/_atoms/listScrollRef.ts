import { atom, useAtom } from "jotai"

const listScrollRefAtom = atom<HTMLElement | null>(null)

export const useListScrollRefAtom = () => useAtom(listScrollRefAtom)
