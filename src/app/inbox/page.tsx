"use client"

import React, { useEffect, useMemo, useRef } from "react"
import { useState } from "react"
import { isMobile } from "react-device-detect"
import { Virtuoso } from "react-virtuoso"
import { useAgent } from "@/app/_atoms/agent"
import type { FeedViewPost, PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { useAppearanceColor } from "@/app/_atoms/appearanceColor"
import { useNextQueryParamsAtom } from "../_atoms/nextQueryParams"
import { ViewPostCardCell } from "../components/ViewPostCard/ViewPostCardCell"
import { ListFooterSpinner } from "../components/ListFooterSpinner"

export default function Root() {
    const [agent] = useAgent()
    const [appearanceColor] = useAppearanceColor()
    const [nextQueryParams] = useNextQueryParamsAtom()
    const [loading, setLoading] = useState(true)
    const [notification, setNotification] = useState<PostView[] | null>(null)
    const [hasMore, setHasMore] = useState(false)
    const [darkMode, setDarkMode] = useState(false)
    const [now, setNow] = useState<Date>(new Date())

    const cursor = useRef<string>("")

    const color: "dark" | "light" = darkMode ? "dark" : "light"

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

    const notificationWithDummy = useMemo((): PostView[] => {
        const dummyData: PostView = {} as PostView

        if (!notification) {
            return [dummyData]
        } else {
            return [dummyData, ...notification]
        }
    }, [notification])

    return (
        <>
            {!notification && (
                <Virtuoso
                    totalCount={20}
                    initialItemCount={20}
                    itemContent={(index, item) => (
                        <ViewPostCardCell
                            {...{
                                color,
                                isMobile,
                                isSkeleton: true,
                                isDummyHeader: index === 0,
                                nextQueryParams,
                            }}
                        />
                    )}
                    className="overflow-y-auto h-[calc(100%-50px)]"
                    style={{ overflowY: "auto", height: "calc(100% - 50px)" }}
                />
            )}
            {notification && (
                <Virtuoso
                    scrollerRef={(ref) => {
                        if (ref instanceof HTMLElement) {
                            //scrollRef.current = ref
                        }
                    }}
                    context={{ hasMore }}
                    overscan={200}
                    increaseViewportBy={200}
                    data={notificationWithDummy}
                    atTopThreshold={100}
                    atBottomThreshold={100}
                    itemContent={(index, data) => (
                        <ViewPostCardCell
                            {...{
                                color,
                                isMobile,
                                isSkeleton: false,
                                postJson: data || null,
                                isDummyHeader: index === 0,
                                now,
                                nextQueryParams,
                            }}
                        />
                    )}
                    components={{
                        // @ts-ignore
                        Footer: ListFooterSpinner,
                    }}
                    endReached={loadMore}
                    style={{ overflowY: "auto", height: "calc(100% - 50px)" }}
                />
            )}
        </>
    )
}
