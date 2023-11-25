import { atom, useAtom } from "jotai"

const statusCodeAtPage = atom<number | null>(null)

export const useStatusCodeAtPage = () => useAtom(statusCodeAtPage)
