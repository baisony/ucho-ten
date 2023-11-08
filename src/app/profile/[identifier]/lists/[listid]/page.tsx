"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { useAgent } from "@/app/_atoms/agent"
import type { ListItemView } from "@atproto/api/dist/client/types/app/bsky/graph/defs"
import { usePathname } from "next/navigation"
import { viewFeedPage } from "./styles"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowUpFromBracket } from "@fortawesome/free-solid-svg-icons"
import defaultFeedIcon from "@/../public/images/icon/default_feed_icon.svg"
import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Skeleton,
} from "@nextui-org/react"
import "react-swipeable-list/dist/styles.css"
import { isMobile } from "react-device-detect"
import { useTranslation } from "react-i18next"
import { useNextQueryParamsAtom } from "@/app/_atoms/nextQueryParams"
import {
    ViewUserProfileCardCell,
    ViewUserProfileCardCellProps,
} from "@/app/_components/ViewUserProfileCard/ViewUserProfileCardCell"
import { Virtuoso } from "react-virtuoso"
import { ListFooterSpinner } from "@/app/_components/ListFooterSpinner"
import { AtUri } from "@atproto/api"
import { ListFooterNoContent } from "@/app/_components/ListFooterNoContent"
import { useCurrentMenuType } from "@/app/_atoms/headerMenu"
import { HEADER_HEIGHT, MOBILE_HEADER_HEIGHT } from "@/app/_constants/styles"

