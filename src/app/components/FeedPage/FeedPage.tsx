import { Virtuoso } from "react-virtuoso"
import { isMobile } from "react-device-detect"
import { ViewPostCard, ViewPostCardProps } from "../ViewPostCard"
// import LazyViewPostCard from "../ViewPostCard/LazyViewPostCard"
import { Spinner } from "@nextui-org/react"
// import InfiniteScroll from "react-infinite-scroller"
import { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import exp from "constants"
import { Key, useEffect, useRef, useState } from "react"
import { useAgent } from "@/app/_atoms/agent"
import { AppBskyFeedGetTimeline } from "@atproto/api"
import { viewPostCard } from "../ViewPostCard/styles"
// import { useFeedsAtom } from "@/app/_atoms/feeds"
// import TestComponent from "../testComponent"

export interface FeedPageProps {
    feedKey: string
    color: "light" | "dark"
    now?: Date
}

const FeedPage = ({ feedKey, color, now }: FeedPageProps) => {
    const [agent, setAgent] = useAgent()

    const [loading, setLoading] = useState(false)
    //const [loading2, setLoading2] = useState(false)
    const [timeline, setTimeline] = useState<FeedViewPost[] | null>(null)
    const [newTimeline, setNewTimeline] = useState<FeedViewPost[]>([])
    const [hasMore, setHasMore] = useState<boolean>(false)
    const [wait, setWait] = useState<boolean>(true)

    const cursor = useRef<string>("")

    const formattingTimeline = (timeline: FeedViewPost[]) => {
        const seenUris = new Set<string>()
        const filteredData = timeline.filter((item) => {
            const uri = item.post.uri

            if (item.reply) {
                if (item.reason) return true
                if (
                    //@ts-ignore
                    item.post.author.did === item.reply.parent.author.did &&
                    //@ts-ignore
                    item.reply.parent.author.did === item.reply.root.author.did
                )
                    return true
                return false
            }
            //これはおそらくparentやrootがミュートユーザーの時、recordにreplyが入って、authorが自分ではない場合は非表示
            if (
                //@ts-ignore
                item.post.record?.reply &&
                item.post.author.did !== agent?.session?.did
            )
                return false
            // まだ uri がセットに登録されていない場合、trueを返し、セットに登録する
            if (!seenUris.has(uri)) {
                seenUris.add(uri)
                return true
            }
            return false
        })

        return filteredData as FeedViewPost[]
    }

    const fetchTimeline = async (loadingFlag: boolean = true) => {
        if (!agent) {
            return
        }

        try {
            setLoading(loadingFlag)

            let response: AppBskyFeedGetTimeline.Response
            let timelineLength = 0

            if (feedKey === "following") {
                response = await agent.getTimeline({
                    limit: 30,
                    cursor: cursor.current || "",
                })
            } else {
                response = await agent.app.bsky.feed.getFeed({
                    feed: feedKey,
                    cursor: cursor.current || "",
                    limit: 30,
                })
            }

            if (response.data) {
                const { feed } = response.data
                const filteredData = formattingTimeline(feed)

                setTimeline((currentTimeline) => {
                    if (currentTimeline !== null) {
                        const newTimeline = [
                            ...currentTimeline,
                            ...filteredData,
                        ]
                        timelineLength = newTimeline.length

                        return newTimeline
                    } else {
                        timelineLength = filteredData.length
                        return [...filteredData]
                    }
                })
            } else {
                setTimeline([])
                // もしresがundefinedだった場合の処理
                console.log("Responseがundefinedです。")
            }

            setLoading(false)

            cursor.current = response.data.cursor || ""

            if (
                response.data &&
                cursor.current &&
                cursor.current.length > 0 &&
                timelineLength < 15
            ) {
                await fetchTimeline(false)
            }

            if (cursor.current.length > 0) {
                setHasMore(true)
            } else {
                setHasMore(false)
            }

            setTimeout(() => {
                setWait(false)
            }, 0.4)
        } catch (e) {
            setLoading(false)
        }
    }

    const loadMore = async (page: number) => {
        await fetchTimeline(false)
    }

    useEffect(() => {
        cursor.current = ""
        setLoading(true)
        setTimeline(null)

        setNewTimeline([])
    }, [])

    useEffect(() => {
        if (agent) {
            fetchTimeline()
        }
    }, [agent])

    return (
        <>
            {!timeline &&
                <Virtuoso
                    overscan={100}
                    increaseViewportBy={200}
                    // useWindowScroll={true}
                    // overscan={50}
                    totalCount={20}
                    initialItemCount={20}
                    atTopThreshold={100}
                    atBottomThreshold={100}
                    itemContent={(index, item) => (
                        <ViewPostCard
                            {...{
                                color,
                                isMobile,
                                isSkeleton: true
                            }}
                        />
                    )}
                />
            }
            {timeline &&
                <Virtuoso
                    overscan={200}
                    increaseViewportBy={200}
                    // useWindowScroll={true}
                    // overscan={50}
                    data={timeline}
                    initialItemCount={Math.min(18, timeline?.length || 0)}
                    atTopThreshold={100}
                    atBottomThreshold={100}
                    itemContent={(index, item) => (
                        <ViewPostCard
                            {...{
                                color,
                                isMobile,
                                isSkeleton: false,
                                postJson: item.post || null,
                                json: item,
                            }}
                        />
                    )}
                />
            }
        </>
    )
}

export default FeedPage
