"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
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

export default function Root() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

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

    useEffect(() => {
        const intervalId = setInterval(() => {
            setNow(new Date())
        }, 60 * 1000)

        return () => {
            clearInterval(intervalId)
        }
    }, [])

    useEffect(() => {
        switch (searchParams.get("target")) {
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
    }, [searchParams])

    useEffect(() => {
        console.log(searchTarget, searchText)
        console.log(searchInfo.target, searchInfo.searchWord)

        if (
            searchInfo.target !== searchParams.get("target") ||
            searchInfo.searchWord !== searchParams.get("word")
        ) {
            setCurrentMenuType("searchTop")
            return
        }

        setCurrentMenuType("search")

        const target = searchParams.get("target") || "posts"
        const word = searchParams.get("word") || ""

        console.log(target, word)

        setSearchTarget(target)
        setSearchText(word)
    }, [searchParams])

    useEffect(() => {
        console.log("searchInfo", searchInfo)
        console.log(searchParams.get("word"), searchParams.get("target"))

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

        console.log("searchInfo", searchInfo)

        if (searchInfo.searchWord === "") {
            return
        }

        if (searchInfo.target === "") {
            return
        }

        setSearchTarget(searchInfo.target)
        setSearchText(searchInfo.searchWord)

        cursor.current = ""

        // if (searchTarget === "posts") {
        //     if (searchPostsResult === null && searchInfo.posts !== null) {
        //         setSearchPostsResult(searchInfo.posts)

        //         cursor.current = searchInfo.postCursor
        //     }
        // } else if (searchTarget === "users") {
        //     if (searchUsersResult === null && searchInfo.users !== null) {
        //         setSearchUsersResult(searchInfo.users)

        //         cursor.current = searchInfo.userCursor
        //     }
        // }

        const queryParams = new URLSearchParams(nextQueryParams)

        queryParams.set("target", searchInfo.target)
        queryParams.set("word", searchInfo.searchWord)

        console.log("here")
        router.replace(`/search?${queryParams.toString()}`)

        console.log("start search")
        startSearch()
    }, [pathname])

    useEffect(() => {
        if (shouldScrollToTop.current === true) {
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
            // newSearchInfo.posts = searchPostsResult
            // newSearchInfo.users = searchUsersResult

            // if (searchTarget === "posts") {
            //     newSearchInfo.postCursor = cursor.current
            // } else if (searchTarget === "users") {
            //     newSearchInfo.userCursor = cursor.current
            // }

            console.log("newSearchInfo", newSearchInfo)

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
        console.log("")

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

                results.push(...posts)
            }

            setSearchPostsResult((currentSearchResults) => {
                if (currentSearchResults !== null) {
                    const newSearchResults = [
                        ...currentSearchResults,
                        ...results,
                    ]

                    return newSearchResults
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
                    const newSearchResults = [
                        ...currentSearchResults,
                        ...data.actors,
                    ]

                    return newSearchResults
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
                    const newSearchResults = [
                        ...currentSearchResults,
                        ...data.feeds,
                    ]

                    return newSearchResults
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

    const loadPostsMore = async (page: number) => {
        if (hasMorePostsResult) {
            await fetchSearchPostsResult()
        }
    }

    const loadUsersMore = async (page: number) => {
        if (hasMoreUsersResult) {
            await fetchSearchUsersResult()
        }
    }

    const loadFeedsMore = async (page: number) => {
        if (hasMoreFeedsResult) {
            await fetchSearchFeedsResult()
        }
    }

    const resetAll = () => {
        console.log("resetall")

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

    // useEffect(() => {
    //     setSearchTarget("")

    //     numOfResult.current = 0
    //     cursor.current = ""

    //     setSearchPostsResult(null)
    //     setSearchUsersResult(null)

    //     setHasMorePostsResult(false)
    //     setHasMoreUsersResult(false)
    // }, [sea])

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
                fetchSearchPostsResult()
                break
            case "users":
                console.log("here start search users")
                shouldScrollToTop.current = true
                setLoading(true)
                setHasMoreUsersResult(false)
                setSearchUsersResult(null)
                cursor.current = ""
                numOfResult.current = 0
                fetchSearchUsersResult()
                break
            case "feeds":
                console.log("here start search feeds")
                shouldScrollToTop.current = true
                setLoading(true)
                setHasMoreFeedsResult(false)
                setSearchFeedsResult(null)
                cursor.current = ""
                numOfResult.current = 0
                fetchSearchFeedsResult()
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
        if (currentMenuType !== "search") {
            return
        }

        if (menus.search.length === 0 || menus.search.length < menuIndex) {
            return
        }

        const target = menus.search[menuIndex].info

        setSearchTarget(target)

        setSearchInfo((prevSearchInfo) => {
            const newSearchInfo = prevSearchInfo

            newSearchInfo.target = target

            return newSearchInfo
        })
    }, [menuIndex])

    const searchPostsResultWithDummy = useMemo((): PostView[] => {
        const dummyData: PostView = {} as PostView

        if (!searchPostsResult) {
            return [dummyData]
        } else {
            return [dummyData, ...searchPostsResult]
        }
    }, [searchPostsResult])

    const findFeeds = () => {
        const queryParams = new URLSearchParams(nextQueryParams)
        queryParams.set("word", "フィード bsky.app")
        queryParams.set("target", "posts")
        return `/search?${nextQueryParams.toString()}` as string
    }

    return (
        <>
            {searchText === "" && (
                <div className={"w-full h-full text-white"}>
                    <div className={"absolute bottom-[50px] w-full"}>
                        {t("pages.search.FindPerson")}
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
                        <div className={searchSupportCard()}>
                            <div className={"h-[50px] w-[50px]"}></div>
                            <div>
                                <div>test</div>
                                <div>by @Ucho-ten</div>
                            </div>
                        </div>
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
                    itemContent={(index, item) => (
                        <ViewPostCard
                            {...{
                                isTop: index === 0,
                                isMobile,
                                isSkeleton: true,
                                isDummyHeader: index === 0,
                                nextQueryParams,
                                t,
                            }}
                        />
                    )}
                    style={{ overflowY: "auto", height: "calc(100% - 50px)" }}
                />
            )}

            {!loading && searchTarget === "posts" && searchText && (
                <Virtuoso
                    scrollerRef={(ref) => {
                        if (ref instanceof HTMLElement) {
                            //scrollRef.current = ref
                        }
                    }}
                    context={{ hasMore: hasMorePostsResult }}
                    overscan={200}
                    increaseViewportBy={200}
                    data={searchPostsResultWithDummy}
                    atTopThreshold={100}
                    atBottomThreshold={100}
                    itemContent={(index, data) => (
                        <ViewPostCard
                            {...{
                                isTop: index === 0,
                                isMobile,
                                isSkeleton: false,
                                postJson: data || null,
                                isDummyHeader: index === 0,
                                now,
                                nextQueryParams,
                                t,
                            }}
                        />
                    )}
                    components={{
                        // @ts-ignore
                        Footer: !isEndOfContent
                            ? ListFooterSpinner
                            : ListFooterNoContent,
                    }}
                    endReached={loadPostsMore}
                    style={{ overflowY: "auto", height: "calc(100% - 50px)" }}
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
                    itemContent={(index, item) => (
                        <UserCell
                            {...{
                                isDummyHeader: index === 0,
                                actor: null,
                                skeleton: true,
                            }}
                        />
                    )}
                    style={{ overflowY: "auto", height: "calc(100% - 50px)" }}
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
                        context={{ hasMore: hasMoreFeedsResult }}
                        overscan={200}
                        increaseViewportBy={200}
                        data={searchUsersResult}
                        atTopThreshold={100}
                        atBottomThreshold={100}
                        itemContent={(index, data) => (
                            <UserCell
                                {...{
                                    isDummyHeader: index === 0,
                                    actor: data,
                                    onClick: () => {
                                        router.push(
                                            `/profile/${
                                                data.did
                                            }?${nextQueryParams.toString()}`
                                        )
                                    },
                                }}
                            />
                        )}
                        components={{
                            // @ts-ignore
                            Footer: !isEndOfContent
                                ? ListFooterSpinner
                                : ListFooterNoContent,
                        }}
                        endReached={loadUsersMore}
                        style={{
                            overflowY: "auto",
                            height: "calc(100% - 50px)",
                        }}
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
                    itemContent={(index, item) => (
                        <UserCell
                            {...{
                                isDummyHeader: index === 0,
                                actor: null,
                                skeleton: true,
                            }}
                        />
                    )}
                    style={{ overflowY: "auto", height: "calc(100% - 50px)" }}
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
                        context={{ hasMore: hasMoreUsersResult }}
                        overscan={200}
                        increaseViewportBy={200}
                        data={searchFeedsResult}
                        atTopThreshold={100}
                        atBottomThreshold={100}
                        itemContent={(index, data) => (
                            <ViewFeedCardCell
                                {...{
                                    isTop: index === 0,
                                    isMobile,
                                    isSkeleton: false,
                                    feed: data || null,
                                    now,
                                    nextQueryParams,
                                    t,
                                }}
                            />
                        )}
                        components={{
                            // @ts-ignore
                            Footer: !isEndOfContent
                                ? ListFooterSpinner
                                : ListFooterNoContent,
                        }}
                        endReached={loadFeedsMore}
                        style={{
                            overflowY: "auto",
                            height: "calc(100% - 50px)",
                        }}
                    />
                )}
        </>
    )
}

interface UserCellProps {
    isDummyHeader: boolean
    actor: ProfileView | null
    onClick?: () => void
    skeleton?: boolean
    //index?: number
}

const UserCell = ({
    isDummyHeader,
    actor,
    onClick,
    skeleton, //index,
}: UserCellProps) => {
    const { userCard } = layout()

    return (
        <div
            onClick={onClick}
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
    )
}
