"use client"
import { ViewPostCard } from "@/app/components/ViewPostCard"
import React, { useEffect, useRef } from "react"
import { useState } from "react"
import { isMobile } from "react-device-detect"
import { useAgent } from "@/app/_atoms/agent"
import type { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import InfiniteScroll from "react-infinite-scroller"
import { Spinner } from "@nextui-org/react"
import { useAppearanceColor } from "@/app/_atoms/appearanceColor"

export default function Root() {
    const [agent, setAgent] = useAgent()
    const [appearanceColor] = useAppearanceColor()

    const [loading, setLoading] = useState(true)
    const [notification, setNotification] = useState<PostView[] | null>(null)
    const [hasMore, setHasMore] = useState(false)
    const [darkMode, setDarkMode] = useState(false)
    const [now, setNow] = useState<Date>(new Date())

    const cursor = useRef<string>("")

    const color = darkMode ? "dark" : "light"

    useEffect(() => {
        const intervalId = setInterval(() => {
            setNow(new Date())
        }, 60 * 1000)

        return () => {
            clearInterval(intervalId)
        }
    }, [])

    const fetchNotification = async (loadingFlag: boolean = true) => {
        try {
            if (!agent) return

            setLoading(loadingFlag)

            const { data } = await agent.listNotifications({
                cursor: cursor.current,
            })
            let notificationHasMore = false
            let notificationsLength = 0

            if (data) {
                if (data.cursor) {
                    cursor.current = data.cursor
                    notificationHasMore = true
                }

                console.log("notifications", data.notifications)

                const replyNotifications = data.notifications.filter(
                    (notification) =>
                        notification.reason === "reply" ||
                        notification.reason === "mention"
                )

                const hoge = await agent.getPosts({
                    uris: replyNotifications.map(
                        (notification: any) => notification.uri
                    ),
                })

                console.log("replyNotifications", replyNotifications)

                setNotification((currentNotifications) => {
                    if (currentNotifications !== null) {
                        const notifications = [
                            ...currentNotifications,
                            ...hoge.data.posts,
                        ]
                        notificationsLength = notifications.length

                        return notifications
                    } else {
                        notificationsLength = hoge.data.posts.length
                        return [...hoge.data.posts]
                    }
                })
            } else {
                setNotification([])
                // もしresがundefinedだった場合の処理
                console.log("Responseがundefinedです。")
            }

            setLoading(false)

            if (notificationHasMore && notificationsLength < 15) {
                await fetchNotification(false)
            } else {
                setHasMore(notificationHasMore)
            }

            console.log(notification)
        } catch (e) {
            setLoading(false)

            console.log(e)
        }
    }

    const loadMore = async (page: number) => {
        await fetchNotification(false)
    }

    // const loadMore = async (page: any) => {
    //     if (!agent) return
    //     if (cursor.current === "") return

    //     try {
    //         const { data } = await agent.listNotifications({ cursor: cursor.current })
    //         const { notifications } = data

    //         console.log("notifications", notifications)

    //         console.log(data.cursor)
    //         if (data.cursor) {
    //             cursor.current = data.cursor
    //         }
    //         const replyNotifications = notifications.filter(
    //             (notification) =>
    //                 notification.reason === "reply" ||
    //                 notification.reason === "mention"
    //         )
    //         const hoge = await agent.getPosts({
    //             uris: replyNotifications.map(
    //                 (notification: any) => notification.uri
    //             ),
    //         })

    //         //取得データをリストに追加
    //         setNotification((currentNotifications) => {
    //             if (currentNotifications !== null) {
    //                 return [...currentNotifications, ...hoge.data.posts]
    //             } else {
    //                 return [...hoge.data.posts]
    //             }
    //         })
    //     } catch (e) {
    //         console.log(e)
    //     }
    // }

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
        if (!agent) return

        fetchNotification()
    }, [agent])

    return (
        <>
            <InfiniteScroll
                initialLoad={false}
                loadMore={loadMore}
                hasMore={hasMore}
                loader={
                    <div
                        key="spinner-inbox"
                        className="flex justify-center mt-2 mb-2"
                    >
                        <Spinner />
                    </div>
                }
                threshold={700}
                useWindow={false}
            >
                {(loading || !notification) &&
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
                    notification !== null &&
                    notification.map((post, index) => (
                        <ViewPostCard
                            key={post.uri}
                            color={color}
                            numbersOfImage={0}
                            postJson={post}
                            isMobile={isMobile}
                            now={now}
                        />
                    ))}
            </InfiniteScroll>
        </>
    )
}
