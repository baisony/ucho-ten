import { Bookmark } from "@/app/_atoms/bookmarks"
import { MuteWord } from "@/app/_atoms/wordMute"

export const syncContents = async (
    bookmarklist: Bookmark[],
    muteWords: MuteWord[]
) => {
    const syncData = {
        bookmarks: bookmarklist,
        muteWords: muteWords,
    }
    try {
        const syncData_string = JSON.stringify(syncData)
        const data = localStorage.getItem("session")
        if (!data) return
        const res = await fetch(`/api/setSettings/post`, {
            method: "POST",
            body: JSON.stringify({
                syncData: syncData_string,
                authorization: data,
            }),
        })
        //console.log(await res)
        if (res.status !== 200) {
            console.log("sync error")
        }
    } catch (e) {
        console.log(e)
    }
}
