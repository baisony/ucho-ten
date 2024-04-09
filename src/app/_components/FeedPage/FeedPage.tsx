import { Virtuoso, VirtuosoHandle } from "react-virtuoso"
import { isMobile } from "react-device-detect"
import { AppBskyFeedGetTimeline } from "@atproto/api"
import {
    FeedViewPost,
    PostView,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { memo, useCallback, useEffect, useRef, useState } from "react"
import { useAgent } from "@/app/_atoms/agent"
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
import { SwipeRefreshList } from "react-swipe-down-refresh"
import "./SwipeRefreshListStyle.css"
import "./styles.css"
import { DummyHeader } from "@/app/_components/DummyHeader"
import { useHideRepost } from "@/app/_atoms/hideRepost"
import ViewPostCardSkelton from "@/app/_components/ViewPostCard/ViewPostCardSkelton"
import RefreshButton from "@/app/_components/RefreshButton/RefreshButton"
import { useZenMode } from "@/app/_atoms/zenMode"
import { ScrollToTopButton } from "@/app/_components/ScrollToTopButton/ScrollToTopButton"
import { useSaveScrollPosition } from "@/app/_components/FeedPage/hooks/useSaveScrollPosition"
import { useHandleValueChange } from "@/app/_components/FeedPage/hooks/useHandleValueChange"
import { useCheckNewTimeline } from "@/app/_components/FeedPage/hooks/useCheckNewTimeline"
import { useFilterPosts } from "@/app/_lib/useFilterPosts"

const FEED_FETCH_LIMIT: number = 30
const CHECK_FEED_UPDATE_INTERVAL: number = 15 * 1000

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

interface ResponseObject {
    status: number
    error: string
    success: boolean
    headers: unknown
}

const FeedPage = memo(
    ({
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
        const hasMore = useRef<boolean>(false)
        const [hasUpdate, setHasUpdate] = useState<boolean>(false)
        const [loadMoreFeed, setLoadMoreFeed] = useState<boolean>(true)
        const cursorState = useRef<string>()
        const isEndOfFeed = useRef<boolean>(false)

        const scrollRef = useRef<HTMLElement | null>(null)
        const shouldScrollToTop = useRef<boolean>(false)
        const latestCID = useRef<string>("")
        const shouldCheckUpdate = useRef<boolean>(false)
        const scrollIndex = useRef<number>(0)

        const virtuosoRef = useRef<VirtuosoHandle | null>(null)
        const [scrollPositions, setScrollPositions] = useScrollPositions()
        const isScrolling = useRef<boolean>(false)
        const [zenMode] = useZenMode()
        const [hasError, setHasError] = useState<null | ResponseObject>(null)

        console.log("FeedPage")

        const getFeedKeys = {
            all: ["getFeed"] as const,
            feedkey: (feedKey: string) =>
                [...getFeedKeys.all, feedKey] as const,
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
            if (hasMore.current) {
                setLoadMoreFeed(true)
            }
        }, [hasMore.current])

        const checkNewTimeline = useCheckNewTimeline(
            agent,
            feedKey,
            FEED_FETCH_LIMIT,
            userProfileDetailed,
            hideRepost,
            shouldCheckUpdate,
            latestCID,
            setNewTimeline,
            setHasUpdate,
            setHasError,
            muteWords
        )

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

            setTimeline(mergedTimeline as FeedViewPost[])
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

        const handleFetchResponse = useCallback(
            (response: FeedResponseObject) => {
                if (response) {
                    const { posts, cursor } = response
                    if (posts.length === 0 || cursor === "")
                        isEndOfFeed.current = true
                    cursorState.current = response.cursor

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
                    console.log("filteredData", filteredData)
                    const muteWordFilter = useFilterPosts(
                        filteredData,
                        muteWords
                    ) as FeedViewPost[]

                    if (timeline === null) {
                        if (muteWordFilter.length > 0) {
                            latestCID.current = (
                                muteWordFilter[0].post as PostView
                            ).cid
                        }
                    }

                    setTimeline((currentTimeline: FeedViewPost[] | null) => {
                        if (currentTimeline !== null) {
                            return [...currentTimeline, ...muteWordFilter]
                        } else {
                            return muteWordFilter
                        }
                    })
                } else {
                    setTimeline([])
                    hasMore.current = false
                    return
                }

                cursorState.current = response.cursor

                hasMore.current = cursorState.current !== ""
            },
            []
        )

        const getTimelineFetcher = async ({
            queryKey,
        }: QueryFunctionContext<
            ReturnType<(typeof getFeedKeys)["feedkeyWithCursor"]>
        >): Promise<FeedResponseObject> => {
            // console.log("getTimelineFetcher: >>")

            if (!agent) throw new Error("Agent does not exist")

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [_key, feedKey] = queryKey

            if (feedKey === "following") {
                const response = await agent.getTimeline({
                    cursor: cursorState.current || "",
                    limit: FEED_FETCH_LIMIT,
                })

                console.log(response.data.feed)

                return {
                    posts: response.data.feed,
                    cursor: response.data.cursor || "",
                }
            } else {
                const response = await agent.app.bsky.feed.getFeed({
                    feed: feedKey,
                    cursor: cursorState.current || "",
                    limit: FEED_FETCH_LIMIT,
                })

                return {
                    posts: response.data.feed,
                    cursor: response.data.cursor || "",
                }
            }
        }

        const { data /*isLoading, isError*/ } = useQuery({
            queryKey: getFeedKeys.feedkeyWithCursor(
                feedKey,
                cursorState.current || ""
            ),
            queryFn: getTimelineFetcher,
            select: (fishes) => {
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

        const handleValueChange = useHandleValueChange(timeline, setTimeline)

        const handleSaveScrollPosition = useSaveScrollPosition(
            isActive,
            virtuosoRef,
            pageName,
            feedKey,
            scrollPositions,
            setScrollPositions
        )

        if (data !== undefined && !isEndOfFeed.current) {
            console.log(data)
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
                    const muteWordFilter = useFilterPosts(
                        filteredData,
                        muteWords
                    )
                    //@ts-ignore FeedViewPost[]でなければreturnするので、ここでの型は問題ない
                    const mergedTimeline = mergePosts(muteWordFilter, timeline)

                    //@ts-ignore FeedViewPost[]でなければreturnするので、ここでの型は問題ない
                    setTimeline(mergedTimeline)
                    setNewTimeline([])
                    setHasUpdate(false)

                    if (mergedTimeline.length > 0) {
                        latestCID.current = (
                            mergedTimeline[0].post as PostView
                        ).cid
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
                    disabled={isScrolling.current && scrollIndex.current > 0}
                >
                    {hasError && (
                        <>
                            <DummyHeader />
                            <div className={"w-full h-[50ox] bg-white"}>
                                <div>Error code: {hasError?.status}</div>
                                <div>Error: {hasError?.error}</div>
                            </div>
                        </>
                    )}
                    {!hasError && (
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
                            restoreStateFrom={
                                scrollPositions[`${pageName}-${feedKey}`]
                            }
                            rangeChanged={(range) => {
                                scrollIndex.current = range.startIndex
                            }}
                            context={{ hasMore: hasMore.current }}
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
                                                handleValueChange:
                                                    handleValueChange,
                                                handleSaveScrollPosition:
                                                    handleSaveScrollPosition,
                                                isViaUFeed: isViaUFeed,
                                                zenMode: zenMode,
                                            }}
                                        />
                                    ) : (
                                        <ViewPostCardSkelton
                                            zenMode={zenMode}
                                        />
                                    )}
                                </>
                            )}
                            components={{
                                Header: () => <DummyHeader />,
                            }}
                            endReached={loadMore}
                            className={notNulltimeline()}
                        />
                    )}
                    <ScrollToTopButton
                        scrollRef={scrollRef}
                        scrollIndex={scrollIndex.current}
                    />
                </SwipeRefreshList>
            </>
        )
    }
)

export default FeedPage
