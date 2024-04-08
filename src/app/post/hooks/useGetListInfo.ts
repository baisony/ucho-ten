// useGetListInfo.ts

import { BskyAgent } from "@atproto/api"
import { ListView } from "@atproto/api/dist/client/types/app/bsky/graph/defs"

export const useGetListInfo = async (
    url: string,
    agent: BskyAgent | null,
    setIsOGPGetProcessing: React.Dispatch<React.SetStateAction<boolean>>,
    setGetListData: React.Dispatch<React.SetStateAction<ListView | undefined>>
) => {
    if (!agent) return
    const regex = /\/([^/]+)\/lists\/([^/]+)/
    const matches = url.match(regex)
    if (matches) {
        const did = matches[1]
        const feedName = matches[2]
        try {
            setIsOGPGetProcessing(true)
            const { data } = await agent.app.bsky.graph.getList({
                list: `at://${did}/app.bsky.graph.list/${feedName}`,
            })
            setGetListData(data.list)
        } catch (e) {
            console.log(e)
        } finally {
            setIsOGPGetProcessing(false)
        }
    }
}
