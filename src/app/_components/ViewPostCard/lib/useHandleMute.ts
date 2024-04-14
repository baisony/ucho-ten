// useHandleMute.ts
import { useState } from "react"
import { BskyAgent } from "@atproto/api"

const useHandleMute = (
    agent: BskyAgent | null,
    postView: { author: { did: string } } | null,
    initialIsMuted: boolean
): [() => void, boolean, (value: boolean) => void] => {
    const [loading, setLoading] = useState(false)
    const [isMuted, setIsMuted] = useState<boolean>(initialIsMuted)

    const handleMute = async () => {
        if (loading || !postView) return

        setLoading(true)

        if (isMuted) {
            setIsMuted(!isMuted)
            await agent?.unmute(postView.author.did)
        } else {
            setIsMuted(!isMuted)
            await agent?.mute(postView.author.did)
        }

        setLoading(false)
    }

    return [handleMute, isMuted, setIsMuted]
}

export default useHandleMute
