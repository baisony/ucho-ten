"use client"

import { ViewPostCard } from "@/app/components/ViewPostCard"
import React, { useCallback, useEffect, useState } from "react"
import { isMobile } from "react-device-detect"
import { useAgent } from "@/app/_atoms/agent"
import InfiniteScroll from "react-infinite-scroller"
import type { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowsRotate } from "@fortawesome/free-solid-svg-icons"
import { useSearchParams } from "next/navigation"
import { useAppearanceColor } from "@/app/_atoms/appearanceColor"
import { useWordMutes } from "@/app/_atoms/wordMute"

export default function Root(props: any) {
    const [agent, setAgent] = useAgent()
    const [appearanceColor] = useAppearanceColor()
    const [muteWords] = useWordMutes()
    const [loading, setLoading] = useState(false)
    const [loading2, setLoading2] = useState(false)
    const [timeline, setTimeline] = useState<FeedViewPost[] | null>(null)
    const [availavleNewTimeline, setAvailableNewTimeline] = useState(false)
    const [newTimeline, setNewTimeline] = useState<FeedViewPost[]>([])
    const [newCursor, setNewCursor] = useState<string | null>(null)
    const [cursor, setCursor] = useState<string | null>(null)
    const [hasCursor, setHasCursor] = useState<string | null>(null)
    const [darkMode, setDarkMode] = useState(false)
    const [now, setNow] = useState<Date>(new Date())
    const color = darkMode ? "dark" : "light"
    const searchParams = useSearchParams()
    const selectedFeed = searchParams.get("feed") || "following"
    console.log("hogehoge")
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

    const handleRefresh = () => {
        console.log("refresh")

        // newtimelineとtimelineの差分を取得
        console.log(timeline)
        console.log(newTimeline)
        const diffTimeline = newTimeline.filter((newItem) => {
            if (!timeline) {
                return true
            }

            return !timeline.some(
                (oldItem) => oldItem.post.uri === newItem.post.uri
            )
        })
        console.log(diffTimeline)
        // timelineに差分を追加

        if (timeline) {
            setTimeline([...diffTimeline, ...timeline])
        } else {
            setTimeline([...diffTimeline])
        }
        setCursor(newCursor)
        setAvailableNewTimeline(false)
    }

    const FormattingTimeline = (timeline: FeedViewPost[]) => {
        const seenUris = new Set<string>()
        const filteredData = timeline.filter((item) => {
            const uri = item.post.uri
            //console.log(item)
            if (item.post.embed) console.log(item.post.embed)
            if (item.reply) {
                if (item.reason) return true
                if (
                    //@ts-ignore
                    item.post.author.did === item.reply.parent.author.did &&
                    //@ts-ignore
                    item.reply.parent.author.did === item.reply.root.author.did
                )
                    return true
                return false
            }
            //これはおそらくparentやrootがミュートユーザーの時、recordにreplyが入って、authorが自分ではない場合は非表示
            if (
                //@ts-ignore
                item.post.record?.reply &&
                item.post.author.did !== agent?.session?.did
            )
                return false
            // まだ uri がセットに登録されていない場合、trueを返し、セットに登録する
            if (!seenUris.has(uri)) {
                seenUris.add(uri)
                return true
            }
            return false
        })
        return filteredData as FeedViewPost[]
    }

    const fetchTimeline = async () => {
        if (!agent) return
        try {
            setLoading(true)
            let data
            if (selectedFeed === "following") {
                ;({ data } = await agent.getTimeline({ limit: 30 }))
            } else {
                ;({ data } = await agent.app.bsky.feed.getFeed({
                    feed: selectedFeed,
                    limit: 30,
                }))
            }
            if (data) {
                if (data.cursor) {
                    setCursor(data.cursor)
                }
                const { feed } = data
                const filteredData = FormattingTimeline(feed)
                setTimeline(filteredData)
            } else {
                // もしresがundefinedだった場合の処理
                console.log("Responseがundefinedです。")
            }
            setLoading(false)
        } catch (e) {
            setLoading(false)
            console.log(e)
        }
    }

    const loadMore = useCallback(
        async (page: any) => {
            if (!agent) return
            if (!cursor) return
            console.log("loadMore")
            try {
                setLoading2(true)
                let data
                if (selectedFeed === "following") {
                    ;({ data } = await agent.getTimeline({
                        cursor: !hasCursor ? cursor : hasCursor,
                        limit: 30,
                    }))
                } else {
                    ;({ data } = await agent.app.bsky.feed.getFeed({
                        feed: selectedFeed,
                        cursor: !hasCursor ? cursor : hasCursor,
                        limit: 30,
                    }))
                }
                const { feed } = data
                if (data.cursor) {
                    setHasCursor(data.cursor)
                }
                const filteredData = FormattingTimeline(feed)
                const diffTimeline = filteredData.filter((newItem) => {
                    if (!timeline) {
                        return true
                    }

                    return !timeline.some(
                        (oldItem) => oldItem.post === newItem.post
                    )
                })

                console.log(timeline)
                console.log(diffTimeline)

                //取得データをリストに追加
                if (timeline) {
                    setTimeline([...timeline, ...diffTimeline])
                } else {
                    setTimeline([...diffTimeline])
                }
                setLoading2(false)
            } catch (e) {
                setLoading2(false)
                console.log(e)
            }
        },
        [cursor, agent, timeline, hasCursor, selectedFeed]
    )

    const checkNewTimeline = async () => {
        if (!agent) return
        try {
            let data
            if (selectedFeed === "following") {
                ;({ data } = await agent.getTimeline({ limit: 30 }))
            } else {
                ;({ data } = await agent.app.bsky.feed.getFeed({
                    feed: selectedFeed,
                    limit: 30,
                }))
            }
            console.log(data.cursor)
            if (data) {
                const { feed } = data
                const filteredData = FormattingTimeline(feed)

                if (
                    data.cursor &&
                    data.cursor !== cursor &&
                    data.cursor !== newCursor
                ) {
                    setNewCursor(data.cursor)
                    const diffTimeline = filteredData.filter((newItem) => {
                        if (!timeline) {
                            return true
                        }

                        return !timeline.some(
                            (oldItem) => oldItem.post.uri === newItem.post.uri
                        )
                    })
                    console.log(diffTimeline)
                    setAvailableNewTimeline(true)
                    setNewTimeline(filteredData)
                }
            }
        } catch (e) {}
    }

    useEffect(() => {
        if (!agent) return
        fetchTimeline()
    }, [agent, selectedFeed])

    useEffect(() => {
        const interval = setInterval(() => {
            checkNewTimeline()
        }, 15000)
        // クリーンアップ関数
        return () => {
            clearInterval(interval) // インターバルをクリーンアップ
        }
    }, [agent, cursor, selectedFeed])

    return (
        <>
            {availavleNewTimeline && (
                <div
                    className={
                        " absolute flex justify-center z-[10] left-16 right-16 top-[120px]"
                    }
                >
                    <div
                        className={
                            "text-black  bg-blue-50 rounded-full cursor-pointer pl-[10px] pr-[10px] pt-[5px] pb-[5px]"
                        }
                        onClick={handleRefresh}
                    >
                        <FontAwesomeIcon icon={faArrowsRotate} /> New Posts
                    </div>
                </div>
            )}
            <>
                <InfiniteScroll
                    loadMore={loadMore}
                    hasMore={!loading2}
                    // loader={<Spinner key="spinner-feed"/>}
                    threshold={1500}
                    useWindow={false}
                >
                    {(loading || !timeline) &&
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
                        timeline &&
                        timeline.map((post, index) => {
                            // Check if post.record.text contains muteWords
                            const isMuted =
                                (post.post.record as PostView)?.text &&
                                muteWords.some((muteWord) => {
                                    //console.log(muteWord)
                                    return (
                                        muteWord.isActive &&
                                        muteWord.targets.includes("timeline") &&
                                        (
                                            post.post.record as PostView
                                        )?.text?.includes(muteWord.word)
                                    )
                                })
                            if (!isMuted) {
                                // Render the post if it's not muted
                                return (
                                    <ViewPostCard
                                        key={`${
                                            post?.reason
                                                ? `reason-${
                                                      (post.reason as any).by
                                                          .did
                                                  }`
                                                : `post`
                                        }-${post.post.uri}`}
                                        color={color}
                                        numbersOfImage={0}
                                        postJson={post.post}
                                        json={post}
                                        isMobile={isMobile}
                                    />
                                )
                            }
                        })}
                </InfiniteScroll>
            </>
        </>
    )
}
