// useGetSettings.ts
import { useCallback } from "react"
import { Bookmark } from "@/app/_atoms/bookmarks"
import { MuteWord } from "@/app/_atoms/wordMute"

const useGetSettings = (
    setBookmarks: (bookmarks: Bookmark[]) => void,
    setMuteWords: (muteWords: MuteWord[]) => void
) => {
    return useCallback(async () => {
        try {
            const data = localStorage.getItem("session")
            if (!data) return
            const res = await fetch(`/api/getSettings/post`, {
                method: "POST",
                body: JSON.stringify({ data }),
            })
            if (res.status === 200) {
                const responseData = await res.json()
                const bookmarks = responseData.hasOwnProperty("bookmarks")
                    ? responseData.bookmarks
                    : []
                const muteWords = responseData.hasOwnProperty("muteWords")
                    ? responseData.muteWords
                    : []
                setBookmarks(bookmarks)
                setMuteWords(muteWords)
            } else if (res.status === 404) {
                setBookmarks([])
                setMuteWords([])
            }
        } catch (e) {
            console.log(e)
        }
    }, [setBookmarks, setMuteWords])
}

export default useGetSettings
