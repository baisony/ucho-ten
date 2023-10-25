"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { useAgent } from "@/app/_atoms/agent"
import type { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { usePathname } from "next/navigation"
import { viewFeedPage } from "./styles"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHeart as faRegularHeart } from "@fortawesome/free-regular-svg-icons"
import {
    faArrowUpFromBracket,
    faHeart as faSolidHeart,
    faRss,
    faThumbTack,
} from "@fortawesome/free-solid-svg-icons"
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
    ViewPostCardCell,
    ViewPostCardCellProps,
} from "@/app/_components/ViewPostCard/ViewPostCardCell"
import { Virtuoso } from "react-virtuoso"
import { ListFooterSpinner } from "@/app/_components/ListFooterSpinner"
import { time } from "console"

// interface Props {
//     className?: string
//     color: "light" | "dark"
//     isMobile?: boolean
//     isProfileMine?: true | false
//     isSubscribe?: true | false
//     isPinned?: true | false
// }

export default function Root() {
    const pathname = usePathname()

    const [nextQueryParams] = useNextQueryParamsAtom()
    const [agent] = useAgent()
    //const username = pathname.replace("/profile/", "")
    const atUri1 = pathname.replace("/profile/", "at://")
    const atUri = atUri1.replace("/feed/", "/app.bsky.feed.generator/")

    const [loading, setLoading] = useState(true)
    const [hasMore, setHasMore] = useState(false)
    const [timeline, setTimeline] = useState<FeedViewPost[] | null>(null)
    // const [availavleNewTimeline, setAvailableNewTimeline] = useState(false)
    // const [newTimeline, setNewTimeline] = useState<FeedViewPost[]>([])
    // const [post, setPost] = useState<any>(null)
    // const [newCursor, setNewCursor] = useState<string | null>(null)
    // const [hasCursor, setHasCursor] = useState<string | null>(null)
    const [darkMode, setDarkMode] = useState(false)
    // const [isLiked, setIsLiked] = useState<boolean>(false)
    // const [isBookmarked, setIsBookmarked] = useState<boolean>(false)
    // const [isPostMine, setIsPostMine] = useState<boolean>(false)
    const [isPinned, setIsPinned] = useState<boolean>(false)
    const [isSubscribed, setIsSubscribed] = useState<boolean>(false)
    //const [isSubscribe, setIsSubscribe] = useState<boolean>(false)
    // const [hasMoreLimit, setHasMoreLimit] = useState(false)
    const [feedInfo, setFeedInfo] = useState<any>(null)
    const [userPreference, setUserPreference] = useState<any>(null)
    const [now, setNow] = useState<Date>(new Date())

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

    const formattingTimeline = (timeline: FeedViewPost[]) => {
        const seenUris = new Set<string>()
        const filteredData = timeline.filter((item) => {
            const uri = item.post.uri
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
            // まだ uri がセットに登録されていない場合、trueを返し、セットに登録する
            if (!seenUris.has(uri)) {
                seenUris.add(uri)
                return true
            }
            return false
        })
        return filteredData as FeedViewPost[]
    }

    const fetchUserPreference = async () => {
        if (!agent) {
            return
        }

        try {
            const res = await agent.getPreferences()
            console.log(res)
            setUserPreference(res)

            const { feeds } = res
            const { pinned, saved } = feeds

            if (pinned) {
                setIsPinned(pinned.includes(atUri))
            } else {
                setIsPinned(false)
            }

            if (saved) {
                console.log(saved.includes(atUri))
                setIsSubscribed(saved.includes(atUri))
            } else {
                setIsSubscribed(false)
            }
        } catch (e) {
            console.error(e)
        }
    }

    const fetchFeed = async () => {
        if (!agent) {
            return
        }

        try {
            const feedInfo = await agent.app.bsky.feed.getFeedGenerator({
                feed: atUri,
            })

            console.log(feedInfo)

            setFeedInfo(feedInfo.data)

            const { data } = await agent.app.bsky.feed.getFeed({ feed: atUri })
            const { feed } = data

            setTimeline(feed)

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
            const { data } = await agent.app.bsky.feed.getFeed({
                cursor: cursor.current,
                feed: atUri,
            })

            const { feed } = data

            if (feed.length === 0) {
                setHasMore(false)
                return
            }

            const filteredData = formattingTimeline(feed)
            const diffTimeline = filteredData.filter((newItem) => {
                if (!timeline) {
                    return true
                }

                return !timeline.some(
                    (oldItem) => oldItem.post.uri === newItem.post.uri
                )
            })

            setTimeline((currentTimeline) => {
                if (currentTimeline !== null) {
                    const newTimeline = [...currentTimeline, ...diffTimeline]

                    return newTimeline
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

    // const handleLikeClick = () => {
    //     if (!agent) return
    //     if (!feedInfo) return
    //     try {
    //     } catch (e) {}
    // }

    const handlePinnedClick = async () => {
        if (!agent) return
        if (!feedInfo) return
        try {
            if (isPinned) {
                const res = await agent.removePinnedFeed(feedInfo.view.uri)
                setIsPinned(false)
            } else if (!isPinned) {
                const res = await agent.addPinnedFeed(feedInfo.view.uri)
                setIsPinned(true)
            }
        } catch (e) {
            console.log(e)
        }
    }
    const handleSubscribeClick = async () => {
        if (!agent) return
        if (!feedInfo) return
        try {
            if (isSubscribed) {
                const res = await agent.removeSavedFeed(feedInfo.view.uri)
                setIsSubscribed(false)
            } else if (!isSubscribed) {
                const res = await agent.addSavedFeed(feedInfo.view.uri)
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
                isPinned,
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
                const postProps: ViewPostCardCellProps = {
                    isMobile,
                    postJson: post.post,
                    now,
                    nextQueryParams,
                }

                return {
                    postProps,
                }
            })

            data = [...data, ...timelineData]
        } else {
            const timelineData: CustomFeedCellProps[] = Array.from({
                length: 20,
            }).map((_) => {
                const postProps: ViewPostCardCellProps = {
                    isSkeleton: true,
                    isMobile,
                    now,
                    nextQueryParams,
                }

                return {
                    postProps,
                }
            })

            console.log("timelineData", timelineData)

            data = [...data, ...timelineData]
        }

        if (data.length > 0) {
            data = [{ isDummyHeader: true }, ...data]
        }

        return data
    }, [feedInfo, timeline])

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
                Footer: ListFooterSpinner,
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
    postProps?: ViewPostCardCellProps
}

const CustomFeedCell = (props: CustomFeedCellProps) => {
    const { isDummyHeader, feedProps, postProps } = props

    if (isDummyHeader) {
        return <div className={"md:h-[100px] h-[85px]"} />
    }

    if (feedProps) {
        return <FeedHeaderComponent {...feedProps} />
    }

    if (postProps) {
        return <ViewPostCardCell {...postProps} />
    }
}

interface FeedProps {
    feedInfo?: any
    isSubscribed?: boolean
    isPinned?: boolean
    onClick?: () => void
    isSkeleton?: boolean
}

const FeedHeaderComponent = ({
    feedInfo,
    isSubscribed,
    isPinned,
    onClick,
    isSkeleton,
}: FeedProps) => {
    const { t } = useTranslation()
    const [onHoverButton, setOnHoverButton] = useState(false)

    const {
        background,
        ProfileContainer,
        ProfileInfoContainer,
        HeaderImageContainer,
        ProfileHeaderImage,
        ProfileImage,
        ProfileDisplayName,
        ProfileHandle,
        ProfileCopyButton,
        ProfileActionButton,
        FollowButton,
        ProfileBio,
        Buttons,
        ShareButton,
        PostContainer,
        PinButton,
        dropdown,
    } = viewFeedPage()

    return (
        <div className={ProfileContainer()}>
            <div className={ProfileInfoContainer()}>
                {!isSkeleton ? (
                    feedInfo.view?.avatar ? (
                        <img
                            className={ProfileImage()}
                            src={feedInfo.view?.avatar}
                        />
                    ) : (
                        <FontAwesomeIcon
                            icon={faRss}
                            className={ProfileImage()}
                        />
                    )
                ) : (
                    <div className={ProfileImage()}>
                        <Skeleton className={`h-full w-full rounded-[10px] `} />
                    </div>
                )}
                <div className={Buttons()}>
                    <div className={ProfileActionButton()}>
                        {!isSkeleton && (
                            <FontAwesomeIcon
                                icon={
                                    feedInfo.view?.viewer?.like
                                        ? faSolidHeart
                                        : faRegularHeart
                                }
                                style={{
                                    color: feedInfo.view?.viewer?.like
                                        ? "#ff0000"
                                        : "#000000",
                                }}
                            />
                        )}
                    </div>
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
                    <div className={ProfileActionButton()}>
                        <FontAwesomeIcon
                            icon={faThumbTack}
                            className={PinButton({
                                isPinned: isPinned,
                            })}
                        />
                    </div>
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
                        feedInfo.view?.displayName
                    ) : (
                        <Skeleton
                            className={`h-[24px] w-[300px] rounded-[10px] `}
                        />
                    )}
                </div>
                <div className={ProfileHandle()}>
                    {!isSkeleton ? (
                        `${t(`pages.feedOnlyPage.createdBy`)} @${
                            feedInfo.view.creator.handle
                        }`
                    ) : (
                        <Skeleton
                            className={`h-3 w-[80px] rounded-[10px] mt-[5px] `}
                        />
                    )}
                </div>
                <div className={ProfileBio()}>
                    {!isSkeleton ? (
                        feedInfo.view?.description
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
