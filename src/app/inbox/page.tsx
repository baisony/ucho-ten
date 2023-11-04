"use client"

import React, { useEffect, useRef, useState } from "react"
import { isMobile } from "react-device-detect"
import { Virtuoso } from "react-virtuoso"
import { useAgent } from "@/app/_atoms/agent"
import type { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { useNextQueryParamsAtom } from "../_atoms/nextQueryParams"
import { ListFooterSpinner } from "../_components/ListFooterSpinner"
import { ListFooterNoContent } from "@/app/_components/ListFooterNoContent"
import { useNotificationInfoAtom } from "../_atoms/notification"
import { useTappedTabbarButtonAtom } from "../_atoms/tabbarButtonTapped"
import { useTranslation } from "react-i18next"
import { useCurrentMenuType } from "../_atoms/headerMenu"
import { ViewPostCard } from "../_components/ViewPostCard"
import { processPostBodyText } from "../_lib/post/processPostBodyText"

export default function Root() {
    const [, setCurrentMenuType] = useCurrentMenuType()
    setCurrentMenuType("inbox")

    const { t } = useTranslation()

    const [agent] = useAgent()
    const [nextQueryParams] = useNextQueryParamsAtom()
    const [notificationInfo, setNotificationInfo] = useNotificationInfoAtom()
    const [tappedTabbarButton, setTappedTabbarButton] =
        useTappedTabbarButtonAtom()

    const [notification, setNotification] = useState<PostView[] | null>(null)
    const [hasMore, setHasMore] = useState(false)
    const [now, setNow] = useState<Date>(new Date())
    const [isEndOfFeed, setIsEndOfFeed] = useState(false)

    const cursor = useRef<string>("")
    const loading = useRef<boolean>(false)

    useEffect(() => {
        const intervalId = setInterval(() => {
            setNow(new Date())
        }, 60 * 1000)

        return () => {
            clearInterval(intervalId)
        }
    }, [])

    useEffect(() => {
        if (tappedTabbarButton == "inbox") {
            if (loading.current === true) {
                setTappedTabbarButton(null)
                return
            }

            const doFetch = async () => {
                cursor.current = ""

                setNotificationInfo((prevNotificationInfo) => {
                    const newNotificationInfo = prevNotificationInfo

                    newNotificationInfo.notification = null
                    newNotificationInfo.cursor = ""

                    return newNotificationInfo
                })

                setNotification(null)
                await fetchNotification()
            }

            doFetch()
        }
    }, [tappedTabbarButton])

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

    const fetchNotification = async () => {
        try {
            if (!agent) {
                return
            }

            loading.current = true

            const { data } = await agent.listNotifications({
                cursor: cursor.current,
            })
            console.log(data)
            if (
                data.notifications.length === 0 &&
                (cursor.current === data.cursor || !data.cursor)
            ) {
                setIsEndOfFeed(true)
            }

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
            if (
                agent &&
                notification &&
                notification.length < 20 &&
                cursor.current.length > 0
            ) {
                loading.current = true
            } else {
                loading.current = false
            }
        }
    }

    const loadMore = async (_: number) => {
        if (hasMore && !isEndOfFeed) {
            await fetchNotification()
        }
    }

    useEffect(() => {
        const fetchIfNeeded = async () => {
            if (
                agent &&
                notification &&
                notification.length < 20 &&
                cursor.current.length > 0 &&
                loading.current === false
            ) {
                await fetchNotification()
            } else {
                loading.current = false

                if (tappedTabbarButton !== null) {
                    setTappedTabbarButton(null)
                }
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

    return (
        <>
            {!notification && (
                <Virtuoso
                    totalCount={20}
                    initialItemCount={20}
                    itemContent={(index, item) => (
                        <ViewPostCard
                            {...{
                                isTop: index === 0,
                                isMobile,
                                isSkeleton: true,
                                bodyText: undefined,
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
                    data={notification}
                    atTopThreshold={100}
                    atBottomThreshold={100}
                    itemContent={(index, data) => (
                        <ViewPostCard
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
                            }}
                        />
                    )}
                    components={{
                        // @ts-ignore
                        Footer: !isEndOfFeed
                            ? ListFooterSpinner
                            : ListFooterNoContent,
                    }}
                    endReached={loadMore}
                    style={{ overflowY: "auto", height: "calc(100% - 50px)" }}
                />
            )}
        </>
    )
}
