import { atom, useAtom } from "jotai"

type TappedTabbarButton = "home" | "search" | "inbox" | null

const tappedTabbarButtonAtom = atom<TappedTabbarButton>(null)

export const useTappedTabbarButtonAtom = () => useAtom(tappedTabbarButtonAtom)
