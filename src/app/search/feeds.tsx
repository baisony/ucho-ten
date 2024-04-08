import { layout } from "@/app/search/styles"
import { tabBarSpaceStyles } from "@/app/_components/TabBar/tabBarSpaceStyles"
import { useCallback, useEffect, useRef, useState } from "react"
import { useScrollPositions } from "@/app/_atoms/scrollPosition"
import {
    QueryFunctionContext,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query"
import { Virtuoso, VirtuosoHandle } from "react-virtuoso"
import { DummyHeader } from "@/app/_components/DummyHeader"
import { BskyAgent } from "@atproto/api"
import { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs"
import { Skeleton } from "@nextui-org/react"
import { useSearchParams } from "next/navigation"
import { GeneratorView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { ViewFeedCardCell } from "@/app/_components/ViewFeedCard/ViewFeedtCardCell"
import { isMobile } from "react-device-detect"
import { ScrollToTopButton } from "@/app/_components/ScrollToTopButton"
import { TFunction } from "i18next"
import { useSaveScrollPosition } from "@/app/_components/FeedPage/hooks/useSaveScrollPosition"

interface FeedResponseObject {
    feeds: GeneratorView[]
    cursor: string // TODO: should consider adding ? to handle undefined.
}

interface SearchPostPageProps {
    isActive: boolean
    t: TFunction
    nextQueryParams: URLSearchParams
    agent: BskyAgent | null
    searchText: string
}

const SearchFeedPage = ({
    agent,
    isActive,
    t,
    nextQueryParams,
    searchText,
}: SearchPostPageProps) => {
    const { notNulltimeline } = tabBarSpaceStyles()
    const [timeline, setTimeline] = useState<GeneratorView[] | null>(null)
    const [hasMore, setHasMore] = useState<boolean>(false)
    const [loadMoreFeed, setLoadMoreFeed] = useState<boolean>(true)
    const [cursorState, setCursorState] = useState<string>()
    const [isEndOfFeed, setIsEndOfFeed] = useState<boolean>(false) // TODO: should be implemented.

    const scrollRef = useRef<HTMLElement | null>(null)
    const shouldScrollToTop = useRef<boolean>(false)
    const latestCID = useRef<string>("")
    const shouldCheckUpdate = useRef<boolean>(false)
    const [scrollIndex, setScrollIndex] = useState<number>(0)

    const virtuosoRef = useRef<VirtuosoHandle | null>(null)
    const [scrollPositions, setScrollPositions] = useScrollPositions()
    const feedKey = `Feeds`
    const pageName = "search"

    const searchTextRef = useRef<string>(searchText)
    const queryClient = useQueryClient()
    const searchParams = useSearchParams()

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
            setHasMore(false)
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

    const handleFetchResponse = (response: FeedResponseObject) => {
        console.log(response)
        if (response) {
            const { feeds, cursor } = response
            if (feeds.length === 0 || cursor === "") setIsEndOfFeed(true)
            setCursorState(response.cursor)

            if (timeline === null) {
                if (feeds.length > 0) {
                    latestCID.current = feeds[0].did
                }
            }

            setTimeline((currentTimeline) => {
                if (currentTimeline !== null) {
                    return [...currentTimeline, ...feeds]
                } else {
                    return [...feeds]
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
        const [_key] = queryKey

        const response =
            await agent.app.bsky.unspecced.getPopularFeedGenerators({
                cursor: cursorState || "",
                query: searchText,
            })

        console.log(response)
        return {
            feeds: response.data.feeds,
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
        enabled: agent !== null && isActive && loadMoreFeed,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    })

    const handleSaveScrollPosition = useSaveScrollPosition(
        isActive,
        virtuosoRef,
        pageName,
        feedKey,
        scrollPositions,
        setScrollPositions
    )

    if (data !== undefined && !isEndOfFeed && isActive) {
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
                restoreStateFrom={scrollPositions[`search-posts-${searchText}`]}
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
                            <ViewFeedCardCell
                                key={data.uri}
                                {...{
                                    isMobile,
                                    isSkeleton: false,
                                    feed: data || null,
                                    nextQueryParams,
                                    t,
                                    handleSaveScrollPosition:
                                        handleSaveScrollPosition,
                                }}
                            />
                        ) : (
                            <UserCell
                                {...{
                                    actor: null,
                                    skeleton: true,
                                }}
                            />
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

interface UserCellProps {
    actor: ProfileView | null
    onClick?: () => void
    skeleton?: boolean
    //index?: number
}

const UserCell = ({ onClick, skeleton }: UserCellProps) => {
    const { userCard } = layout()

    return (
        <>
            <div
                onClick={onClick}
                className={`${userCard()}`}
                style={{ cursor: skeleton ? "default" : "pointer" }}
            >
                <div
                    className={
                        "h-[35px] w-[35px] rounded-full ml-[10px] overflow-hidden"
                    }
                >
                    <Skeleton
                        className={`h-full w-full`}
                        style={{ borderRadius: "10px" }}
                    />
                </div>
                <div
                    className={
                        "h-[75px] w-[calc(100%-50px)] pl-[10px] items-center justify-center flex"
                    }
                >
                    <div className={"w-full"}>
                        <div className={"w-full"}>
                            <div className={"text-[15px]"}>
                                <Skeleton
                                    className={`h-[15px] w-[100px]`}
                                    style={{ borderRadius: "10px" }}
                                />
                            </div>
                            <div className={" text-[13px] text-gray-500"}>
                                <Skeleton
                                    className={`h-[13px] w-[200px] mt-[10px] mb-[10px]`}
                                    style={{ borderRadius: "10px" }}
                                />
                            </div>
                        </div>
                        <div
                            className={"w-full text-[13px]"}
                            style={{
                                whiteSpace: "nowrap",
                                textOverflow: "ellipsis",
                                overflow: "hidden",
                            }}
                        >
                            <Skeleton
                                className={`h-[13px] w-full mt-[10px] mb-[10px]`}
                                style={{ borderRadius: "10px" }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SearchFeedPage
