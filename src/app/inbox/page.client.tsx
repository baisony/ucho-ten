"use client"
import { Virtuoso } from "react-virtuoso"
import { isMobile } from "react-device-detect"
import { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react"
import { useAgent } from "@/app/_atoms/agent"
import { useNextQueryParamsAtom } from "@/app/_atoms/nextQueryParams"
import { useTranslation } from "react-i18next"
import { mergePosts } from "@/app/_lib/feed/mergePosts"
import {
    QueryFunctionContext,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query"
import { ViewPostCard } from "@/app/_components/ViewPostCard"
import { processPostBodyText } from "@/app/_lib/post/processPostBodyText"
import { tabBarSpaceStyles } from "@/app/_components/TabBar/tabBarSpaceStyles"
import { useScrollPositions } from "@/app/_atoms/scrollPosition"
import { useUnreadNotificationAtom } from "@/app/_atoms/unreadNotifications"
import { Notification } from "@atproto/api/dist/client/types/app/bsky/notification/listNotifications"
import { DummyHeader } from "@/app/_components/DummyHeader"
import { SwipeRefreshList } from "react-swipe-down-refresh"
import "@/app/_components/FeedPage/SwipeRefreshListStyle.css"

import { SwiperSlide } from "swiper/react"
import SwiperCore from "swiper/core"
import { Virtual } from "swiper/modules"
import {
    useCurrentMenuType,
    useHeaderMenusByHeaderAtom,
} from "../_atoms/headerMenu"

import "swiper/css"
import "swiper/css/pagination"
import { SwiperEmptySlide } from "@/app/_components/SwiperEmptySlide"
import ViewPostCardSkelton from "@/app/_components/ViewPostCard/ViewPostCardSkelton"
import { SwiperContainer } from "@/app/_components/SwiperContainer"
import { useZenMode } from "@/app/_atoms/zenMode"
import { ScrollToTopButton } from "@/app/_components/ScrollToTopButton"

SwiperCore.use([Virtual])

interface FeedResponseObject {
    posts: PostView[]
    cursor: string // TODO: should consider adding ? to handle undefined.
    notifications: Notification[]
}

export default function FeedPage() {
    const [, setCurrentMenuType] = useCurrentMenuType()
    const { t } = useTranslation()
    const [agent] = useAgent()
    const [nextQueryParams] = useNextQueryParamsAtom()
    const [unreadNotification, setUnreadNotification] =
        useUnreadNotificationAtom()
    const { notNulltimeline } = tabBarSpaceStyles()
    const [timeline, setTimeline] = useState<PostView[] | null>(null)
    const [hasMore, setHasMore] = useState<boolean>(false)
    const [hasUpdate, setHasUpdate] = useState<boolean>(false)
    const [loadMoreFeed, setLoadMoreFeed] = useState<boolean>(true)
    const [cursorState, setCursorState] = useState<string>()
    const [isEndOfFeed, setIsEndOfFeed] = useState<boolean>(false) // TODO: should be implemented.

    const scrollRef = useRef<HTMLElement | null>(null)
    const shouldScrollToTop = useRef<boolean>(false)
    const latestCID = useRef<string>("")

    const virtuosoRef = useRef(null)
    const [scrollPositions, setScrollPositions] = useScrollPositions()
    const feedKey = "Inbox"
    const pageName = "Inbox"
    const isScrolling = useRef<boolean>(false)
    const [scrollIndex, setScrollIndex] = useState<number>(0)

    const [menus] = useHeaderMenusByHeaderAtom()
    const [zenMode] = useZenMode()

    useLayoutEffect(() => {
        setCurrentMenuType("inbox")
    }, [])

    const getFeedKeys = {
        all: ["getNotification"] as const,
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

    const queryClient = useQueryClient()

    const handleUpdateSeen = async () => {
        if (!agent) return
        try {
            await agent.updateSeenNotifications()
            setUnreadNotification(0)
        } catch (e) {
            console.log(e)
        }
    }

    const handleFetchResponse = (response: FeedResponseObject) => {
        if (response) {
            const { posts, notifications, cursor } = response
            if (notifications.length === 0 || cursor === "") {
                setIsEndOfFeed(true)
            }
            setCursorState(response.cursor)

            console.log("posts", posts)

            const muteWordFilter = posts

            //console.log("filteredData", filteredData)
            console.log("muteWordFilter", muteWordFilter)

            if (timeline === null) {
                if (muteWordFilter.length > 0) {
                    latestCID.current = muteWordFilter[0].cid
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
        if (agent === null) {
            throw new Error("Agent does not exist")
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_key] = queryKey

        const { data } = await agent.listNotifications({
            cursor: cursorState || "",
        })

        const reply = data.notifications.filter((notification) => {
            return (
                notification.reason === "reply" ||
                notification.reason === "mention"
            )
        })

        const dividedReplyNotifications = []

        for (let i = 0; i < reply.length; i += 25) {
            dividedReplyNotifications.push(reply.slice(i, i + 25))
        }

        const allPosts: PostView[] = []

        for (const dividedNotifications of dividedReplyNotifications) {
            const posts = await agent.getPosts({
                uris: dividedNotifications.map(
                    (notification) => notification.uri
                ),
            })
            allPosts.push(...posts.data.posts)
        }

        return {
            posts: allPosts,
            cursor: data.cursor || "",
            notifications: data.notifications,
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
        enabled: agent !== null && (loadMoreFeed || timeline?.length === 0),
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    })

    const handleValueChange = (newValue: any) => {
        if (!timeline) return
        const foundObject = timeline.findIndex(
            (post) => post.uri === newValue.postUri
        )
        console.log(newValue.postUri)
        console.log(foundObject)

        if (foundObject !== -1) {
            // console.log(timeline[foundObject])
            switch (newValue.reaction) {
                case "like":
                    setTimeline((prevData) => {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        //@ts-ignore
                        const updatedData = [...prevData]
                        if (
                            updatedData[foundObject] &&
                            updatedData[foundObject].viewer
                        ) {
                            updatedData[foundObject].viewer.like =
                                newValue.reactionUri
                        }
                        return updatedData
                    })
                    break
                case "unlike":
                    setTimeline((prevData) => {
                        const updatedData = [...prevData]
                        if (
                            updatedData[foundObject] &&
                            updatedData[foundObject].viewer
                        ) {
                            updatedData[foundObject].viewer.like = undefined
                        }
                        return updatedData
                    })
                    break
                case "repost":
                    setTimeline((prevData) => {
                        const updatedData = [...prevData]
                        if (
                            updatedData[foundObject] &&
                            updatedData[foundObject].viewer
                        ) {
                            updatedData[foundObject].viewer.repost =
                                newValue.reactionUri
                        }
                        return updatedData
                    })
                    break
                case "unrepost":
                    setTimeline((prevData) => {
                        const updatedData = [...prevData]
                        if (
                            updatedData[foundObject] &&
                            updatedData[foundObject].viewer
                        ) {
                            updatedData[foundObject].viewer.repost = undefined
                        }
                        return updatedData
                    })
                    break
                case "delete":
                    setTimeline((prevData) => {
                        const updatedData = [...prevData]
                        updatedData.splice(foundObject, 1)
                        return updatedData
                    })
                //timeline.splice(foundObject, 1)
            }
            // console.log(timeline)
        } else {
            console.log(
                "指定されたURIを持つオブジェクトは見つかりませんでした。"
            )
        }
    }

    const handleSaveScrollPosition = () => {
        console.log("save")
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
        // console.log(`useQuery: data.cursor: ${data.cursor}`)
        handleFetchResponse(data)
        setLoadMoreFeed(false)
    }

    useEffect(() => {
        if (unreadNotification > 0) {
            void handleUpdateSeen()
            setUnreadNotification(0)
        }
    }, [])

    const lazyCheckNewTimeline = async () => {
        if (agent === null) return
        try {
            const { data } = await agent.countUnreadNotifications()
            const { count } = data
            console.log(count)
            if (count == 0) return

            const notifData = await agent.listNotifications({
                cursor: "",
            })

            let replies: Notification[] = []
            if (data) {
                const { notifications } = notifData.data

                replies = notifications.filter((notification) => {
                    return (
                        !notification.isRead &&
                        (notification.reason === "reply" ||
                            notification.reason === "mention")
                    )
                })
            }
            const mergedTimeline = mergePosts(replies, timeline)
            //@ts-ignore
            setTimeline(mergedTimeline)
            setHasUpdate(false)

            if (mergedTimeline.length > 0) {
                latestCID.current = (mergedTimeline[0] as PostView).cid
            }
            void handleUpdateSeen()
            await queryClient.refetchQueries({
                queryKey: ["getNotification", feedKey],
            })
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <SwiperContainer props={{ page: "inbox" }}>
            {menus.inbox.map((menu, index) => {
                return (
                    <>
                        <SwiperSlide key={`swiperslide-home-${index}`}>
                            <div
                                id={`swiperIndex-div-${index}`}
                                key={index}
                                style={{
                                    overflowY: "auto",
                                    height: "100%",
                                }}
                            >
                                <main className={"h-full w-full"}>
                                    <SwipeRefreshList
                                        onRefresh={async () => {
                                            await lazyCheckNewTimeline()
                                        }}
                                        className={
                                            "swiperRefresh h-full w-full"
                                        }
                                        threshold={150}
                                        disabled={
                                            isScrolling.current &&
                                            scrollIndex > 0
                                        }
                                    >
                                        <Virtuoso
                                            scrollerRef={(ref) => {
                                                if (
                                                    ref instanceof HTMLElement
                                                ) {
                                                    scrollRef.current = ref
                                                    // setListScrollRefAtom(ref)
                                                }
                                            }}
                                            ref={virtuosoRef}
                                            restoreStateFrom={
                                                scrollPositions[
                                                    //@ts-ignore
                                                    `${pageName}-${feedKey}`
                                                ]
                                            }
                                            rangeChanged={(range) => {
                                                setScrollIndex(range.startIndex)
                                            }}
                                            context={{ hasMore }}
                                            isScrolling={(e) => {
                                                isScrolling.current = e
                                            }}
                                            increaseViewportBy={200}
                                            overscan={200}
                                            data={timeline ?? undefined}
                                            totalCount={
                                                timeline ? timeline.length : 20
                                            }
                                            atTopThreshold={100}
                                            atBottomThreshold={100}
                                            itemContent={(index, post) => (
                                                <>
                                                    {post ? (
                                                        <ViewPostCard
                                                            key={`feed-${post.uri}`}
                                                            {...{
                                                                isMobile,
                                                                isSkeleton:
                                                                    false,
                                                                bodyText:
                                                                    processPostBodyText(
                                                                        nextQueryParams,
                                                                        post ||
                                                                            null
                                                                    ),
                                                                postJson: post,
                                                                nextQueryParams,
                                                                t,
                                                                handleValueChange:
                                                                    handleValueChange,
                                                                handleSaveScrollPosition:
                                                                    handleSaveScrollPosition,
                                                                zenMode:
                                                                    zenMode,
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
                                            // onScroll={(e) => disableScrollIfNeeded(e)}
                                            //className="overflow-y-auto"
                                            className={notNulltimeline()}
                                        />
                                        <ScrollToTopButton
                                            scrollRef={scrollRef}
                                            scrollIndex={scrollIndex}
                                        />
                                    </SwipeRefreshList>
                                </main>
                            </div>
                        </SwiperSlide>
                        <SwiperSlide>
                            <SwiperEmptySlide />
                        </SwiperSlide>
                    </>
                )
            })}
        </SwiperContainer>
    )
}
