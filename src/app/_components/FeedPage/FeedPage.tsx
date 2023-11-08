import { Virtuoso } from "react-virtuoso"
import { isMobile } from "react-device-detect"
import { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import {
    MutableRefObject,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react"
import { useAgent } from "@/app/_atoms/agent"
import { AppBskyFeedGetTimeline } from "@atproto/api"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowsRotate } from "@fortawesome/free-solid-svg-icons"
import { useNextQueryParamsAtom } from "@/app/_atoms/nextQueryParams"
import { ListFooterSpinner } from "../ListFooterSpinner"
import { filterDisplayPosts } from "@/app/_lib/feed/filterDisplayPosts"
import { useTranslation } from "react-i18next"
import { mergePosts } from "@/app/_lib/feed/mergePosts"
import { QueryFunctionContext, useQuery } from "@tanstack/react-query"
import { ListFooterNoContent } from "@/app/_components/ListFooterNoContent"
import { ViewPostCard } from "../ViewPostCard"
import { processPostBodyText } from "@/app/_lib/post/processPostBodyText"

const FEED_FETCH_LIMIT: number = 30
const CHECK_FEED_UPDATE_INTERVAL: number = 5 * 1000
export interface FeedPageProps {
    isActive: boolean
    isNextActive: boolean
    feedKey: string
    disableSlideVerticalScroll: boolean
    now?: Date
}

interface FeedResponseObject {
    posts: FeedViewPost[]
    cursor: string // TODO: should consider adding ? to handle undefined.
}

const FeedPage = ({
    feedKey,
    now,
    isActive, // disableSlideVerticalScroll, isNextActive
}: FeedPageProps) => {
    const { t } = useTranslation()

    const [agent] = useAgent()
    const [nextQueryParams] = useNextQueryParamsAtom()

    const [timeline, setTimeline] = useState<FeedViewPost[] | null>(null)
    const [newTimeline, setNewTimeline] = useState<FeedViewPost[]>([])
    const [hasMore, setHasMore] = useState<boolean>(false)
    const [hasUpdate, setHasUpdate] = useState<boolean>(false)
    const [loadMoreFeed, setLoadMoreFeed] = useState<boolean>(true)
    const [cursorState, setCursorState] = useState<string>()
    const [isEndOfFeed, setIsEndOfFeed] = useState<boolean>(false) // TODO: should be implemented.

    const scrollRef = useRef<HTMLElement | null>(null)
    const shouldScrollToTop = useRef<boolean>(false)
    const latestCID = useRef<string>("")
    const shouldCheckUpdate = useRef<boolean>(false)

    const getFeedKeys = {
        all: ["getFeed"] as const,
        feedkey: (feedKey: string) => [...getFeedKeys.all, feedKey] as const,
        feedkeyWithCursor: (feedKey: string, cursor: string) =>
            [...getFeedKeys.feedkey(feedKey), cursor] as const,
    }

    useEffect(() => {
        console.log(shouldScrollToTop.current, scrollRef.current)

        if (shouldScrollToTop.current && scrollRef.current) {
            scrollRef.current.scrollTop = 0

            shouldScrollToTop.current = false
        }
    }, [timeline])

    const loadMore = useCallback(() => {
        if (hasMore) {
            setLoadMoreFeed(true)
        }
    }, [hasMore])

    const checkNewTimeline = async () => {
        if (!agent) return

        shouldCheckUpdate.current = false

        try {
            let response: AppBskyFeedGetTimeline.Response

            if (feedKey === "following") {
                response = await agent.getTimeline({
                    limit: FEED_FETCH_LIMIT,
                    cursor: "",
                })
            } else {
                response = await agent.app.bsky.feed.getFeed({
                    feed: feedKey,
                    limit: FEED_FETCH_LIMIT,
                    cursor: "",
                })
            }

            const { data } = response

            if (data) {
                const { feed } = data
                const filteredData =
                    feedKey === "following"
                        ? filterDisplayPosts(feed, agent.session?.did)
                        : feed

                console.log(`check new ${feedKey}`, filteredData)
                console.log(`timeline ${feedKey}`, timeline)

                setNewTimeline(filteredData)

                if (filteredData.length > 0) {
                    console.log(
                        "new and old cid",
                        feedKey,
                        filteredData[0].post.cid,
                        latestCID.current
                    )

                    if (
                        filteredData[0].post.cid !== latestCID.current &&
                        latestCID.current !== ""
                    ) {
                        setHasUpdate(true)
                    } else {
                        setHasUpdate(false)
                    }
                }
            }

            if (isActive) {
                shouldCheckUpdate.current = true

                console.log("set setTimeout", feedKey)
                const timeoutId = setTimeout(() => {
                    console.log("setTimeout", feedKey)
                    checkNewTimeline()
                }, CHECK_FEED_UPDATE_INTERVAL)
            }
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        if (isActive !== true) {
            return
        }

        if (shouldCheckUpdate.current === false) {
            shouldCheckUpdate.current = true

            console.log("set setTimeout", feedKey)

            const timeoutId = setTimeout(() => {
                console.log("setTimeout", feedKey)

                checkNewTimeline()
            }, CHECK_FEED_UPDATE_INTERVAL)
        }
    }, [isActive])

    const handleRefresh = () => {
        shouldScrollToTop.current = true

        const mergedTimeline = mergePosts(newTimeline, timeline)

        setTimeline(mergedTimeline)
        setNewTimeline([])
        setHasUpdate(false)

        if (mergedTimeline.length > 0) {
            latestCID.current = mergedTimeline[0].post.cid
        }

        shouldCheckUpdate.current = true
    }

    const handleFetchResponse = (response: FeedResponseObject) => {
        if (response) {
            const { posts } = response
            setCursorState(response.cursor)

            console.log("posts", posts)

            const filteredData =
                feedKey === "following"
                    ? filterDisplayPosts(posts, agent?.session?.did)
                    : posts

            console.log("filteredData", filteredData)

            setTimeline((currentTimeline) => {
                if (currentTimeline !== null) {
                    const newTimeline = [...currentTimeline, ...filteredData]

                    return newTimeline
                } else {
                    return [...filteredData]
                }
            })

            if (filteredData.length > 0) {
                latestCID.current = filteredData[0].post.cid
            } else {
                latestCID.current = ""
            }
        } else {
            setTimeline([])
            setHasMore(false)
            return
        }

        setCursorState(response.cursor)

        if (cursorState !== "") {
            setHasMore(true)
        } else {
            setHasMore(false)
        }
    }

    const getTimelineFetcher = async ({
        queryKey,
    }: QueryFunctionContext<
        ReturnType<(typeof getFeedKeys)["feedkeyWithCursor"]>
    >): Promise<FeedResponseObject> => {
        console.log("getTimelineFetcher: >>")

        if (agent === null) {
            console.log("error")
            throw new Error("Agent does not exist")
        }

        const [_key, feedKey, cursorData] = queryKey

        if (feedKey === "following") {
            const response = await agent.getTimeline({
                cursor: cursorState || "",
                limit: FEED_FETCH_LIMIT,
            })

            return {
                posts: response.data.feed,
                cursor: response.data.cursor || "",
            }
        } else {
            const response = await agent.app.bsky.feed.getFeed({
                feed: feedKey,
                cursor: cursorState || "",
                limit: FEED_FETCH_LIMIT,
            })

            return {
                posts: response.data.feed,
                cursor: response.data.cursor || "",
            }
        }
    }

    const { data /*isLoading, isError*/ } = useQuery({
        queryKey: getFeedKeys.feedkeyWithCursor(feedKey, cursorState || ""),
        queryFn: getTimelineFetcher,
        enabled:
            agent !== null &&
            feedKey !== "" &&
            isActive /*shouldLoad */ &&
            loadMoreFeed,
    })

    if (data !== undefined) {
        console.log(`useQuery: data.cursor: ${data.cursor}`)
        handleFetchResponse(data)
        setLoadMoreFeed(false)
    }

    return (
        <>
            {hasUpdate && (
                <div
                    className={
                        "absolute flex justify-center z-[10] left-16 right-16 md:top-[120px] top-[100px]"
                    }
                >
                    <div
                        className={
                            "text-white bg-blue-500/50 backdrop-blur-[15px] rounded-full cursor-pointer pl-[10px] pr-[10px] pt-[5px] pb-[5px] text-[14px]"
                        }
                        onClick={handleRefresh}
                    >
                        <FontAwesomeIcon icon={faArrowsRotate} />{" "}
                        {t("button.newPosts")}
                    </div>
                </div>
            )}
            {timeline === null && (
                <Virtuoso
                    overscan={200}
                    increaseViewportBy={200}
                    totalCount={20}
                    initialItemCount={20}
                    atTopThreshold={100}
                    atBottomThreshold={100}
                    itemContent={(index, _) => (
                        <ViewPostCard
                            {...{
                                isTop: index === 0,
                                isMobile,
                                isSkeleton: true,
                                bodyText: undefined,
                                nextQueryParams,
                                t,
                            }}
                        />
                    )}
                    style={{
                        overflowY: "auto",
                        height: "calc(100% - 50px - env(safe-area-inset-bottom))",
                    }}
                />
            )}
            {timeline !== null && (
                <Virtuoso
                    scrollerRef={(ref) => {
                        if (ref instanceof HTMLElement) {
                            scrollRef.current = ref
                            // setListScrollRefAtom(ref)
                        }
                    }}
                    context={{ hasMore }}
                    increaseViewportBy={200}
                    overscan={200}
                    data={timeline}
                    atTopThreshold={100}
                    atBottomThreshold={100}
                    itemContent={(index, item) => (
                        <ViewPostCard
                            key={`feed-${item.post.uri}`}
                            {...{
                                isTop: index === 0,
                                isMobile,
                                isSkeleton: false,
                                bodyText: processPostBodyText(
                                    nextQueryParams,
                                    item.post || null
                                ),
                                postJson: item.post || null,
                                json: item,
                                now,
                                nextQueryParams,
                                t,
                            }}
                        />
                    )}
                    components={{
                        // @ts-ignore
                        Footer: !isEndOfFeed
                            ? ListFooterSpinner
                            : ListFooterNoContent,
                    }}
                    endReached={loadMore}
                    // onScroll={(e) => disableScrollIfNeeded(e)}
                    //className="overflow-y-auto"
                    style={{
                        height: "calc(100% - 50px - env(safe-area-inset-bottom))",
                    }}
                />
            )}
        </>
    )
}

export default FeedPage
