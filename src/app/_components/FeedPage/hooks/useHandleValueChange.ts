import { useCallback } from "react"
import { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs"

export const useHandleValueChange = (
    timeline: FeedViewPost[] | null, // 適切な型に置き換えてください
    setTimeline: (timeline: FeedViewPost[] | null) => void // 適切な型に置き換えてください
) => {
    return useCallback(
        (newValue: any) => {
            if (!timeline) return

            const foundObjectIndex = timeline.findIndex(
                (item) => item.post && item.post.uri === newValue.postUri
            )

            if (foundObjectIndex !== -1) {
                //@ts-ignore
                setTimeline((prevData: any[]) => {
                    if (!prevData) return prevData

                    const updatedData = [...prevData]

                    const foundObject = updatedData[foundObjectIndex]
                    if (
                        foundObject &&
                        foundObject.post &&
                        foundObject.post.viewer
                    ) {
                        switch (newValue.reaction) {
                            case "like":
                            case "unlike":
                                foundObject.post.viewer.like =
                                    newValue.reaction === "like"
                                        ? newValue.reactionUri
                                        : undefined
                                break
                            case "repost":
                            case "unrepost":
                                foundObject.post.viewer.repost =
                                    newValue.reaction === "repost"
                                        ? newValue.reactionUri
                                        : undefined
                                break
                            case "delete":
                                updatedData.splice(foundObjectIndex, 1)
                                break
                            default:
                                break
                        }
                    }

                    return updatedData
                })
            } else {
                console.log(
                    "指定されたURIを持つオブジェクトは見つかりませんでした。"
                )
            }
        },
        [timeline, setTimeline]
    )
}
