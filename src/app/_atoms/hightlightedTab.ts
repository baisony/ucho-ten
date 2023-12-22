import { atom, useAtom } from "jotai"
import { TabQueryParamValue } from "@/app/_types/types"

const highlightedTabAtom = atom<TabQueryParamValue | "">("")

export const useHighlightedTab = () => useAtom(highlightedTabAtom)
