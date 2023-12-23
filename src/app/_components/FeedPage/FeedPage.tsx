import { Virtuoso } from "react-virtuoso"
import { isMobile } from "react-device-detect"
import { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { useCallback, useEffect, useRef, useState } from "react"
import { useAgent } from "@/app/_atoms/agent"
import { AppBskyFeedGetTimeline } from "@atproto/api"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowsRotate } from "@fortawesome/free-solid-svg-icons"
import { useNextQueryParamsAtom } from "@/app/_atoms/nextQueryParams"
import { ListFooterSpinner } from "../ListFooterSpinner"
import { filterDisplayPosts } from "@/app/_lib/feed/filterDisplayPosts"
import { useTranslation } from "react-i18next"
import { mergePosts } from "@/app/_lib/feed/mergePosts"
import {
    QueryFunctionContext,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query"
import { ListFooterNoContent } from "@/app/_components/ListFooterNoContent"
import { ViewPostCard } from "../ViewPostCard"
import { processPostBodyText } from "@/app/_lib/post/processPostBodyText"
import { tabBarSpaceStyles } from "@/app/_components/TabBar/tabBarSpaceStyles"
import { useWordMutes } from "@/app/_atoms/wordMute"
import { useUserProfileDetailedAtom } from "@/app/_atoms/userProfileDetail"
import { useScrollPositions } from "@/app/_atoms/scrollPosition"

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
    const { nullTimeline, notNulltimeline } = tabBarSpaceStyles()
    const [muteWords] = useWordMutes()
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

    const getFeedKeys = {
        all: ["getFeed"] as const,
        feedkey: (feedKey: string) => [...getFeedKeys.all, feedKey] as const,
        feedkeyWithCursor: (feedKey: string, cursor: string) =>
            [...getFeedKeys.feedkey(feedKey), cursor] as const,
    }

    useEffect(() => {
        //console.log(shouldScrollToTop.current, scrollRef.current)

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
            const shouldInclude = muteWords.some((muteWord) => {
                if (post.post?.embed?.record) {
                    const embedRecord = post.post.embed.record
                    if (muteWord.isActive) {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        return embedRecord?.value?.text.includes(muteWord.word)
                    } else {
                        return false
                    }
                } else {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    return post.post.record?.text.includes(muteWord.word)
                }
            })

            return !shouldInclude
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
                        ? filterDisplayPosts(feed, userProfileDetailed, agent)
                        : feed

                const muteWordFilter = filterPosts(filteredData)

                // console.log(`check new ${feedKey}`, filteredData)
                // console.log(`timeline ${feedKey}`, timeline)

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

    const initialLoad = async () => {
        if (!agent) return
        console.log("initial")
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
                        ? filterDisplayPosts(feed, userProfileDetailed, agent)
                        : feed

                const muteWordFilter = filterPosts(filteredData)

                setTimeline(muteWordFilter)

                if (muteWordFilter.length > 0) {
                    latestCID.current = muteWordFilter[0].post.cid
                }
            }
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        console.log(latestCID.current)
    }, [latestCID.current])

    useEffect(() => {
        if (!agent) return
        if (!isActive) {
            return
        }

        if (!shouldCheckUpdate.current) {
            shouldCheckUpdate.current = true
            void initialLoad()
            //void checkNewTimeline()
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

        setTimeline(mergedTimeline)
        setNewTimeline([])
        setHasUpdate(false)

        if (mergedTimeline.length > 0) {
            latestCID.current = mergedTimeline[0].post.cid
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
                    ? filterDisplayPosts(posts, userProfileDetailed, agent)
                    : posts

            const muteWordFilter = filterPosts(filteredData)

            console.log("filteredData", filteredData)
            console.log("muteWordFilter", muteWordFilter)

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
        const foundObject = timeline.findIndex(
            (item) => item.post.uri === newValue.postUri
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
        // console.log(`useQuery: data.cursor: ${data.cursor}`)
        handleFetchResponse(data)
        setLoadMoreFeed(false)
    }

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
            {timeline === null && (
                <Virtuoso
                    overscan={200}
                    increaseViewportBy={200}
                    totalCount={20}
                    initialItemCount={20}
                    atTopThreshold={100}
                    atBottomThreshold={100}
                    itemContent={(index) => (
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
                    className={nullTimeline()}
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
                    ref={virtuosoRef}
                    //@ts-ignore
                    restoreStateFrom={scrollPositions[`${pageName}-${feedKey}`]}
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
                                handleValueChange: handleValueChange,
                                handleSaveScrollPosition:
                                    handleSaveScrollPosition,
                                isViaUFeed: isViaUFeed,
                            }}
                        />
                    )}
                    components={{
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        Footer: !isEndOfFeed
                            ? ListFooterSpinner
                            : ListFooterNoContent,
                    }}
                    endReached={loadMore}
                    // onScroll={(e) => disableScrollIfNeeded(e)}
                    //className="overflow-y-auto"
                    className={notNulltimeline()}
                />
            )}
        </>
    )
}

export default FeedPage
