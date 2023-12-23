import { atom, useAtom } from "jotai"
interface SearchInfo {
    target: string
    searchWord: string
}

const SearchInfoAtom = atom<SearchInfo>({
    target: "",
    searchWord: "",
})

export const useSearchInfoAtom = () => useAtom(SearchInfoAtom)
