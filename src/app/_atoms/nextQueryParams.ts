import { atom, useAtom } from "jotai"

const nextQueryParamsAtom = atom<URLSearchParams>(new URLSearchParams())

export const useNextQueryParamsAtom = () => useAtom(nextQueryParamsAtom)
