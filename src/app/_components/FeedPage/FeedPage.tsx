import { Virtuoso } from "react-virtuoso"
import { isMobile } from "react-device-detect"
import {
    FeedViewPost,
    PostView,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { useCallback, useEffect, useRef, useState } from "react"
import { useAgent } from "@/app/_atoms/agent"
import { AppBskyFeedGetTimeline } from "@atproto/api"
import { useNextQueryParamsAtom } from "@/app/_atoms/nextQueryParams"
import { filterDisplayPosts } from "@/app/_lib/feed/filterDisplayPosts"
import { useTranslation } from "react-i18next"
import { mergePosts } from "@/app/_lib/feed/mergePosts"
import {
    QueryFunctionContext,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query"
import { ViewPostCard } from "../ViewPostCard"
import { processPostBodyText } from "@/app/_lib/post/processPostBodyText"
import { tabBarSpaceStyles } from "@/app/_components/TabBar/tabBarSpaceStyles"
import { useWordMutes } from "@/app/_atoms/wordMute"
import { useUserProfileDetailedAtom } from "@/app/_atoms/userProfileDetail"
import { useScrollPositions } from "@/app/_atoms/scrollPosition"
import dynamic from "next/dynamic"

import { SwipeRefreshList } from "react-swipe-down-refresh"
//import "react-swipe-down-refresh/lib/react-swipe-down-refresh.css"
import "./SwipeRefreshListStyle.css"
import "./styles.css"
import { DummyHeader } from "@/app/_components/DummyHeader"
import { useHideRepost } from "@/app/_atoms/hideRepost"
import ViewPostCardSkelton from "@/app/_components/ViewPostCard/ViewPostCardSkelton"
import RefreshButton from "@/app/_components/RefreshButton/RefreshButton"

//import { ListFooterNoContent } from "@/app/_components/ListFooterNoContent"
const ListFooterNoContent = dynamic(
    () =>
        import("../ListFooterNoContent").then((mod) => mod.ListFooterNoContent),
    { ssr: true }
)
//import { ListFooterSpinner } from "../ListFooterSpinner"
const ListFooterSpinner = dynamic(
    () => import("../ListFooterSpinner").then((mod) => mod.ListFooterSpinner),
    { ssr: true }
)

const FEED_FETCH_LIMIT: number = 30
const CHECK_FEED_UPDATE_INTERVAL: number = 10 * 1000

export interface FeedPageProps {
    isActive: boolean
    isNextActive: boolean
    isViaUFeed?: boolean
    feedKey: string
    pageName: string
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
    isViaUFeed,
    isActive, // disableSlideVerticalScroll, isNextActive
    pageName,
}: FeedPageProps) => {
    const { t } = useTranslation()
    const [agent] = useAgent()
    const [userProfileDetailed] = useUserProfileDetailedAtom()
    const [nextQueryParams] = useNextQueryParamsAtom()
    const { notNulltimeline } = tabBarSpaceStyles()
    const [muteWords] = useWordMutes()
    const [hideRepost] = useHideRepost()
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

    const virtuosoRef = useRef(null)
    const [scrollPositions, setScrollPositions] = useScrollPositions()
    const isScrolling = useRef<boolean>(false)

    const getFeedKeys = {
        all: ["getFeed"] as const,
        feedkey: (feedKey: string) => [...getFeedKeys.all, feedKey] as const,
        feedkeyWithCursor: (feedKey: string, cursor: string) =>
            [...getFeedKeys.feedkey(feedKey), cursor] as const,
    }

    useEffect(() => {
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

    const filterPosts = (posts: FeedViewPost[]) => {
        return posts.filter((post) => {
            return !muteWords.some((muteWord) => {
                if (muteWord.isActive) {
                    const textToCheck =
                        //@ts-ignore
                        post.post?.embed?.record?.value?.text ||
                        //@ts-ignore
                        post.post?.record?.text
                    return textToCheck?.includes(muteWord.word)
                }
                return false
            })
        })
    }

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
                        ? filterDisplayPosts(
                              feed,
                              userProfileDetailed,
                              agent,
                              hideRepost
                          )
                        : feed
                //@ts-ignore
                const muteWordFilter = filterPosts(filteredData)

                setNewTimeline(muteWordFilter)

                if (muteWordFilter.length > 0) {
                    console.log(
                        "new and old cid",
                        feedKey,
                        muteWordFilter[0].post.cid,
                        latestCID.current
                    )

                    if (
                        muteWordFilter[0].post.cid !== latestCID.current &&
                        latestCID.current !== ""
                    ) {
                        setHasUpdate(true)
                    } else {
                        setHasUpdate(false)
                    }
                }
            }
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        if (!agent) return
        if (!isActive) {
            return
        }

        if (!shouldCheckUpdate.current) {
            shouldCheckUpdate.current = true
            //void initialLoad()
            void checkNewTimeline()
            //console.log("useEffect set setTimeout", feedKey)
            const timeoutId = setInterval(() => {
                console.log("fetch", feedKey)

                void checkNewTimeline()
            }, CHECK_FEED_UPDATE_INTERVAL)

            return () => {
                console.log(`useEffect unmounted ${feedKey}`)
                clearInterval(timeoutId)
            }
        }
    }, [agent, isActive])

    const queryClient = useQueryClient()

    const handleRefresh = async () => {
        shouldScrollToTop.current = true

        const mergedTimeline = mergePosts(newTimeline, timeline)

        if (!mergedTimeline[0]?.post) return
        //@ts-ignore
        setTimeline(mergedTimeline)
        setNewTimeline([])
        setHasUpdate(false)

        if (mergedTimeline.length > 0) {
            latestCID.current = (mergedTimeline[0].post as PostView).cid
        }

        await queryClient.refetchQueries({
            queryKey: ["getFeed", feedKey],
        })

        shouldCheckUpdate.current = true
    }

    const handleFetchResponse = (response: FeedResponseObject) => {
        if (response) {
            const { posts, cursor } = response
            if (posts.length === 0 || cursor === "") setIsEndOfFeed(true)
            setCursorState(response.cursor)

            console.log("posts", posts)

            const filteredData =
                feedKey === "following"
                    ? filterDisplayPosts(
                          posts,
                          userProfileDetailed,
                          agent,
                          hideRepost
                      )
                    : posts
            //@ts-ignore
            const muteWordFilter = filterPosts(filteredData)

            console.log("filteredData", filteredData)
            console.log("muteWordFilter", muteWordFilter)

            if (timeline === null) {
                if (muteWordFilter.length > 0) {
                    latestCID.current = muteWordFilter[0].post.cid
                }
            }

            setTimeline((currentTimeline) => {
                if (currentTimeline !== null) {
                    return [...currentTimeline, ...muteWordFilter]
                } else {
                    return [...muteWordFilter]
                }
            })
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
        // console.log("getTimelineFetcher: >>")

        if (agent === null) {
            // console.log("error")
            throw new Error("Agent does not exist")
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_key, feedKey] = queryKey

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
        select: (fishes) => {
            console.log(fishes)
            return fishes
        },
        notifyOnChangeProps: ["data"],
        enabled:
            agent !== null &&
            feedKey !== "" &&
            isActive /*shouldLoad */ &&
            loadMoreFeed,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    })

    const handleValueChange = (newValue: any) => {
        if (!timeline) return

        const foundObjectIndex = timeline.findIndex(
            (item) => item.post && item.post.uri === newValue.postUri
        )

        if (foundObjectIndex !== -1) {
            setTimeline((prevData) => {
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
    }

    const handleSaveScrollPosition = () => {
        console.log("save")
        if (!isActive) return
        //@ts-ignore
        virtuosoRef?.current?.getState((state) => {
            console.log(state)
            if (
                state.scrollTop !==
                //@ts-ignore
                scrollPositions[`${pageName}-${feedKey}`]?.scrollTop
            ) {
                const updatedScrollPositions = { ...scrollPositions }
                //@ts-ignore
                updatedScrollPositions[`${pageName}-${feedKey}`] = state
                setScrollPositions(updatedScrollPositions)
            }
        })
    }

    if (data !== undefined && !isEndOfFeed) {
        handleFetchResponse(data)
        setLoadMoreFeed(false)
    }

    const lazyCheckNewTimeline = async () => {
        if (!agent) return

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
                        ? filterDisplayPosts(
                              feed,
                              userProfileDetailed,
                              agent,
                              hideRepost
                          )
                        : feed
                //@ts-ignore
                const muteWordFilter = filterPosts(filteredData)

                const mergedTimeline = mergePosts(muteWordFilter, timeline)

                if (!mergedTimeline[0]?.post) return
                //@ts-ignore
                setTimeline(mergedTimeline)
                setNewTimeline([])
                setHasUpdate(false)

                if (mergedTimeline.length > 0) {
                    latestCID.current = (mergedTimeline[0].post as PostView).cid
                }

                await queryClient.refetchQueries({
                    queryKey: ["getFeed", feedKey],
                })
            }
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <>
            {hasUpdate && <RefreshButton handleRefresh={handleRefresh} />}
            <SwipeRefreshList
                onRefresh={async () => {
                    await lazyCheckNewTimeline()
                }}
                className={"swiperRefresh h-full w-full"}
                threshold={150}
                disabled={isScrolling.current}
            >
                <Virtuoso
                    scrollerRef={(ref) => {
                        if (ref instanceof HTMLElement) {
                            scrollRef.current = ref
                            // setListScrollRefAtom(ref)
                        }
                    }}
                    ref={virtuosoRef}
                    isScrolling={(e) => {
                        isScrolling.current = e
                    }}
                    //@ts-ignore
                    restoreStateFrom={scrollPositions[`${pageName}-${feedKey}`]}
                    context={{ hasMore }}
                    increaseViewportBy={200}
                    overscan={200}
                    data={timeline ?? undefined}
                    totalCount={timeline ? timeline.length : 20}
                    atTopThreshold={100}
                    atBottomThreshold={100}
                    itemContent={(index, item) => (
                        <>
                            {item ? (
                                <ViewPostCard
                                    key={`feed-${item.post.uri}`}
                                    {...{
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
                                        handleValueChange: handleValueChange,
                                        handleSaveScrollPosition:
                                            handleSaveScrollPosition,
                                        isViaUFeed: isViaUFeed,
                                    }}
                                />
                            ) : (
                                <ViewPostCardSkelton />
                            )}
                        </>
                    )}
                    components={{
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        Footer: isEndOfFeed
                            ? ListFooterSpinner
                            : ListFooterNoContent,
                        Header: () => <DummyHeader />,
                    }}
                    endReached={loadMore}
                    className={notNulltimeline()}
                />
            </SwipeRefreshList>
        </>
    )
}

export default FeedPage
