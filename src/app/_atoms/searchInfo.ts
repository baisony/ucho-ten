import { atom, useAtom } from "jotai"
import { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs"

interface SearchInfo {
    target: string
    searchWord: string
    posts: PostView[] | null
    users: ProfileView[] | null
    postCursor: string
    userCursor: string
}

const SearchInfoAtom = atom<SearchInfo>({
    target: "",
    searchWord: "",
    posts: null,
    users: null,
    postCursor: "",
    userCursor: "",
})

export const useSearchInfoAtom = () => useAtom(SearchInfoAtom)
