// useHandleBookmark.ts
import { useState } from "react"
import { Bookmark } from "@/app/_atoms/bookmarks"

const useHandleBookmark = (
    bookmarks: Bookmark[],
    setBookmarks: (bookmarks: Bookmark[]) => void,
    syncBookmarks: (bookmarks: Bookmark[]) => Promise<void>
): [(uri: string) => void, boolean, (value: boolean) => void] => {
    const [isBookmarked, setIsBookmarked] = useState(false)

    const handleBookmark = (uri: string) => {
        const createdAt = new Date().getTime()
        const json: Bookmark = {
            uri: uri,
            category: null,
            createdAt: createdAt,
            updatedAt: createdAt,
            deletedAt: null,
        }

        const index = bookmarks.findIndex(
            (bookmark: Bookmark) => bookmark.uri === uri
        )
        console.log(index)

        if (index !== -1) {
            //console.log("delete");
            const newBookmarks = bookmarks.slice()
            newBookmarks.splice(index, 1)
            //console.log(newBookmarks);

            setBookmarks(newBookmarks)
            void syncBookmarks(newBookmarks)
            setIsBookmarked(false)
            //await syncBookmarks();
        } else {
            console.log("add")
            //@ts-ignore
            setBookmarks((prevBookmarks: Bookmark[]) => [
                ...prevBookmarks,
                json,
            ])
            void syncBookmarks([...bookmarks, json])
            setIsBookmarked(true)
        }
    }

    return [handleBookmark, isBookmarked, setIsBookmarked]
}

export default useHandleBookmark
