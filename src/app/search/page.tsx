"use client"

import React, { useEffect, useRef, useState } from "react"
import { isMobile } from "react-device-detect"
import { useAgent } from "@/app/_atoms/agent"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Image, Skeleton } from "@nextui-org/react"
import type {
    GeneratorView,
    PostView,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import type { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs"
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { layout } from "@/app/search/styles"
import {
    menuIndexAtom,
    useCurrentMenuType,
    useHeaderMenusByHeaderAtom,
} from "../_atoms/headerMenu"
import { useTranslation } from "react-i18next"
import { useNextQueryParamsAtom } from "../_atoms/nextQueryParams"
import { Virtuoso } from "react-virtuoso"
import { ListFooterSpinner } from "../_components/ListFooterSpinner"
import { useAtom } from "jotai"
import defaultIcon from "@/../public/images/icon/default_icon.svg"
import { useSearchInfoAtom } from "../_atoms/searchInfo"
import { useTappedTabbarButtonAtom } from "../_atoms/tabbarButtonTapped"
import Link from "next/link"
import { ListFooterNoContent } from "@/app/_components/ListFooterNoContent"
import { ViewFeedCardCell } from "@/app/_components/ViewFeedCard/ViewFeedtCardCell"
import { ViewPostCard } from "../_components/ViewPostCard"
import { processPostBodyText } from "../_lib/post/processPostBodyText"
import { tabBarSpaceStyles } from "@/app/_components/TabBar/tabBarSpaceStyles"
import { DummyHeader } from "@/app/_components/DummyHeader"
import { useScrollPositions } from "@/app/_atoms/scrollPosition"

export default function Root() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { nullTimeline, notNulltimeline } = tabBarSpaceStyles()
    const [menuIndex, setMenuIndex] = useAtom(menuIndexAtom)
    const [, setCurrentMenuType] = useCurrentMenuType()
    const [agent] = useAgent()
    const [currentMenuType] = useCurrentMenuType()
    //const [menus] = useHeaderMenusAtom()
    const [menus] = useHeaderMenusByHeaderAtom()
    const [searchInfo, setSearchInfo] = useSearchInfoAtom()
    const [nextQueryParams] = useNextQueryParamsAtom()
    const [tappedTabbarButton] = useTappedTabbarButtonAtom()

    // const searchWord = searchParams.get("word") || ""
    // const target = searchParams.get("target") || "posts"

    const [loading, setLoading] = useState(false)
    const [hasMorePostsResult, setHasMorePostsResult] = useState<boolean>(false)
    const [hasMoreUsersResult, setHasMoreUsersResult] = useState<boolean>(false)
    const [hasMoreFeedsResult, setHasMoreFeedsResult] = useState<boolean>(false)
    const [searchPostsResult, setSearchPostsResult] = useState<
        PostView[] | null
    >(null)
    const [searchUsersResult, setSearchUsersResult] = useState<
        ProfileView[] | null
    >(null)
    const [searchFeedsResult, setSearchFeedsResult] = useState<
        GeneratorView[] | null
    >(null)
    const [searchText, setSearchText] = useState("")
    const [searchTarget, setSearchTarget] = useState("")
    const [now, setNow] = useState<Date>(new Date())

    const numOfResult = useRef<number>(0)
    const cursor = useRef<string>("")

    const { searchSupportCard } = layout()
    const { t } = useTranslation()

    const shouldScrollToTop = useRef<boolean>(false)
    const scrollRef = useRef<HTMLElement | null>(null)
    const [isEndOfContent, setIsEndOfContent] = useState(false)
    const virtuosoRef = useRef(null)
    const [scrollPositions, setScrollPositions] = useScrollPositions()

    useEffect(() => {
        const intervalId = setInterval(() => {
            setNow(new Date())
        }, 60 * 1000)

        return () => {
            clearInterval(intervalId)
        }
    }, [])

    useEffect(() => {
        switch (searchTarget) {
            case "posts":
                setMenuIndex(0)
                break
            case "users":
                setMenuIndex(1)
                break
            case "feeds":
                setMenuIndex(2)
                break
            default:
                setMenuIndex(0)
                break
        }
    }, [])

    useEffect(() => {
        if (!searchParams) return
        setSearchTarget(searchParams.get("target") || "posts")
        setSearchText(searchParams.get("word") || "")
    }, [searchParams])

    useEffect(() => {
        //console.log(searchTarget, searchText)
        //console.log(searchParams.get("target"), searchParams.get("word"))
        //console.log(searchInfo.target, searchInfo.searchWord)

        if (searchInfo.searchWord !== searchParams.get("word")) {
            setCurrentMenuType("searchTop")
            return
        }

        setCurrentMenuType("search")
        console.log(searchTarget)
        const target = searchTarget || "posts"
        const word = searchParams.get("word") || ""

        console.log(target, word)

        setSearchTarget(target)
        setSearchText(word)
    }, [searchParams, searchInfo.target, searchInfo.searchWord])

    useEffect(() => {
        const searchParamsWord = searchParams.get("word")
        const searchParamsTarget = searchParams.get("word")

        if (
            searchParamsWord !== "" &&
            searchParamsWord !== null &&
            searchParamsTarget !== "" &&
            searchParamsTarget !== null
        ) {
            return
        }

        if (searchInfo.searchWord === "") {
            return
        }

        if (searchInfo.target === "") {
            return
        }

        setSearchTarget(searchInfo.target)
        setSearchText(searchInfo.searchWord)

        cursor.current = ""

        const queryParams = new URLSearchParams(nextQueryParams)

        queryParams.set("target", searchInfo.target)
        queryParams.set("word", searchInfo.searchWord)

        console.log("here")
        router.replace(`/search?${queryParams.toString()}`)

        console.log("start search")
        startSearch()
    }, [pathname])

    useEffect(() => {
        if (shouldScrollToTop.current) {
            if (shouldScrollToTop.current && scrollRef.current) {
                scrollRef.current.scrollTop = 0

                shouldScrollToTop.current = false
            }
        }
    }, [searchPostsResult, searchUsersResult, searchFeedsResult])

    useEffect(() => {
        if (tappedTabbarButton === "search") {
            resetAll()
        }
    }, [tappedTabbarButton])

    useEffect(() => {
        if (searchTarget === "") {
            return
        }

        setSearchInfo((prevSearchInfo) => {
            const newSearchInfo = prevSearchInfo

            newSearchInfo.searchWord = searchText
            newSearchInfo.target = searchTarget

            return newSearchInfo
        })
    }, [
        searchPostsResult,
        searchUsersResult,
        searchFeedsResult,
        cursor.current,
        searchTarget,
        searchText,
    ])

    const fetchSearchPostsResult = async () => {
        console.log("cursor.current", cursor.current)
        if (!agent) {
            return
        }
        console.log(searchText, searchTarget)

        if (searchText === "") {
            return
        }

        try {
            console.log("")
            const res = await fetch(
                `https://search.bsky.social/search/posts?q=${encodeURIComponent(
                    searchText
                )}&offset=${numOfResult.current}`
            )
            console.log("")

            const json = await res.json()

            numOfResult.current += json.length

            if (json.length === 0) {
                setIsEndOfContent(true)
            }

            const outputArray = json.map(
                (item: any) =>
                    `at://${item.user.did as string}/${item.tid as string}`
            )

            if (outputArray.length === 0) {
                setLoading(false)
                setHasMorePostsResult(false)
                return
            }

            const maxBatchSize = 25 // 1つのリクエストに許容される最大数
            const batches = []

            for (let i = 0; i < outputArray.length; i += maxBatchSize) {
                const batch = outputArray.slice(i, i + maxBatchSize)
                batches.push(batch)
            }

            const results: PostView[] = []

            for (const batch of batches) {
                const { data } = await agent?.getPosts({ uris: batch })
                const { posts } = data
                const filteredPosts = posts.filter((post) => {
                    return (
                        !post?.author?.viewer?.muted &&
                        !post?.author?.viewer?.blocking &&
                        !post?.author?.viewer?.blockedBy
                    )
                })

                results.push(...filteredPosts)
            }

            setSearchPostsResult((currentSearchResults) => {
                if (currentSearchResults !== null) {
                    return [...currentSearchResults, ...results]
                } else {
                    return [...results]
                }
            })

            if (results.length > 0) {
                setHasMorePostsResult(true)
            } else {
                setHasMorePostsResult(false)
            }
        } catch (error) {
            setHasMorePostsResult(false)
            console.error("Error fetching data:", error)
        } finally {
            setLoading(false)
        }
    }

    const fetchSearchUsersResult = async () => {
        setHasMoreUsersResult(false)

        if (!agent) {
            return
        }

        try {
            const { data } = await agent.searchActors({
                term: searchText,
                cursor: cursor.current,
            })

            if (
                data.actors.length === 0 &&
                (cursor.current === data.cursor || !data.cursor)
            ) {
                setIsEndOfContent(true)
            }

            setSearchUsersResult((currentSearchResults) => {
                if (currentSearchResults !== null) {
                    return [...currentSearchResults, ...data.actors]
                } else {
                    return [...data.actors]
                }
            })

            if (data.cursor) {
                cursor.current = data.cursor
                setHasMoreUsersResult(true)
            } else {
                cursor.current = ""
                setHasMoreUsersResult(false)
            }
        } catch (e) {
            setHasMoreUsersResult(false)
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const fetchSearchFeedsResult = async () => {
        console.log("hoge")
        setHasMoreFeedsResult(false)

        if (!agent) {
            return
        }

        try {
            const { data } =
                await agent.app.bsky.unspecced.getPopularFeedGenerators({
                    cursor: cursor.current,
                    query: searchText,
                })

            if (
                data.feeds.length === 0 &&
                (cursor.current === data.cursor || !data.cursor)
            ) {
                setIsEndOfContent(true)
            }

            setSearchFeedsResult((currentSearchResults) => {
                if (currentSearchResults !== null) {
                    return [...currentSearchResults, ...data.feeds]
                } else {
                    return [...data.feeds]
                }
            })

            if (data.cursor) {
                cursor.current = data.cursor
                setHasMoreFeedsResult(true)
            } else {
                cursor.current = ""
                setHasMoreFeedsResult(false)
            }
        } catch (e) {
            setHasMoreFeedsResult(false)
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const loadPostsMore = async () => {
        if (hasMorePostsResult) {
            await fetchSearchPostsResult()
        }
    }

    const loadUsersMore = async () => {
        if (hasMoreUsersResult) {
            await fetchSearchUsersResult()
        }
    }

    const loadFeedsMore = async () => {
        if (hasMoreFeedsResult) {
            await fetchSearchFeedsResult()
        }
    }

    const resetAll = () => {
        console.log("resetall")
        setCurrentMenuType("searchTop")
        setSearchTarget("")

        numOfResult.current = 0
        cursor.current = ""

        setSearchPostsResult(null)
        setSearchUsersResult(null)
        setSearchFeedsResult(null)

        setHasMorePostsResult(false)
        setHasMoreUsersResult(false)
        setHasMoreFeedsResult(false)

        setSearchTarget("")
        setSearchText("")

        setSearchInfo({
            target: "",
            searchWord: "",
            // posts: null,
            // users: null,
            // postCursor: "",
            // userCursor: "",
        })
    }

    const startSearch = () => {
        console.log(searchTarget, searchText)
        switch (searchTarget) {
            case "posts":
                console.log("here start search posts")
                shouldScrollToTop.current = true
                setLoading(true)
                setHasMorePostsResult(false)
                setSearchPostsResult(null)
                cursor.current = ""
                numOfResult.current = 0
                void fetchSearchPostsResult()
                break
            case "users":
                console.log("here start search users")
                shouldScrollToTop.current = true
                setLoading(true)
                setHasMoreUsersResult(false)
                setSearchUsersResult(null)
                cursor.current = ""
                numOfResult.current = 0
                void fetchSearchUsersResult()
                break
            case "feeds":
                console.log("here start search feeds")
                shouldScrollToTop.current = true
                setLoading(true)
                setHasMoreFeedsResult(false)
                setSearchFeedsResult(null)
                cursor.current = ""
                numOfResult.current = 0
                void fetchSearchFeedsResult()
                break
        }
    }

    useEffect(() => {
        console.log(searchText, searchTarget)

        if (searchText === "") {
            setLoading(false)
            return
        }

        console.log("start search")
        startSearch()
    }, [agent, searchText, searchTarget])

    useEffect(() => {
        console.log(menuIndex)
        console.log(searchParams.get("target"))
        if (currentMenuType !== "search") {
            return
        }

        if (menus.search.length === 0 || menus.search.length < menuIndex) {
            return
        }

        const target = menus.search[menuIndex].info

        setSearchTarget(target)

        console.log(target)

        setSearchInfo((prevSearchInfo) => {
            const newSearchInfo = prevSearchInfo

            newSearchInfo.target = target

            return newSearchInfo
        })
    }, [menuIndex])

    const findFeeds = () => {
        const queryParams = new URLSearchParams(nextQueryParams)
        queryParams.set("word", "フィード bsky.app")
        queryParams.set("target", "posts")
        return `/search?${queryParams.toString()}` as string
    }

    const handleValueChange = (newValue: any) => {
        //setText(newValue);
        console.log(newValue)
        console.log(searchPostsResult)
        if (!searchPostsResult) return
        const foundObject = searchPostsResult.findIndex(
            (item) => item.uri === newValue.postUri
        )

        if (foundObject !== -1) {
            console.log(searchPostsResult[foundObject])
            switch (newValue.reaction) {
                case "like":
                    setSearchPostsResult((prevData) => {
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
                    setSearchPostsResult((prevData) => {
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
                    setSearchPostsResult((prevData) => {
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
                    setSearchPostsResult((prevData) => {
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
                    setSearchPostsResult((prevData) => {
                        const updatedData = [...prevData]
                        updatedData.splice(foundObject, 1)
                        return updatedData
                    })
                //searchPostsResult.splice(foundObject, 1)
            }
            console.log(searchPostsResult)
        } else {
            console.log(
                "指定されたURIを持つオブジェクトは見つかりませんでした。"
            )
        }
    }

    const handleSaveScrollPosition = () => {
        console.log(`save: ${searchText} ${searchTarget}`)
        //@ts-ignore
        virtuosoRef?.current?.getState((state) => {
            console.log(state)
            if (
                state.scrollTop !==
                //@ts-ignore
                scrollPositions[`search-${searchTarget}-${searchText}`]
                    ?.scrollTop
            ) {
                const updatedScrollPositions = { ...scrollPositions }
                //@ts-ignore
                updatedScrollPositions[`search-${searchTarget}-${searchText}`] =
                    state
                setScrollPositions(updatedScrollPositions)
            }
        })
    }

    return (
        <>
            {searchText === "" && (
                <div className={"w-full h-full text-white"}>
                    <div className={"absolute bottom-0  w-full"}>
                        {t("pages.search.FindPerson")}
                        <Link
                            className={searchSupportCard()}
                            href={`/profile/did:plc:pwlfo4w6auzwihryxik32t6d/feed/ufeed?${nextQueryParams.toString()}`}
                        >
                            <div className={"h-[50px] w-[50px]"}></div>
                            <div>
                                <div>穏やかなSNSを見つめる</div>
                                <div>by @Ucho-ten</div>
                            </div>
                        </Link>
                        <Link
                            className={searchSupportCard()}
                            href={`/profile/did:plc:q6gjnaw2blty4crticxkmujt/feed/cl-japanese?${nextQueryParams.toString()}`}
                        >
                            <div className={"h-[50px] w-[50px]"}></div>
                            <div>
                                <div>Japanese Cluster</div>
                                <div>by @jaz.bsky.social</div>
                            </div>
                        </Link>
                        <Link
                            className={searchSupportCard()}
                            href={findFeeds()}
                        >
                            <div className={"h-[50px] w-[50px]"}></div>
                            <div>
                                <div>日本語フィードを探す</div>
                                {/* TODO: i18n */}
                                <div>by @Ucho-ten</div>
                            </div>
                        </Link>
                    </div>
                </div>
            )}

            {loading && searchTarget === "posts" && (
                <Virtuoso
                    overscan={100}
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
                                isSearchScreen: true,
                            }}
                        />
                    )}
                    className={nullTimeline()}
                />
            )}

            {!loading &&
                searchTarget === "posts" &&
                searchText &&
                searchPostsResult && (
                    <Virtuoso
                        scrollerRef={(ref) => {
                            if (ref instanceof HTMLElement) {
                                scrollRef.current = ref
                            }
                        }}
                        ref={virtuosoRef}
                        //@ts-ignore
                        restoreStateFrom={
                            scrollPositions[`search-posts-${searchText}`]
                        }
                        context={{ hasMore: hasMorePostsResult }}
                        overscan={200}
                        increaseViewportBy={200}
                        data={searchPostsResult}
                        atTopThreshold={100}
                        atBottomThreshold={100}
                        itemContent={(index, data) => (
                            <ViewPostCard
                                key={data.uri}
                                {...{
                                    isTop: index === 0,
                                    isMobile,
                                    isSkeleton: false,
                                    bodyText: processPostBodyText(
                                        nextQueryParams,
                                        data || null
                                    ),
                                    postJson: data || null,
                                    now,
                                    nextQueryParams,
                                    t,
                                    handleValueChange: handleValueChange,
                                    handleSaveScrollPosition:
                                        handleSaveScrollPosition,
                                    isSearchScreen: true,
                                }}
                            />
                        )}
                        components={{
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            Footer: !isEndOfContent
                                ? ListFooterSpinner
                                : ListFooterNoContent,
                        }}
                        endReached={loadPostsMore}
                        className={notNulltimeline()}
                    />
                )}

            {loading && searchTarget === "users" && (
                <Virtuoso
                    overscan={100}
                    increaseViewportBy={200}
                    totalCount={20}
                    initialItemCount={20}
                    atTopThreshold={100}
                    atBottomThreshold={100}
                    itemContent={(index) => (
                        <UserCell
                            {...{
                                isTop: index === 0,
                                actor: null,
                                skeleton: true,
                                isSearchScreen: true,
                            }}
                        />
                    )}
                    className={nullTimeline()}
                />
            )}

            {!loading &&
                searchTarget === "users" &&
                searchText &&
                searchUsersResult !== null && (
                    <Virtuoso
                        scrollerRef={(ref) => {
                            if (ref instanceof HTMLElement) {
                                scrollRef.current = ref
                            }
                        }}
                        ref={virtuosoRef}
                        //@ts-ignore
                        restoreStateFrom={
                            scrollPositions[`search-users-${searchText}`]
                        }
                        context={{ hasMore: hasMoreFeedsResult }}
                        overscan={200}
                        increaseViewportBy={200}
                        data={searchUsersResult}
                        atTopThreshold={100}
                        atBottomThreshold={100}
                        itemContent={(index, data) => (
                            <UserCell
                                key={data.did}
                                {...{
                                    isTop: index === 0,
                                    actor: data,
                                    onClick: () => {
                                        handleSaveScrollPosition()
                                        router.push(
                                            `/profile/${
                                                data.did
                                            }?${nextQueryParams.toString()}`
                                        )
                                    },
                                    isSearchScreen: true,
                                }}
                            />
                        )}
                        components={{
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            Footer: !isEndOfContent
                                ? ListFooterSpinner
                                : ListFooterNoContent,
                        }}
                        endReached={loadUsersMore}
                        className={notNulltimeline()}
                    />
                )}
            {loading && searchTarget === "feeds" && (
                <Virtuoso
                    overscan={100}
                    increaseViewportBy={200}
                    totalCount={20}
                    initialItemCount={20}
                    atTopThreshold={100}
                    atBottomThreshold={100}
                    itemContent={(index) => (
                        <UserCell
                            {...{
                                isTop: index === 0,
                                actor: null,
                                skeleton: true,
                                isSearchScreen: true,
                            }}
                        />
                    )}
                    className={nullTimeline()}
                />
            )}

            {!loading &&
                searchTarget === "feeds" &&
                searchText &&
                searchFeedsResult !== null && (
                    <Virtuoso
                        scrollerRef={(ref) => {
                            if (ref instanceof HTMLElement) {
                                scrollRef.current = ref
                            }
                        }}
                        ref={virtuosoRef}
                        //@ts-ignore
                        restoreStateFrom={
                            scrollPositions[`search-feeds-${searchText}`]
                        }
                        context={{ hasMore: hasMoreUsersResult }}
                        overscan={200}
                        increaseViewportBy={200}
                        data={searchFeedsResult}
                        atTopThreshold={100}
                        atBottomThreshold={100}
                        itemContent={(index, data) => (
                            <ViewFeedCardCell
                                key={data.uri}
                                {...{
                                    isTop: index === 0,
                                    isMobile,
                                    isSkeleton: false,
                                    feed: data || null,
                                    now,
                                    nextQueryParams,
                                    t,
                                    isSearchScreen: true,
                                    handleSaveScrollPosition:
                                        handleSaveScrollPosition,
                                }}
                            />
                        )}
                        components={{
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            Footer: !isEndOfContent
                                ? ListFooterSpinner
                                : ListFooterNoContent,
                        }}
                        endReached={loadFeedsMore}
                        className={notNulltimeline()}
                    />
                )}
        </>
    )
}

interface UserCellProps {
    isTop: boolean
    actor: ProfileView | null
    onClick?: () => void
    skeleton?: boolean
    //index?: number
    isSearchScreen?: boolean
}

const UserCell = ({
    isTop,
    actor,
    onClick,
    skeleton,
    isSearchScreen,
}: UserCellProps) => {
    const { userCard } = layout()

    return (
        <>
            {isTop && <DummyHeader isSearchScreen={isSearchScreen} />}
            <div
                onClick={onClick}
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //@ts-ignore
                className={`${userCard()}`}
                style={{ cursor: skeleton ? "default" : "pointer" }}
            >
                <div className={"h-[35px] w-[35px] rounded-[10px] ml-[10px]"}>
                    {skeleton && (
                        <Skeleton
                            className={`h-full w-full`}
                            style={{ borderRadius: "10px" }}
                        />
                    )}
                    {!skeleton && (
                        <Image
                            className={`h-[35px] w-[35px] z-[0]`}
                            src={actor?.avatar || defaultIcon.src}
                            alt={"avatar image"}
                        />
                    )}
                </div>
                <div className={"h-[50px] w-[calc(100%-50px)] pl-[10px]"}>
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
                        {!skeleton && actor?.description}
                    </div>
                </div>
            </div>
        </>
    )
}
