import { layout } from "@/app/search/styles"
import { useUserProfileDetailedAtom } from "@/app/_atoms/userProfileDetail"
import { useWordMutes } from "@/app/_atoms/wordMute"
import { tabBarSpaceStyles } from "@/app/_components/TabBar/tabBarSpaceStyles"
import { useCallback, useEffect, useRef, useState } from "react"
import { useScrollPositions } from "@/app/_atoms/scrollPosition"
import {
    QueryFunctionContext,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query"
import { Virtuoso } from "react-virtuoso"
import { ListFooterSpinner } from "@/app/_components/ListFooterSpinner"
import { ListFooterNoContent } from "@/app/_components/ListFooterNoContent"
import { DummyHeader } from "@/app/_components/DummyHeader"
import { BskyAgent } from "@atproto/api"
import { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs"
import { mergeActors } from "@/app/_lib/actor/mergeActors"
import { useContentFontSize } from "@/app/_atoms/contentFontSize"
import { Skeleton } from "@nextui-org/react"
import defaultIcon from "../../../public/images/icon/default_icon.svg"
import { useRouter, useSearchParams } from "next/navigation"

interface FeedResponseObject {
    actors: ProfileView[]
    cursor: string // TODO: should consider adding ? to handle undefined.
}

interface SearchPostPageProps {
    isActive: boolean
    t: any
    nextQueryParams: URLSearchParams
    agent: BskyAgent | null
    searchText: string
}

const SearchActorPage = ({
    agent,
    isActive,
    t,
    nextQueryParams,
    searchText,
}: SearchPostPageProps) => {
    const router = useRouter()
    const { searchSupportCard } = layout()
    const [userProfileDetailed] = useUserProfileDetailedAtom()
    const [muteWords] = useWordMutes()
    const { notNulltimeline } = tabBarSpaceStyles()
    const [timeline, setTimeline] = useState<ProfileView[] | null>(null)
    const [newTimeline, setNewTimeline] = useState<ProfileView[]>([])
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
    const feedKey = `Actors`
    const pageName = "search"

    const FEED_FETCH_LIMIT = 25
    const CHECK_FEED_UPDATE_INTERVAL: number = 10 * 1000
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
            refetch()
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
            const { data } = await agent.searchActors({
                q: searchText,
                limit: FEED_FETCH_LIMIT,
                cursor: "",
            })

            if (data) {
                const { actors } = data

                setNewTimeline(actors)

                if (actors.length > 0) {
                    console.log(
                        "new and old cid",
                        feedKey,
                        actors[0].did,
                        latestCID.current
                    )

                    if (
                        actors[0].did !== latestCID.current &&
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

    const handleRefresh = async () => {
        shouldScrollToTop.current = true

        const mergedTimeline = mergeActors(newTimeline, timeline)

        if (!mergedTimeline[0]) return
        //@ts-ignore
        setTimeline(mergedTimeline)
        setNewTimeline([])
        setHasUpdate(false)

        if (mergedTimeline.length > 0) {
            latestCID.current = mergedTimeline[0].did
        }

        await queryClient.refetchQueries({
            queryKey: ["getActor", feedKey],
        })

        shouldCheckUpdate.current = true
    }

    const handleFetchResponse = (response: FeedResponseObject) => {
        console.log(response)
        if (response) {
            const { actors, cursor } = response
            if (actors.length === 0 || cursor === "") setIsEndOfFeed(true)
            setCursorState(response.cursor)

            if (timeline === null) {
                if (actors.length > 0) {
                    latestCID.current = actors[0].did
                }
            }

            setTimeline((currentTimeline) => {
                if (currentTimeline !== null) {
                    return [...currentTimeline, ...actors]
                } else {
                    return [...actors]
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

        const response = await agent.searchActors({
            term: searchText,
            cursor: cursorState || "",
            limit: FEED_FETCH_LIMIT,
        })

        console.log(response)
        return {
            actors: response.data.actors,
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
                restoreStateFrom={
                    //@ts-ignore
                    scrollPositions[`search-posts-${searchText}`]
                }
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
                            <UserCell
                                key={data.did}
                                {...{
                                    actor: data,
                                    onClick: () => {
                                        handleSaveScrollPosition()
                                        router.push(
                                            `/profile/${
                                                data.did
                                            }?${nextQueryParams.toString()}`
                                        )
                                    },
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
        </div>
    )
}

interface UserCellProps {
    actor: ProfileView | null
    onClick?: () => void
    skeleton?: boolean
    //index?: number
}

const UserCell = ({ actor, onClick, skeleton }: UserCellProps) => {
    const { userCard } = layout()
    const [contentFontSize] = useContentFontSize()

    return (
        <>
            <div
                onClick={onClick}
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //@ts-ignore
                className={`${userCard()}`}
                style={{ cursor: skeleton ? "default" : "pointer" }}
            >
                <div
                    className={
                        "h-[35px] w-[35px] rounded-full ml-[10px] overflow-hidden"
                    }
                >
                    {skeleton && (
                        <Skeleton
                            className={`h-full w-full`}
                            style={{ borderRadius: "10px" }}
                        />
                    )}
                    {!skeleton && (
                        <img
                            className={`h-[35px] w-[35px] z-[0] rounded-full`}
                            src={actor?.avatar || defaultIcon.src}
                            alt={"avatar image"}
                        />
                    )}
                </div>
                <div
                    className={
                        "h-[75px] w-[calc(100%-50px)] pl-[10px] items-center justify-center flex"
                    }
                >
                    <div className={"w-full"}>
                        <div className={"w-full"}>
                            <div className={"text-[15px]"}>
                                {skeleton && (
                                    <Skeleton
                                        className={`h-[15px] w-[100px]`}
                                        style={{ borderRadius: "10px" }}
                                    />
                                )}
                                {!skeleton && actor?.displayName}
                            </div>
                            <div className={" text-[13px] text-gray-500"}>
                                {skeleton && (
                                    <Skeleton
                                        className={`h-[13px] w-[200px] mt-[10px] mb-[10px]`}
                                        style={{ borderRadius: "10px" }}
                                    />
                                )}
                                {!skeleton && `@${actor?.handle}`}
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
                            {skeleton && (
                                <Skeleton
                                    className={`h-[13px] w-full mt-[10px] mb-[10px]`}
                                    style={{ borderRadius: "10px" }}
                                />
                            )}
                            {!skeleton && (
                                <div
                                    className={`${
                                        contentFontSize == 1
                                            ? `text-[12px]`
                                            : contentFontSize == 2
                                              ? `text-[13px]`
                                              : contentFontSize == 3
                                                ? `text-[14px]`
                                                : contentFontSize == 4
                                                  ? `text-[15px]`
                                                  : contentFontSize == 5
                                                    ? `text-[16px]`
                                                    : contentFontSize == 6
                                                      ? `text-[17px]`
                                                      : contentFontSize == 7
                                                        ? `text-[18px]`
                                                        : contentFontSize == 8
                                                          ? `text-[19px]`
                                                          : contentFontSize == 9
                                                            ? `text-[20px]`
                                                            : contentFontSize ==
                                                                10
                                                              ? `text-[21px]`
                                                              : `text-[14px]`
                                    }`}
                                >
                                    {actor?.description}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SearchActorPage
