"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { isMobile } from "react-device-detect"
import { useAgent } from "@/app/_atoms/agent"
import { useRouter, useSearchParams } from "next/navigation"
import { Image, Skeleton } from "@nextui-org/react"
import type { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import type { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { layout } from "@/app/search/styles"
import { menuIndexAtom, useHeaderMenusByHeaderAtom } from "../_atoms/headerMenu"
import { useTranslation } from "react-i18next"
import { useNextQueryParamsAtom } from "../_atoms/nextQueryParams"
import { Virtuoso } from "react-virtuoso"
import { ViewPostCardCell } from "../_components/ViewPostCard/ViewPostCardCell"
import { ListFooterSpinner } from "../_components/ListFooterSpinner"
import { useAtom } from "jotai"
import defaultIcon from "@/../public/images/icon/default_icon.svg"

export default function Root() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [agent] = useAgent()
    const [menuIndex] = useAtom(menuIndexAtom)
    //const [menus] = useHeaderMenusAtom()
    const [menus] = useHeaderMenusByHeaderAtom()
    
    const [nextQueryParams] = useNextQueryParamsAtom()

    const searchWord = searchParams.get("word") || ""
    const target = searchParams.get("target") || "posts"

    const [loading, setLoading] = useState(false)
    const [hasMorePostsResult, setHasMorePostsResult] = useState<boolean>(false)
    const [hasMoreUsersResult, setHasMoreUsersResult] = useState<boolean>(false)
    const [searchPostsResult, setSearchPostsResult] = useState<
        PostView[] | null
    >(null)
    const [searchUsersResult, setSearchUsersResult] = useState<
        ProfileView[] | null
    >(null)
    const [searchText, setSearchText] = useState(searchWord)
    const [searchTarget, setSearchTarget] = useState(target)
    const [darkMode, setDarkMode] = useState(false)
    const [now, setNow] = useState<Date>(new Date())

    const numOfResult = useRef<number>(0)
    const cursor = useRef<string>("")

    const { searchSupportCard } = layout()
    const { t } = useTranslation()

    const shouldScrollToTop = useRef<boolean>(false)
    const scrollRef = useRef<HTMLElement | null>(null)

    useEffect(() => {
        const intervalId = setInterval(() => {
            setNow(new Date())
        }, 60 * 1000)

        return () => {
            clearInterval(intervalId)
        }
    }, [])

    useEffect(() => {
        if (shouldScrollToTop.current === true) {
            if (shouldScrollToTop.current && scrollRef.current) {
                scrollRef.current.scrollTop = 0

                shouldScrollToTop.current = false
            }
        }
    }, [searchPostsResult, searchUsersResult])

    const fetchSearchPostsResult = async () => {
        if (!agent) {
            return
        }

        if (searchText === "") {
            return
        }

        try {
            const res = await fetch(
                `https://search.bsky.social/search/posts?q=${encodeURIComponent(
                    searchText
                )}&offset=${numOfResult.current}`
            )

            const json = await res.json()

            numOfResult.current += json.length

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

    useEffect(() => {
        setSearchText(searchWord)

        numOfResult.current = 0
        cursor.current = ""

        setSearchPostsResult(null)
        setSearchUsersResult(null)

        setHasMorePostsResult(false)
        setHasMoreUsersResult(false)
    }, [searchWord])

    useEffect(() => {
        setSearchTarget(target)

        numOfResult.current = 0
        cursor.current = ""

        setSearchPostsResult(null)
        setSearchUsersResult(null)

        setHasMorePostsResult(false)
        setHasMoreUsersResult(false)
    }, [target])

    useEffect(() => {
        if (searchText === "" || !searchText) {
            setLoading(false)
            return
        }

        switch (searchTarget) {
            case "posts":
                shouldScrollToTop.current = true
                setLoading(true)
                setHasMorePostsResult(false)
                setSearchPostsResult(null)
                fetchSearchPostsResult()
                break
            case "users":
                shouldScrollToTop.current = true
                setLoading(true)
                setHasMoreUsersResult(false)
                setSearchUsersResult(null)
                fetchSearchUsersResult()
                break
        }
    }, [agent, searchText, searchTarget])

    useEffect(() => {
        if (menus.search.length === 0 || menus.search.length < menuIndex) {
            return
        }

        const target = menus.search[menuIndex].info

        const queryParams = new URLSearchParams(nextQueryParams)
        queryParams.set("word", searchText)
        queryParams.set("target", target)

        if (searchText === "") {
            return
        }

        router.push(`/search?${queryParams.toString()}`)

        /*
        router.push(
            `/search?word=${encodeURIComponent(searchText)}&target=${target}`
        )
        */
    }, [menuIndex])

    const searchPostsResultWithDummy = useMemo((): PostView[] => {
        const dummyData: PostView = {} as PostView

        if (!searchPostsResult) {
            return [dummyData]
        } else {
            return [dummyData, ...searchPostsResult]
        }
    }, [searchPostsResult])

    const searchUsersResultWithDummy = useMemo((): ProfileView[] => {
        const dummyData: ProfileView = {} as ProfileView

        if (!searchUsersResult) {
            return [dummyData]
        } else {
            return [dummyData, ...searchUsersResult]
        }
    }, [searchUsersResult])

    return (
        <>
            {searchText === "" && (
                <div className={"w-full h-full text-white"}>
                    <div className={"absolute bottom-[50px] w-full"}>
                        {t("pages.search.FindPerson")}
                        <div
                            className={searchSupportCard()}
                            onClick={() => {
                                router.push(
                                    `/profile/did:plc:q6gjnaw2blty4crticxkmujt/feed/cl-japanese?${nextQueryParams.toString()}`
                                )
                            }}
                        >
                            <div className={"h-[50px] w-[50px]"}></div>
                            <div>
                                <div>Japanese Cluster</div>
                                <div>by @jaz.bsky.social</div>
                            </div>
                        </div>
                        <div
                            className={searchSupportCard()}
                            onClick={() => {
                                const queryParams = new URLSearchParams(
                                    nextQueryParams
                                )
                                queryParams.set("word", "フィード%20bsky.app")
                                queryParams.set("target", "posts")
                                router.push(
                                    `/search?${nextQueryParams.toString()}`
                                )
                            }}
                        >
                            <div className={"h-[50px] w-[50px]"}></div>
                            <div>
                                <div>日本語フィードを探す</div>
                                <div>by @Ucho-ten</div>
                            </div>
                        </div>
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

            {loading && target === "posts" && (
                <Virtuoso
                    overscan={100}
                    increaseViewportBy={200}
                    totalCount={20}
                    initialItemCount={20}
                    atTopThreshold={100}
                    atBottomThreshold={100}
                    itemContent={(index, item) => (
                        <ViewPostCardCell
                            {...{
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

            {!loading && target === "posts" && searchText && (
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
                        <ViewPostCardCell
                            {...{
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
                        Footer: ListFooterSpinner,
                    }}
                    endReached={loadPostsMore}
                    style={{ overflowY: "auto", height: "calc(100% - 50px)" }}
                />
            )}

            {loading && target === "users" && (
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

            {!loading && target === "users" && searchText && (
                <Virtuoso
                    scrollerRef={(ref) => {
                        if (ref instanceof HTMLElement) {
                            scrollRef.current = ref
                        }
                    }}
                    context={{ hasMore: hasMoreUsersResult }}
                    overscan={200}
                    increaseViewportBy={200}
                    data={searchUsersResultWithDummy}
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
                        Footer: ListFooterSpinner,
                    }}
                    endReached={loadUsersMore}
                    style={{ overflowY: "auto", height: "calc(100% - 50px)" }}
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

    if (isDummyHeader) {
        return <div className={"md:h-[100px] h-[85px]"} />
    }

    return (
        <div
            //key={`search-actor-${!skeleton ? actor.did : index}`}
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
