"use client"
import { ViewPostCard } from "@/app/components/ViewPostCard"
import React, { useEffect, useRef } from "react"
import { useState } from "react"
import { isMobile } from "react-device-detect"
import { useAgent } from "@/app/_atoms/agent"
import { useSearchParams } from "next/navigation"
import { Image, Spinner, Skeleton } from "@nextui-org/react"
import type { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import type { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs"
import InfiniteScroll from "react-infinite-scroller"
import { useRouter } from "next/navigation"
import { useAppearanceColor } from "@/app/_atoms/appearanceColor"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUser } from "@fortawesome/free-solid-svg-icons"
import { layout } from "@/app/search/styles"

export default function Root() {
    const [agent, setAgent] = useAgent()
    const router = useRouter()
    const searchParams = useSearchParams()

    const searchWord = searchParams.get("word") || ""
    const target = searchParams.get("target") || "posts"

    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(false)
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
    const [shouldScrollToTop, setShouldScrollToTop] = useState<boolean>(false)

    const numOfResult = useRef<number>(0)
    const cursor = useRef<string>("")

    const [appearanceColor] = useAppearanceColor()
    const color = darkMode ? "dark" : "light"

    const modeMe = (e: any) => {
        setDarkMode(!!e.matches)
    }

    useEffect(() => {
        if (appearanceColor === "system") {
            const matchMedia = window.matchMedia("(prefers-color-scheme: dark)")

            setDarkMode(matchMedia.matches)
            matchMedia.addEventListener("change", modeMe)

            return () => matchMedia.removeEventListener("change", modeMe)
        } else if (appearanceColor === "dark") {
            setDarkMode(true)
        } else if (appearanceColor === "light") {
            setDarkMode(false)
        }
    }, [appearanceColor])

    useEffect(() => {
        const intervalId = setInterval(() => {
            setNow(new Date())
        }, 60 * 1000)

        return () => {
            clearInterval(intervalId)
        }
    }, [])

    useEffect(() => {
        if (shouldScrollToTop) {
            const infiniteScroll = document.getElementById("infinite-scroll")

            if (infiniteScroll?.parentElement) {
                infiniteScroll.parentElement.scrollTop = 0
            }

            setShouldScrollToTop(false)
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
                setHasMore(false)
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
                setHasMore(true) // 違う
            } else {
                setHasMore(false)
            }
        } catch (error) {
            setHasMore(false)
            console.error("Error fetching data:", error)
        } finally {
            setLoading(false)
        }
    }

    const fetchSearchUsersResult = async () => {
        setHasMore(false)

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
                setHasMore(true)
            } else {
                cursor.current = ""
                setHasMore(false)
            }
        } catch (e) {
            setHasMore(false)
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const loadPostsMore = async (page: number) => {
        await fetchSearchPostsResult()
    }

    const loadUsersMore = async (page: number) => {
        await fetchSearchUsersResult()
    }

    // const loadMore = async (page: any) => {
    //     if (!agent) return
    //     if (numOfResult.current === 0) return
    //     if (loading) return

    //     if (hasMore === false) {
    //         return
    //     }

    //     try {
    //         const res = await fetch(
    //             `https://search.bsky.social/search/posts?q=${encodeURIComponent(
    //                 searchText
    //             )}&offset=${numOfResult}`
    //         )
    //         console.log(res)
    //         const json = await res.json()
    //         const outputArray = json.map(
    //             (item: any) =>
    //                 `at://${item.user.did as string}/${item.tid as string}`
    //         )

    //         if (outputArray.length === 0) {
    //             throw new Error("No Search Results")
    //         }

    //         const maxBatchSize = 25 // 1つのリクエストに許容される最大数
    //         const batches = []
    //         for (let i = 0; i < outputArray.length; i += maxBatchSize) {
    //             const batch = outputArray.slice(i, i + maxBatchSize)
    //             batches.push(batch)
    //         }

    //         const results = []
    //         for (const batch of batches) {
    //             const { data } = await agent?.getPosts({ uris: batch })
    //             const { posts } = data
    //             results.push(...posts)
    //         }
    //         //重複する投稿を削除
    //         const diffTimeline = results.filter((newItem) => {
    //             if (!searchPostsResult) {
    //                 return true
    //             }

    //             return !searchPostsResult.some(
    //                 (oldItem) => oldItem.uri === newItem.uri
    //             )
    //         })

    //         if (searchPostsResult) {
    //             setSearchPostsResult([...searchPostsResult, ...diffTimeline])
    //         } else {
    //             setSearchPostsResult([...diffTimeline])
    //         }

    //         numOfResult.current =
    //             json.length === 30 ? numOfResult + json.length : 0
    //     } catch (e) {
    //         console.log(e)
    //     }
    // }

    useEffect(() => {
        setSearchText(searchWord)

        numOfResult.current = 0
        cursor.current = ""
        setSearchPostsResult(null)
        setSearchUsersResult(null)
    }, [searchWord])

    useEffect(() => {
        setSearchTarget(target)

        numOfResult.current = 0
        cursor.current = ""
        setSearchPostsResult(null)
        setSearchUsersResult(null)
    }, [target])

    useEffect(() => {
        if (searchText === "" || !searchText) {
            setLoading(false)
            return
        }

        switch (searchTarget) {
            case "posts":
                setLoading(true)
                setShouldScrollToTop(true)
                fetchSearchPostsResult()
                break
            case "users":
                setLoading(true)
                setShouldScrollToTop(true)
                fetchSearchUsersResult()
                break
        }
    }, [agent, searchText, searchTarget])

    return (
        <>
            <InfiniteScroll
                id="infinite-scroll"
                initialLoad={false}
                loadMore={target === "posts" ? loadPostsMore : loadUsersMore}
                hasMore={hasMore}
                loader={
                    <div
                        key="spinner-search"
                        className="flex justify-center mt-2 mb-2"
                    >
                        <Spinner />
                    </div>
                }
                threshold={700}
                useWindow={false}
            >
                {target === "posts" && searchText && (
                    <>
                        {(loading || !searchPostsResult) &&
                            Array.from({ length: 15 }, (_, index) => (
                                <ViewPostCard
                                    key={`skeleton-${index}`}
                                    color={color}
                                    numbersOfImage={0}
                                    postJson={null}
                                    isMobile={isMobile}
                                    isSkeleton={true}
                                />
                            ))}
                        {!loading &&
                            searchPostsResult &&
                            searchPostsResult.map((post: PostView, index) => (
                                <ViewPostCard
                                    key={`search-post-${post.uri}`}
                                    color={color}
                                    numbersOfImage={0}
                                    postJson={post}
                                    isMobile={isMobile}
                                    now={now}
                                />
                            ))}
                    </>
                )}
                {target === "users" && searchText && (
                    <>
                        {(loading || !searchUsersResult) &&
                            Array.from({ length: 15 }, (_, index) => {
                                return userComponent({
                                    actor: {
                                        did: "",
                                        displayName: "",
                                        handle: "",
                                        description: "",
                                    },
                                    onClick: () => {},
                                    skeleton: true,
                                    index: index,
                                    color: color,
                                })
                            })}
                        {!loading &&
                            searchUsersResult &&
                            searchUsersResult.map(
                                (actor: ProfileView, index) => {
                                    return userComponent({
                                        actor,
                                        onClick: () => {
                                            router.push(`/profile/${actor.did}`)
                                        },
                                        color: color,
                                    })
                                }
                            )}
                    </>
                )}
            </InfiniteScroll>
        </>
    )
}

interface userProps {
    actor: ProfileView
    onClick: () => void
    skeleton?: boolean
    index?: number
    color: string
}

const userComponent = ({
    actor,
    onClick,
    skeleton,
    index,
    color,
}: userProps) => {
    const { userCard } = layout()

    return (
        <div
            key={`search-actor-${!skeleton ? actor.did : index}`}
            onClick={onClick}
            //@ts-ignore
            className={`${userCard({ color: color })}`}
            style={{ cursor: skeleton ? "default" : "pointer" }}
        >
            <div className={"h-[35px] w-[35px] rounded-[10px] ml-[10px]"}>
                {skeleton && (
                    <Skeleton
                        className={`h-full w-full ${color}`}
                        style={{ borderRadius: "10px" }}
                    />
                )}
                {!skeleton && actor?.avatar ? (
                    <Image
                        className={`h-[35px] w-[35px] z-[0]`}
                        src={actor.avatar}
                        alt={"avatar image"}
                    />
                ) : (
                    !skeleton && (
                        <FontAwesomeIcon
                            className={`z-[0] h-full w-full`}
                            icon={faUser}
                        />
                    )
                )}
            </div>
            <div className={"h-[50px] w-[calc(100%-50px)] pl-[10px]"}>
                <div className={"w-full"}>
                    <div className={"text-[15px]"}>
                        {skeleton && (
                            <Skeleton
                                className={`h-[15px] w-[100px] ${color}`}
                                style={{ borderRadius: "10px" }}
                            />
                        )}
                        {!skeleton && actor?.displayName}
                    </div>
                    <div className={" text-[13px] text-gray-500"}>
                        {skeleton && (
                            <Skeleton
                                className={`h-[13px] w-[200px] mt-[10px] mb-[10px] ${color}`}
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
                            className={`h-[13px] w-full mt-[10px] mb-[10px] ${color}`}
                            style={{ borderRadius: "10px" }}
                        />
                    )}
                    {!skeleton && actor?.description}
                </div>
            </div>
        </div>
    )
}
