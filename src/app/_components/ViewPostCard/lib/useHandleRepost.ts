// usehandleRepost.ts
import { useState } from "react"
import { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { ViewRecord } from "@atproto/api/dist/client/types/app/bsky/embed/record"
import { BskyAgent } from "@atproto/api"

interface HandleInputChangeFunction {
    (reaction: string, postUri: string, reactionUri: string): void
}

const useHandleRepost = (
    postView: PostView | null,
    postJsonData: PostView | ViewRecord | null,
    handleInputChange: HandleInputChangeFunction,
    agent: BskyAgent | null,
    initialIsReposted: boolean // 初期のisLikedの値を受け取る
): [() => void, boolean, (value: boolean) => void] => {
    // 戻り値の型を変更
    const [loading, setLoading] = useState(false)
    const [isReposted, setIsReposted] = useState<boolean>(initialIsReposted) // isLikedの型をbooleanに設定

    const handleRepost = async () => {
        if (loading) return

        setLoading(true)

        if (isReposted && postView?.viewer?.repost) {
            setIsReposted(!isReposted)
            const res = await agent?.deleteRepost(postView.viewer.repost)
            console.log(res)
            handleInputChange(
                "unrepost",
                postView.uri,
                postView.viewer.like || ""
            )
        } else if (postJsonData?.uri && postJsonData?.cid) {
            setIsReposted(!isReposted)
            const res = await agent?.repost(postJsonData.uri, postJsonData.cid)
            console.log(res)
            handleInputChange("repost", postJsonData.uri || "", res?.uri || "")
        }

        setLoading(false)
    }

    return [handleRepost, !!isReposted, setIsReposted] // booleanに変換して返す
}

export default useHandleRepost
