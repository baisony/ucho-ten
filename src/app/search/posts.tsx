import { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { useUserProfileDetailedAtom } from "@/app/_atoms/userProfileDetail"
import { useWordMutes } from "@/app/_atoms/wordMute"
import { tabBarSpaceStyles } from "@/app/_components/TabBar/tabBarSpaceStyles"
import { useCallback, useEffect, useRef, useState } from "react"
import { useScrollPositions } from "@/app/_atoms/scrollPosition"
import { filterDisplayPosts } from "@/app/_lib/feed/filterDisplayPosts"
import {
    QueryFunctionContext,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query"
import { Virtuoso, VirtuosoHandle } from "react-virtuoso"
import { ViewPostCard } from "@/app/_components/ViewPostCard"
import { isMobile } from "react-device-detect"
import { processPostBodyText } from "@/app/_lib/post/processPostBodyText"
import { DummyHeader } from "@/app/_components/DummyHeader"
import { BskyAgent } from "@atproto/api"
import { useSearchParams } from "next/navigation"
import ViewPostCardSkelton from "@/app/_components/ViewPostCard/ViewPostCardSkelton"
import { useZenMode } from "@/app/_atoms/zenMode"
import { ScrollToTopButton } from "@/app/_components/ScrollToTopButton"
import { useFilterPosts } from "@/app/_lib/useFilterPosts"
import { TFunction } from "i18next"

interface FeedResponseObject {
    posts: PostView[]
    cursor: string // TODO: should consider adding ? to handle undefined.
}

interface SearchPostPageProps {
    isActive: boolean
    t: TFunction
    nextQueryParams: URLSearchParams
    agent: BskyAgent | null
    searchText: string
}

const SearchPostPage = ({
    agent,
    isActive,
    t,
    nextQueryParams,
    searchText,
}: SearchPostPageProps) => {
    const searchParams = useSearchParams()
    const [userProfileDetailed] = useUserProfileDetailedAtom()
    const [muteWords] = useWordMutes()
    const { notNulltimeline } = tabBarSpaceStyles()
    const [timeline, setTimeline] = useState<PostView[] | null>(null)
    const [, setNewTimeline] = useState<PostView[]>([])
    const [hasMore, setHasMore] = useState<boolean>(false)
    const [, setHasUpdate] = useState<boolean>(false)
    const [loadMoreFeed, setLoadMoreFeed] = useState<boolean>(true)
    const [cursorState, setCursorState] = useState<string>()
    const [isEndOfFeed, setIsEndOfFeed] = useState<boolean>(false) // TODO: should be implemented.
    const searchTextRef = useRef<string>(searchText)

    const scrollRef = useRef<HTMLElement | null>(null)
    const shouldScrollToTop = useRef<boolean>(false)
    const latestCID = useRef<string>("")
    const shouldCheckUpdate = useRef<boolean>(false)
    const [scrollIndex, setScrollIndex] = useState<number>(0)

    const virtuosoRef = useRef<VirtuosoHandle | null>(null)
    const [scrollPositions, setScrollPositions] = useScrollPositions()
    const feedKey = `Posts`
    const pageName = "search"

    const [zenMode] = useZenMode()

    const FEED_FETCH_LIMIT = 25
    const CHECK_FEED_UPDATE_INTERVAL: number = 10 * 1000

    const getFeedKeys = {
        all: ["getSearch"] as const,
        feedkey: (feedKey: string | null) =>
            [...getFeedKeys.all, feedKey] as const,
        feedkeyWithCursor: (feedKey: string | null, cursor: string) =>
            [...getFeedKeys.feedkey(feedKey), cursor] as const,
    }

    useEffect(() => {
        if (searchTextRef.current !== searchParams.get("word")) {
            searchTextRef.current = searchParams.get("word") || ""
            setTimeline(null)
            setNewTimeline([])
            setHasMore(false)
            setHasUpdate(false)
            setLoadMoreFeed(true)
            setIsEndOfFeed(false)
            setCursorState("")
            latestCID.current = ""
            shouldCheckUpdate.current = false
            shouldScrollToTop.current = true
            const refetch = async () => {
                await queryClient.removeQueries({
                    queryKey: ["getSearch", feedKey],
                })
            }
            void refetch()
        }
    }, [searchParams])

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

    const checkNewTimeline = async () => {
        if (!agent) return
        shouldCheckUpdate.current = false

        try {
            const response = await agent.app.bsky.feed.searchPosts({
                q: searchTextRef.current,
                limit: FEED_FETCH_LIMIT,
                cursor: "",
            })

            const { data } = response

            if (data) {
                const { posts } = data
                const filteredData = filterDisplayPosts(
                    posts,
                    userProfileDetailed,
                    agent
                )
                const muteWordFilter = useFilterPosts(filteredData, muteWords)
                //@ts-ignore
                setNewTimeline(muteWordFilter)

                if (muteWordFilter.length > 0) {
                    if (
                        muteWordFilter[0].cid !== latestCID.current &&
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

    const handleFetchResponse = (response: FeedResponseObject) => {
        if (response) {
            const { posts, cursor } = response
            if (posts.length === 0 || cursor === "") setIsEndOfFeed(true)
            setCursorState(response.cursor)

            console.log("posts", posts)

            const filteredData = filterDisplayPosts(
                posts,
                userProfileDetailed,
                agent
            )
            const muteWordFilter = useFilterPosts(filteredData, muteWords)

            console.log("filteredData", filteredData)
            console.log("muteWordFilter", muteWordFilter)

            if (timeline === null) {
                if (muteWordFilter.length > 0) {
                    latestCID.current = muteWordFilter[0].cid as string
                }
            }

            setTimeline((currentTimeline: any) => {
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
        console.log("fetch search posts")
        if (agent === null) {
            // console.log("error")
            throw new Error("Agent does not exist")
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_key] = queryKey

        const response = await agent.app.bsky.feed.searchPosts({
            q: searchTextRef.current,
            cursor: cursorState || "",
            limit: FEED_FETCH_LIMIT,
        })

        return {
            posts: response.data.posts,
            cursor: response.data.cursor || "",
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
        enabled: agent !== null && isActive /*shouldLoad */ && loadMoreFeed,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    })

    const handleValueChange = (newValue: any) => {
        if (!timeline) return
        const foundObject = timeline.findIndex(
            (item) => item.uri === newValue.postUri
        )

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
            }
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

    return (
        <div className={"w-full h-full"}>
            <Virtuoso
                scrollerRef={(ref) => {
                    if (ref instanceof HTMLElement) {
                        scrollRef.current = ref
                    }
                }}
                ref={virtuosoRef}
                restoreStateFrom={
                    //@ts-ignore
                    scrollPositions[`search-posts-${searchTextRef.current}`]
                }
                rangeChanged={(range) => {
                    setScrollIndex(range.startIndex)
                }}
                context={{ hasMore }}
                overscan={200}
                increaseViewportBy={200}
                data={timeline ?? undefined}
                totalCount={timeline ? timeline.length : 20}
                atTopThreshold={100}
                atBottomThreshold={100}
                itemContent={(index, data) => (
                    <>
                        {data ? (
                            <ViewPostCard
                                key={data.uri}
                                {...{
                                    isMobile,
                                    isSkeleton: false,
                                    bodyText: processPostBodyText(
                                        nextQueryParams,
                                        data || null
                                    ),
                                    postJson: data || null,
                                    nextQueryParams,
                                    t,
                                    handleValueChange: handleValueChange,
                                    handleSaveScrollPosition:
                                        handleSaveScrollPosition,
                                    zenMode,
                                }}
                            />
                        ) : (
                            <ViewPostCardSkelton zenMode />
                        )}
                    </>
                )}
                components={{
                    Header: () => <DummyHeader isSearchScreen={true} />,
                }}
                endReached={loadMore}
                className={notNulltimeline()}
            />
            <ScrollToTopButton
                scrollRef={scrollRef}
                scrollIndex={scrollIndex}
            />
        </div>
    )
}
export default SearchPostPage
