"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { isMobile } from "react-device-detect"
import { Virtuoso } from "react-virtuoso"
import { useAgent } from "@/app/_atoms/agent"
import type { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { useNextQueryParamsAtom } from "../_atoms/nextQueryParams"
import { ViewPostCardCell } from "../_components/ViewPostCard/ViewPostCardCell"
import { ListFooterSpinner } from "../_components/ListFooterSpinner"
import { useNotificationInfoAtom } from "../_atoms/notification"
// import { ReactBurgerMenu } from "react-burger-menu"
import { useTranslation } from "react-i18next"

export default function Root() {
    const { t } = useTranslation()

    const [agent] = useAgent()
    const [nextQueryParams] = useNextQueryParamsAtom()
    const [notificationInfo, setNotificationInfo] = useNotificationInfoAtom()

    const [loading, setLoading] = useState(true)
    const [notification, setNotification] = useState<PostView[] | null>(null)
    const [hasMore, setHasMore] = useState(false)
    const [darkMode, setDarkMode] = useState(false)
    const [now, setNow] = useState<Date>(new Date())

    const cursor = useRef<string>("")

    useEffect(() => {
        const intervalId = setInterval(() => {
            setNow(new Date())
        }, 60 * 1000)

        return () => {
            clearInterval(intervalId)
        }
    }, [])

    useEffect(() => {
        if (notification) {
            setNotificationInfo((prevNotificationInfo) => {
                const newNotificationInfo = prevNotificationInfo

                newNotificationInfo.notification = notification
                newNotificationInfo.cursor = cursor.current

                return newNotificationInfo
            })
        }
    }, [notification, cursor.current])

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

                const dividedReplyNotifications = []
                for (let i = 0; i < replyNotifications.length; i += 25) {
                    dividedReplyNotifications.push(
                        replyNotifications.slice(i, i + 25)
                    )
                }

                const allPosts: any[] = []
                for (const dividedNotifications of dividedReplyNotifications) {
                    const posts = await agent.getPosts({
                        uris: dividedNotifications.map(
                            (notification) => notification.uri
                        ),
                    })
                    allPosts.push(...posts.data.posts)
                }

                console.log("replyNotifications", replyNotifications)

                setNotification((currentNotifications) => {
                    if (currentNotifications !== null) {
                        const notifications = [
                            ...currentNotifications,
                            ...allPosts,
                        ]
                        return notifications
                    } else {
                        return [...allPosts]
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
        if (hasMore) {
            await fetchNotification(false)
        }
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
    useEffect(() => {
        if (!agent) return

        if (!notificationInfo.notification) {
            fetchNotification()
        } else {
            setNotification(notificationInfo.notification)
            cursor.current = notificationInfo.cursor
        }
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
                    endReached={loadMore}
                    style={{ overflowY: "auto", height: "calc(100% - 50px)" }}
                />
            )}
        </>
    )
}
