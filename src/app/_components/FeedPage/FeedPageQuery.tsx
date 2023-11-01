// "use client"

// import { Virtuoso } from "react-virtuoso"
// import { isMobile } from "react-device-detect"
// import { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
// import { useEffect, useMemo, useRef, useState } from "react"
// import { useAgent } from "@/app/_atoms/agent"
// import { AppBskyFeedGetTimeline } from "@atproto/api"
// import { ViewPostCardCell } from "../ViewPostCard/ViewPostCardCell"
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
// import { faArrowsRotate, faL } from "@fortawesome/free-solid-svg-icons"
// import { useInfoByFeedAtom } from "@/app/_atoms/dataByFeed"
// //import { settingContentFilteringPage } from "../SettingContentFilteringPage/styles"
// import { useNextQueryParamsAtom } from "@/app/_atoms/nextQueryParams"
// import { ListFooterSpinner } from "../ListFooterSpinner"
// import { filterDisplayPosts } from "@/app/_lib/feed/filterDisplayPosts"
// import { useTranslation } from "react-i18next"
// import { mergePosts } from "@/app/_lib/feed/mergePosts"
// import { usePathname } from "next/navigation"
// // import { useListScrollRefAtom } from "@/app/_atoms/listScrollRef"
// import {
//     QueryFunctionContext,
//     QueryKey,
//     useQuery,
//     useMutation,
//     QueryClient,
//     useQueryClient,
// } from "@tanstack/react-query"
// import FeedPage from "@/app/_components/FeedPage/FeedPage"

// const FEED_FETCH_LIMIT: number = 30
// const CHECK_FEED_UPDATE_INTERVAL: number = 5 * 1000
// export interface FeedPageQueryProps {
//     isActive: boolean
//     feedKey: string
//     disableSlideVerticalScroll: boolean
//     now?: Date
// }

// interface feedFetcherProps {
//     fetchkey: string
//     feedKey: string
// }

// const FeedPageQuery = ({
//     feedKey,
//     now,
//     isActive, // disableSlideVerticalScroll,
// }: FeedPageQueryProps) => {
//     const { t } = useTranslation()

//     const [agent] = useAgent()
//     const [infoByFeed, setInfoByFeed] = useInfoByFeedAtom()
//     const [nextQueryParams] = useNextQueryParamsAtom()

//     const [timeline, setTimeline] = useState<FeedViewPost[] | null>(null)

//     const [hasMore, setHasMore] = useState<boolean>(false)

//     const feedData = useRef<AppBskyFeedGetTimeline.Response | null>(null)
//     const loadedData = useRef<boolean>(false)
//     const cursor = useRef<string>("")
//     const scrollRef = useRef<HTMLElement | null>(null)
//     const shouldScrollToTop = useRef<boolean>(false)
//     const latestCID = useRef<string>("")
//     const queryClient = useQueryClient()

//     const getFeedKeys = {
//         all: ["getFeed"] as const,
//         feedkey: (feedKey: string) => [...getFeedKeys.all, feedKey] as const,
//     }

//     const getTimelineFetcher = async ({
//         queryKey,
//     }: QueryFunctionContext<
//         ReturnType<(typeof getFeedKeys)["feedkey"]>
//     >): Promise<FeedViewPost[]> => {
//         console.log("getTimelineFetcher: >>")

//         if (agent === null) {
//             console.log("error")
//             throw new Error("Agent does not exist")
//         }

//         const [_key, feedKey] = queryKey

//         if (feedKey === "following") {
//             const response = await agent.getTimeline({
//                 limit: FEED_FETCH_LIMIT,
//                 cursor: cursor.current || "",
//             })

//             return response.data.feed
//         } else {
//             const response = await agent.app.bsky.feed.getFeed({
//                 feed: feedKey,
//                 cursor: cursor.current || "",
//                 limit: FEED_FETCH_LIMIT,
//             })

//             return response.data.feed
//         }
//     }

//     const { data, isLoading, isError } = useQuery({
//         queryKey: getFeedKeys.feedkey(feedKey),
//         queryFn: getTimelineFetcher,
//         enabled: agent !== null && feedKey !== "" && isActive === true,
//     })

//     if (data !== undefined && timeline === null) {
//         setTimeline(data)
//     }

//     const timelineWithDummy = useMemo((): FeedViewPost[] => {
//         console.log("timelineWithDummy timeline", timeline)
//         // Need to add data for top padding
//         const dummyData: FeedViewPost = {} as FeedViewPost

//         if (timeline === null) {
//             return [dummyData]
//         } else {
//             return [dummyData, ...timeline]
//         }
//     }, [timeline])

//     return (
//         <>
//             <Virtuoso
//                 scrollerRef={(ref) => {
//                     if (ref instanceof HTMLElement) {
//                         scrollRef.current = ref
//                         // setListScrollRefAtom(ref)
//                     }
//                 }}
//                 // context={{ hasMore }}
//                 overscan={200}
//                 increaseViewportBy={200}
//                 data={timelineWithDummy}
//                 atTopThreshold={100}
//                 atBottomThreshold={100}
//                 itemContent={(index, item) => (
//                     <ViewPostCardCell
//                         {...{
//                             isMobile,
//                             isSkeleton: false,
//                             postJson: item.post || null,
//                             json: item,
//                             isDummyHeader: index === 0,
//                             now,
//                             nextQueryParams,
//                             t,
//                         }}
//                     />
//                 )}
//                 // components={{
//                 //     // @ts-ignore
//                 //     Footer: ListFooterSpinner,
//                 // }}
//                 // endReached={loadMore}
//                 // onScroll={(e) => disableScrollIfNeeded(e)}
//                 //className="overflow-y-auto"
//                 style={{ height: "calc(100% - 50px)" }}
//             />
//         </>
//     )
// }

// export default FeedPageQuery
