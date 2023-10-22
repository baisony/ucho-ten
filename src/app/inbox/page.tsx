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
import { useTranslation } from "react-i18next"
import { useNextQueryParamsAtom } from "../_atoms/nextQueryParams"

export default function Root() {
    const { t } = useTranslation()

    const [agent] = useAgent()
    const [appearanceColor] = useAppearanceColor()
    const [nextQueryParams] = useNextQueryParamsAtom()
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
            if (!agent) {
                return
            }

            setLoading(loadingFlag)

            const { data } = await agent.listNotifications({
                cursor: cursor.current,
            })

            if (data) {
                if (data.cursor) {
                    cursor.current = data.cursor
                }

                console.log("notifications", data.notifications)

                const replyNotifications = data.notifications.filter(
                    (notification) =>
                        notification.reason === "reply" ||
                        notification.reason === "mention"
                )

                const posts = await agent.getPosts({
                    uris: replyNotifications.map(
                        (notification: any) => notification.uri
                    ),
                })

                console.log("replyNotifications", replyNotifications)

                setNotification((currentNotifications) => {
                    if (currentNotifications !== null) {
                        const notifications = [
                            ...currentNotifications,
                            ...posts.data.posts,
                        ]

                        return notifications
                    } else {
                        return [...posts.data.posts]
                    }
                })

                if (cursor.current.length > 0) {
                    setHasMore(true)
                } else {
                    setHasMore(false)
                }
            } else {
                setNotification([])
                setHasMore(false)
                // もしresがundefinedだった場合の処理
                console.log("Responseがundefinedです。")
            }
        } catch (e) {
            setHasMore(false)
            console.log(e)
        } finally {
            setLoading(false)
        }
    }

    const loadMore = async (page: number) => {
        await fetchNotification(false)
    }

    useEffect(() => {
        const fetchIfNeeded = async () => {
            if (
                agent &&
                notification &&
                notification.length < 20 &&
                cursor.current.length > 0
            ) {
                await fetchNotification(false)
            }
        }

        fetchIfNeeded()
    }, [notification, cursor.current])

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
                            isMobile={isMobile}
                            isSkeleton={true}
                            nextQueryParams={nextQueryParams}
                            t={t}
                        />
                    ))}
                {!loading &&
                    notification !== null &&
                    notification.map((post, index) => (
                        <ViewPostCard
                            key={post.uri}
                            color={color}
                            postJson={post}
                            isMobile={isMobile}
                            now={now}
                            nextQueryParams={nextQueryParams}
                            t={t}
                        />
                    ))}
            </InfiniteScroll>
        </>
    )
}