export default function Root() {
    const [, setCurrentMenuType] = useCurrentMenuType()
    setCurrentMenuType("list")

    const pathname = usePathname()
    const { t } = useTranslation()

    const [nextQueryParams] = useNextQueryParamsAtom()
    const [agent] = useAgent()
    //const username = pathname.replace("/profile/", "")
    const atUri1 = pathname.replace("/profile/", "at://")
    let atUri = atUri1.replace("/lists/", "/app.bsky.graph.list/")

    const [loading, setLoading] = useState(true)
    const [hasMore, setHasMore] = useState(false)
    const [timeline, setTimeline] = useState<ListItemView[] | null>(null)
    const [isEndOfFeed, setIsEndOfFeed] = useState(false)
    const [isSubscribed, setIsSubscribed] = useState<boolean>(false)
    //const [isSubscribe, setIsSubscribe] = useState<boolean>(false)
    // const [hasMoreLimit, setHasMoreLimit] = useState(false)
    const [feedInfo, setFeedInfo] = useState<any>(null)
    const [, setNow] = useState<Date>(new Date())

    const shouldScrollToTop = useRef<boolean>(false)
    const scrollRef = useRef<HTMLElement | null>(null)
    const cursor = useRef<string>("")

    useEffect(() => {
        const intervalId = setInterval(() => {
            setNow(new Date())
        }, 60 * 1000)

        return () => {
            clearInterval(intervalId)
        }
    }, [])

    const formattingTimeline = (timeline: ListItemView[]) => {
        const seenUris = new Set<string>()
        const filteredData = timeline.filter((item) => {
            const uri = item.subject.did
            // まだ uri がセットに登録されていない場合、trueを返し、セットに登録する
            if (!seenUris.has(uri)) {
                seenUris.add(uri)
                return true
            }
            return false
        })
        return filteredData as ListItemView[]
    }

    const fetchUserPreference = async () => {
        if (!agent) {
            return
        }

        try {
            if (!atUri.startsWith("at://did:")) {
                const toAtUri = new AtUri(atUri)
                const did = await agent.resolveHandle({
                    handle: toAtUri.hostname,
                })
                atUri = atUri.replace(toAtUri.hostname, did.data.did)
            }
            const { data } = await agent.app.bsky.graph.getList({ list: atUri })
            setIsSubscribed(!!data.list.viewer?.muted)
            setFeedInfo(data.list)
        } catch (e) {
            console.error(e)
        }
    }

    const fetchFeed = async () => {
        if (!agent) {
            return
        }

        try {
            if (!atUri.startsWith("at://did:")) {
                const toAtUri = new AtUri(atUri)
                const did = await agent.resolveHandle({
                    handle: toAtUri.hostname,
                })
                atUri = atUri.replace(toAtUri.hostname, did.data.did)
            }
            const { data } = await agent.app.bsky.graph.getList({ list: atUri })
            const { items } = data
            setTimeline(items)

            if (
                items.length === 0 &&
                (cursor.current === data.cursor || !data.cursor)
            ) {
                setIsEndOfFeed(true)
            }

            if (data.cursor) {
                cursor.current = data.cursor
                setHasMore(true)
            } else {
                setHasMore(false)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const loadMore = async (page: any) => {
        if (!agent) {
            return
        }
        if (!cursor.current || cursor.current.length === 0) {
            return
        }
        if (loading) {
            return
        }

        try {
            const { data } = await agent.app.bsky.graph.getList({
                cursor: cursor.current,
                list: atUri,
            })

            const { items } = data

            if (items.length === 0) {
                setHasMore(false)
                return
            }

            const filteredData = formattingTimeline(items)
            const diffTimeline = filteredData.filter((newItem) => {
                if (!timeline) {
                    return true
                }

                return !timeline.some(
                    (oldItem) => oldItem.subject.did === newItem.subject.did
                )
            })

            setTimeline((currentTimeline) => {
                if (currentTimeline !== null) {
                    return [...currentTimeline, ...diffTimeline]
                } else {
                    return [...diffTimeline]
                }
            })

            if (data.cursor) {
                cursor.current = data.cursor
                setHasMore(true)
            } else {
                cursor.current = ""
                setHasMore(true)
            }
        } catch (e) {
            setHasMore(false)
            console.log(e)
        }
    }

    useEffect(() => {
        if (!agent) {
            return
        }

        const doFetch = async () => {
            await fetchUserPreference()
            await fetchFeed()
        }

        doFetch()
    }, [agent, atUri])

    const handleSubscribeClick = async () => {
        if (!agent) return
        if (!feedInfo) return
        try {
            if (isSubscribed) {
                await agent.app.bsky.graph.unmuteActorList({
                    list: feedInfo.uri,
                })
                setIsSubscribed(false)
            } else if (!isSubscribed) {
                await agent.app.bsky.graph.muteActorList({
                    list: feedInfo.uri,
                })
                setIsSubscribed(true)
            }
        } catch (e) {
            console.log(e)
        }
    }

    const dataWithDummy = useMemo((): CustomFeedCellProps[] => {
        let data: CustomFeedCellProps[] = []

        if (feedInfo) {
            const feedProps: FeedProps = {
                feedInfo,
                isSubscribed,
                onClick: handleSubscribeClick,
            }

            const feedData: CustomFeedCellProps = {
                isDummyHeader: false,
                feedProps,
            }

            data.push(feedData)
        } else {
            const feedProps: FeedProps = {
                isSkeleton: true,
            }

            const feedData: CustomFeedCellProps = {
                feedProps,
            }

            data.push(feedData)
        }

        if (timeline) {
            const timelineData: CustomFeedCellProps[] = timeline.map((post) => {
                const profileProps: ViewUserProfileCardCellProps = {
                    isMobile,
                    json: post.subject,
                    nextQueryParams,
                    t,
                }

                return {
                    profileProps,
                }
            })

            data = [...data, ...timelineData]
        } else {
            const timelineData: CustomFeedCellProps[] = Array.from({
                length: 20,
            }).map(() => {
                const profileProps: ViewUserProfileCardCellProps = {
                    isSkeleton: true,
                    isMobile,
                    json: null,
                    nextQueryParams,
                    t,
                }

                return {
                    profileProps,
                }
            })

            console.log("timelineData", timelineData)

            data = [...data, ...timelineData]
        }

        if (data.length > 0) {
            data = [{ isDummyHeader: true }, ...data]
        }

        return data
    }, [feedInfo, timeline, isSubscribed])

    return (
        <Virtuoso
            scrollerRef={(ref) => {
                if (ref instanceof HTMLElement) {
                    scrollRef.current = ref
                }
            }}
            context={{ hasMore }}
            overscan={200}
            increaseViewportBy={200}
            data={dataWithDummy}
            atTopThreshold={100}
            atBottomThreshold={100}
            itemContent={(_, item) => <CustomFeedCell {...item} />}
            components={{
                // @ts-ignore
                Footer: !isEndOfFeed ? ListFooterSpinner : ListFooterNoContent,
            }}
            endReached={loadMore}
            // onScroll={(e) => disableScrollIfNeeded(e)}
            style={{ overflowY: "auto", height: "calc(100% - 50px)" }}
        />
    )
}

interface CustomFeedCellProps {
    isDummyHeader?: boolean
    feedProps?: FeedProps
    profileProps?: ViewUserProfileCardCellProps
}

const CustomFeedCell = (props: CustomFeedCellProps) => {
    const { isDummyHeader, feedProps, profileProps } = props

    if (isDummyHeader) {
        return (
            <div
                className={`md:h-[${HEADER_HEIGHT}px] h-[${MOBILE_HEADER_HEIGHT}px]`}
            />
        )
    }

    if (feedProps) {
        return <FeedHeaderComponent {...feedProps} />
    }

    if (profileProps) {
        return <ViewUserProfileCardCell {...profileProps} />
    }
}

interface FeedProps {
    feedInfo?: any
    isSubscribed?: boolean
    onClick?: () => void
    isSkeleton?: boolean
}

const FeedHeaderComponent = ({
    feedInfo,
    isSubscribed,
    onClick,
    isSkeleton,
}: FeedProps) => {
    const { t } = useTranslation()
    const [onHoverButton, setOnHoverButton] = useState(false)

    const {
        ProfileContainer,
        ProfileInfoContainer,
        ProfileImage,
        ProfileDisplayName,
        ProfileHandle,
        ProfileCopyButton,
        FollowButton,
        ProfileBio,
        Buttons,
        ShareButton,
    } = viewFeedPage()

    return (
        <div className={ProfileContainer()}>
            <div className={ProfileInfoContainer()}>
                {!isSkeleton ? (
                    <img
                        className={ProfileImage()}
                        src={feedInfo?.avatar || defaultFeedIcon.src}
                        alt={feedInfo?.name}
                    />
                ) : (
                    <div className={ProfileImage()}>
                        <Skeleton className={`h-full w-full rounded-[10px] `} />
                    </div>
                )}
                <div className={Buttons()}>
                    <Dropdown>
                        <DropdownTrigger>
                            <div className={ProfileCopyButton()}>
                                <FontAwesomeIcon
                                    icon={faArrowUpFromBracket}
                                    className={ShareButton()}
                                />
                            </div>
                        </DropdownTrigger>
                        <DropdownMenu>
                            <DropdownItem key="new">
                                {t("pages.feedOnlyPage.copyFeedURL")}
                            </DropdownItem>
                            <DropdownItem key="copy">
                                {t("pages.feedOnlyPage.postThisFeed")}{" "}
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                    <Button
                        className={FollowButton()}
                        onMouseLeave={() => {
                            setOnHoverButton(false)
                        }}
                        onMouseEnter={() => {
                            setOnHoverButton(true)
                        }}
                        onClick={onClick}
                        isDisabled={isSkeleton}
                    >
                        {isSubscribed
                            ? !onHoverButton
                                ? t("button.subscribed")
                                : t("button.unsubscribe")
                            : t("button.subscribe")}
                    </Button>
                </div>
                <div className={ProfileDisplayName()}>
                    {!isSkeleton ? (
                        feedInfo?.name
                    ) : (
                        <Skeleton
                            className={`h-[24px] w-[300px] rounded-[10px] `}
                        />
                    )}
                </div>
                <div className={ProfileHandle()}>
                    {!isSkeleton ? (
                        `${t(`pages.feedOnlyPage.createdBy`)} @${
                            feedInfo.creator.handle
                        }`
                    ) : (
                        <Skeleton
                            className={`h-3 w-[80px] rounded-[10px] mt-[5px] `}
                        />
                    )}
                </div>
                <div className={ProfileBio()}>
                    {!isSkeleton ? (
                        feedInfo?.description
                    ) : (
                        <>
                            <Skeleton
                                className={`h-3 w-full rounded-[10px] mt-[5px] `}
                            />
                            <Skeleton
                                className={`h-3 w-full rounded-[10px] mt-[5px] `}
                            />
                            <Skeleton
                                className={`h-3 w-full rounded-[10px] mt-[5px] `}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
