import { atom, useAtom } from "jotai"
interface SearchInfo {
    target: string
    searchWord: string
    // posts: PostView[] | null
    // users: ProfileView[] | null
    // postCursor: string
    // userCursor: string
}

const SearchInfoAtom = atom<SearchInfo>({
    target: "",
    searchWord: "",
    // posts: null,
    // users: null,
    // postCursor: "",
    // userCursor: "",
})

export const useSearchInfoAtom = () => useAtom(SearchInfoAtom)
