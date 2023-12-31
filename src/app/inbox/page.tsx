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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowsRotate } from "@fortawesome/free-solid-svg-icons"
import { useNextQueryParamsAtom } from "@/app/_atoms/nextQueryParams"
import { ListFooterSpinner } from "@/app/_components/ListFooterSpinner"
import { useTranslation } from "react-i18next"
import { mergePosts } from "@/app/_lib/feed/mergePosts"
import {
    QueryFunctionContext,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query"
import { ListFooterNoContent } from "@/app/_components/ListFooterNoContent"
import { ViewPostCard } from "@/app/_components/ViewPostCard"
import { processPostBodyText } from "@/app/_lib/post/processPostBodyText"
import { tabBarSpaceStyles } from "@/app/_components/TabBar/tabBarSpaceStyles"
import { useScrollPositions } from "@/app/_atoms/scrollPosition"
import { useUnreadNotificationAtom } from "@/app/_atoms/unreadNotifications"
import { useCurrentMenuType } from "@/app/_atoms/headerMenu"
import { Notification } from "@atproto/api/dist/client/types/app/bsky/notification/listNotifications"
import { DummyHeader } from "@/app/_components/DummyHeader"

const CHECK_FEED_UPDATE_INTERVAL: number = 10 * 1000

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
    const { nullTimeline, notNulltimeline } = tabBarSpaceStyles()
    const [timeline, setTimeline] = useState<PostView[] | null>(null)
    const [newTimeline, setNewTimeline] = useState<PostView[]>([])
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
    const feedKey = "Inbox"
    const pageName = "Inbox"

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

    const checkNewTimeline = async () => {
        if (!agent) return
        shouldCheckUpdate.current = false

        try {
            const { data } = await agent.countUnreadNotifications()
            const { count } = data
            console.log(count)
            if (count == 0) return

            const notifData = await agent.listNotifications({
                cursor: "",
            })

            if (data) {
                const { notifications } = notifData.data

                const replies = notifications.filter((notification) => {
                    return (
                        !notification.isRead &&
                        (notification.reason === "reply" ||
                            notification.reason === "mention")
                    )
                })

                setNewTimeline(replies)

                if (replies.length > 0) {
                    console.log(
                        "new and old cid",
                        feedKey,
                        replies[0].cid,
                        latestCID.current
                    )
                    if (
                        replies[0].cid !== latestCID.current &&
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
    }, [agent])

    const queryClient = useQueryClient()

    const handleUpdateSeen = async () => {
        if (!agent) return
        try {
            await agent.updateSeenNotifications()
        } catch (e) {
            console.log(e)
        }
    }

    const handleRefresh = async () => {
        if (!agent) return
        shouldScrollToTop.current = true

        const mergedTimeline = mergePosts(newTimeline, timeline)
        //@ts-ignore
        setTimeline(mergedTimeline)
        setNewTimeline([])
        setHasUpdate(false)

        if (mergedTimeline.length > 0) {
            latestCID.current = (mergedTimeline[0] as PostView).cid
        }
        void handleUpdateSeen()
        await queryClient.refetchQueries({
            queryKey: ["getNotification", feedKey],
        })

        shouldCheckUpdate.current = true
    }

    const handleFetchResponse = (response: FeedResponseObject) => {
        if (response) {
            const { posts, cursor, notifications } = response
            if (notifications.length === 0) {
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
        const [_key, feedKey] = queryKey

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
                            updatedData[foundObject].post &&
                            updatedData[foundObject].post.viewer
                        ) {
                            updatedData[foundObject].post.viewer.like =
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
                            updatedData[foundObject].post &&
                            updatedData[foundObject].post.viewer
                        ) {
                            updatedData[foundObject].post.viewer.like =
                                undefined
                        }
                        return updatedData
                    })
                    break
                case "repost":
                    setTimeline((prevData) => {
                        const updatedData = [...prevData]
                        if (
                            updatedData[foundObject] &&
                            updatedData[foundObject].post &&
                            updatedData[foundObject].post.viewer
                        ) {
                            updatedData[foundObject].post.viewer.repost =
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
                            updatedData[foundObject].post &&
                            updatedData[foundObject].post.viewer
                        ) {
                            updatedData[foundObject].post.viewer.repost =
                                undefined
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

    return (
        <>
            {hasUpdate && (
                <div
                    className={
                        "absolute flex justify-center z-[10] left-16 right-16 md:top-[120px] top-[100px] lg:top-[70px]"
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
            <Virtuoso
                scrollerRef={(ref) => {
                    if (ref instanceof HTMLElement) {
                        scrollRef.current = ref
                        // setListScrollRefAtom(ref)
                    }
                }}
                ref={virtuosoRef}
                //@ts-ignore
                restoreStateFrom={scrollPositions[`${pageName}-${feedKey}`]}
                context={{ hasMore }}
                increaseViewportBy={200}
                overscan={200}
                data={timeline ?? undefined}
                totalCount={timeline ? timeline.length : 20}
                atTopThreshold={100}
                atBottomThreshold={100}
                itemContent={(index, post) => (
                    <>
                        {post ? (
                            <ViewPostCard
                                key={`feed-${post.uri}`}
                                {...{
                                    isMobile,
                                    isSkeleton: false,
                                    bodyText: processPostBodyText(
                                        nextQueryParams,
                                        post || null
                                    ),
                                    postJson: post,
                                    nextQueryParams,
                                    t,
                                    handleValueChange: handleValueChange,
                                    handleSaveScrollPosition:
                                        handleSaveScrollPosition,
                                }}
                            />
                        ) : (
                            <ViewPostCard
                                {...{
                                    isMobile,
                                    isSkeleton: true,
                                    bodyText: undefined,
                                    nextQueryParams,
                                    t,
                                }}
                            />
                        )}
                    </>
                )}
                components={{
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    Footer: !isEndOfFeed
                        ? ListFooterSpinner
                        : ListFooterNoContent,
                    Header: () => <DummyHeader />,
                }}
                endReached={loadMore}
                // onScroll={(e) => disableScrollIfNeeded(e)}
                //className="overflow-y-auto"
                className={notNulltimeline()}
            />
        </>
    )
}
