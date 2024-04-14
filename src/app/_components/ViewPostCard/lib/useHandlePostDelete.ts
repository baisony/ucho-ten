// useHandleDelete.ts
import { useState } from "react"
import { BskyAgent } from "@atproto/api"
import { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"

interface HandleInputChangeFunction {
    (action: string, postUri: string, reactionUri: string): void
}

const useHandlePostDelete = (
    agent: BskyAgent | null,
    postJson: PostView | undefined,
    handleInputChange: HandleInputChangeFunction
): [() => Promise<void>, boolean] => {
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        if (loading || !agent || !postJson) return

        try {
            setLoading(true)
            await agent.deletePost(postJson.uri)
            handleInputChange("delete", postJson.uri, "")
        } catch (e) {
            console.log(e)
        } finally {
            setLoading(false)
        }
    }

    return [handleDelete, loading]
}

export default useHandlePostDelete
