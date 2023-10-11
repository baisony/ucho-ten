import { isMobile } from "react-device-detect"
import { ViewPostCard, ViewPostCardProps } from "../ViewPostCard"
import LazyViewPostCard from "../ViewPostCard/LazyViewPostCard"
import { Spinner } from "@nextui-org/react"
// import InfiniteScroll from "react-infinite-scroller"
import { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import exp from "constants"
import { Key, useEffect, useRef, useState } from "react"
import { useAgent } from "@/app/_atoms/agent"
import { AppBskyFeedGetTimeline } from "@atproto/api"
import { viewPostCard } from "../ViewPostCard/styles"
import { useFeedsAtom } from "@/app/_atoms/feeds"
import TestComponent from "../testComponent"

export interface FeedPageProps {
    feedKey: string
    color: string
    now?: Date
}

const FeedPage = ({ feedKey, color, now }: FeedPageProps) => {
    const [agent, setAgent] = useAgent()
    const [postsByFeed] = useFeedsAtom()

    const [loading, setLoading] = useState(false)
    //const [loading2, setLoading2] = useState(false)
    const [timeline, setTimeline] = useState<FeedViewPost[] | null>(null)
    const [newTimeline, setNewTimeline] = useState<FeedViewPost[]>([])
    const [hasMore, setHasMore] = useState<boolean>(false)
    const [darkMode, setDarkMode] = useState(false)

    const [wait, setWait] = useState<boolean>(true)

    const cursor = useRef<string>("")

    const modeMe = (e: any) => {
        setDarkMode(!!e.matches)
    }

    const formattingTimeline = (timeline: FeedViewPost[]) => {
        const seenUris = new Set<string>()
        const filteredData = timeline.filter((item) => {
            const uri = item.post.uri

            // if (item.post.embed) {
            //     console.log(item.post.embed)
            // }

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

    const skeletons: any = Array.from({length: 20}).map((_, index) => {
        return {
            color: "light",
            isMobile: true,
            postJson: null,
            isSkeleton: true,
            json: null,
        }
    })

    return (
        <>
            {timeline &&
                <TestComponent data={timeline} />
            }
            {(!timeline || wait) &&
                <TestComponent data={skeletons} />
            }
        </>
    )

    // return (
    //     <>
    //         {/* {timeline && (
    //             <AutoSizer>
    //                 {({ height, width }) => ( */}
    //                     <List
    //                         height={100}
    //                         itemCount={99999}
    //                         itemSize={35} // Adjust based on the height of your row
    //                         width={50}
    //                         itemData={timeline}
    //                     >
    //                         {Row}
    //                     </List>
    //                 {/* )}
    //             </AutoSizer> */}
    //         )}
    //         {/* <InfiniteScroll
    //             id={`id-${feedKey}`}
    //             key={`key-${feedKey}`}
    //             //id="infinite-scroll"
    //             initialLoad={false}
    //             loadMore={loadMore}
    //             hasMore={hasMore}
    //             loader={
    //                 <div
    //                     key="spinner-home"
    //                     className="flex justify-center mt-2 mb-2"
    //                 >
    //                     <Spinner />
    //                 </div>
    //             }
    //             threshold={700}
    //             useWindow={false}
    //         >
    //             {(loading || !timeline) &&
    //                 Array.from({ length: 15 }, (_, index) => (
    //                     <LazyViewPostCard
    //                         key={`skeleton-${index}`}
    //                         // @ts-ignore
    //                         color={color}
    //                         numbersOfImage={0}
    //                         postJson={null}
    //                         isMobile={isMobile}
    //                         isSkeleton={true}
    //                     />
    //                 ))}
    //             {!loading &&
    //                 timeline &&
    //                 timeline.map((post, index) => {
    //                     return (
    //                         <ViewPostCard
    //                             key={`${
    //                                 post?.reason
    //                                     ? `reason-${
    //                                           (post.reason as any).by.did
    //                                       }`
    //                                     : `post`
    //                             }-${post.post.uri}`}
    //                             // @ts-ignore
    //                             color={color}
    //                             numbersOfImage={0}
    //                             postJson={post.post}
    //                             json={post}
    //                             isMobile={isMobile}
    //                             now={now}
    //                         />
    //                     )
    //                 })}
    //         </InfiniteScroll> */}
    //     </>
    // )
}

export default FeedPage
