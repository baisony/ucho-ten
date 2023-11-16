import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"

export interface Bookmark {
    uri: string
    category: string | null
    createdAt: number
    updatedAt: number
    deletedAt: Date | null
}

export interface BookmarkByDid {
    [key: string]: Bookmark[]
}
const bookmarks = atomWithStorage<Bookmark[]>("bookmarks", [])

export const useBookmarks = () => useAtom(bookmarks)
