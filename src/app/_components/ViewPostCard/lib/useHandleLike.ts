// useHandleLike.ts
import { useState } from "react"
import { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { ViewRecord } from "@atproto/api/dist/client/types/app/bsky/embed/record"
import { BskyAgent } from "@atproto/api"

interface HandleInputChangeFunction {
    (reaction: string, postUri: string, reactionUri: string): void
}

const useHandleLike = (
    postView: PostView | null,
    postJsonData: PostView | ViewRecord | null,
    handleInputChange: HandleInputChangeFunction,
    agent: BskyAgent | null,
    initialIsLiked: boolean // 初期のisLikedの値を受け取る
): [() => void, boolean, (value: boolean) => void] => {
    // 戻り値の型を変更
    const [loading, setLoading] = useState(false)
    const [isLiked, setIsLiked] = useState<boolean>(initialIsLiked) // isLikedの型をbooleanに設定

    const handleLike = async () => {
        if (loading) return

        setLoading(true)

        if (isLiked && postView?.viewer?.like) {
            setIsLiked(!isLiked)
            const res = await agent?.deleteLike(postView.viewer.like)
            console.log(res)
            handleInputChange(
                "unlike",
                postView.uri,
                postView.viewer.like || ""
            )
        } else if (postJsonData?.uri && postJsonData?.cid) {
            setIsLiked(!isLiked)
            const res = await agent?.like(postJsonData.uri, postJsonData.cid)
            console.log(res)
            handleInputChange("like", postJsonData.uri || "", res?.uri || "")
        }

        setLoading(false)
    }

    return [handleLike, !!isLiked, setIsLiked] // booleanに変換して返す
}

export default useHandleLike
