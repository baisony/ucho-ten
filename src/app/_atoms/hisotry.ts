import { atom, useAtom } from "jotai"

interface HistoryObject {
    url: string
    tab: "home" | "search" | "inbox" | "post"
}

const historyAtom = atom<HistoryObject[]>([])

export const useHistory = () => useAtom(historyAtom)
