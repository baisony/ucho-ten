"use client"

import React, { useEffect, useRef, useState } from "react"
import { useAgent } from "@/app/_atoms/agent"
import InfiniteScroll from "react-infinite-scroller"
import type { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { usePathname } from "next/navigation"
import { viewFeedPage } from "./styles"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHeart as faRegularHeart } from "@fortawesome/free-regular-svg-icons"
import {
    faArrowUpFromBracket,
    faHeart as faSolidHeart,
    faThumbTack,
} from "@fortawesome/free-solid-svg-icons"
import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
} from "@nextui-org/react"
import "react-swipeable-list/dist/styles.css"
import { ViewPostCard } from "@/app/components/ViewPostCard"
import { isMobile } from "react-device-detect"
import { useAppearanceColor } from "@/app/_atoms/appearanceColor"

interface Props {
    className?: string
    color: "light" | "dark"
    isMobile?: boolean
    isProfileMine?: true | false
    isSubscribe?: true | false
    isPinned?: true | false
}

export default function Root() {
    const [agent, setAgent] = useAgent()
    const [appearanceColor] = useAppearanceColor()
    const pathname = usePathname()

    const username = pathname.replace("/profile/", "")
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
    // const [isSubscribe, setIsSubscribe] = useState<boolean>(false)
    // const [hasMoreLimit, setHasMoreLimit] = useState(false)
    const [feedInfo, setFeedInfo] = useState<any>(null)
    const [userPreference, setUserPreference] = useState<any>(null)
    const [now, setNow] = useState<Date>(new Date())

    const cursor = useRef<string>("")

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

    return (
        <InfiniteScroll
            initialLoad={false}
            loadMore={loadMore}
            hasMore={hasMore}
            loader={
                <div
                    key="spinner-feed-generator"
                    className="flex justify-center mt-2 mb-2"
                >
                    <Spinner />
                </div>
            }
            threshold={700}
            useWindow={false}
        >
            {feedInfo && (
                <FeedHeaderComponent
                    feedInfo={feedInfo}
                    color={color}
                    isSubscribed={isSubscribed}
                    isPinned={isPinned}
                />
            )}
            {(loading || !agent || !timeline) &&
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
                agent &&
                timeline &&
                timeline.map((post, index) => (
                    <ViewPostCard
                        key={`feed-${index}-${post.post.uri}`}
                        color={color}
                        numbersOfImage={0}
                        postJson={post.post}
                        json={post}
                        isMobile={isMobile}
                        now={now}
                    />
                ))}
        </InfiniteScroll>
    )
}

interface FeedProps {
    feedInfo: any
    color: "light" | "dark"
    isSubscribed: boolean
    isPinned: boolean
}

const FeedHeaderComponent = ({
    feedInfo,
    color,
    isSubscribed,
    isPinned,
}: FeedProps) => {
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
        <div className={ProfileContainer({ color: color })}>
            <div className={ProfileInfoContainer()}>
                <img
                    className={ProfileImage()}
                    src={feedInfo.view?.avatar}
                ></img>
                <div className={Buttons()}>
                    <div className={ProfileActionButton()}>
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
                    </div>
                    <Dropdown className={dropdown({ color: color })}>
                        <DropdownTrigger>
                            <div className={ProfileCopyButton()}>
                                <FontAwesomeIcon
                                    icon={faArrowUpFromBracket}
                                    className={ShareButton({
                                        color: color,
                                    })}
                                />
                            </div>
                        </DropdownTrigger>
                        <DropdownMenu>
                            <DropdownItem key="new">Copy feed url</DropdownItem>
                            <DropdownItem key="copy">
                                Post this feed
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
                                className={FollowButton({ color: color })}
                                onMouseLeave={() => {
                                    setOnHoverButton(false)
                                }}
                                onMouseEnter={() => {
                                    setOnHoverButton(true)
                                }}
                                onClick={() => {
                                    handleSubscribeClick()
                                }}
                            >
                                {isSubscribed
                                    ? !onHoverButton
                                        ? "Subscribed"
                                        : "UnSubscribe"
                                    : "Subscribe"}
                            </Button>
                </div>
                <div className={ProfileDisplayName({ color: color })}>
                    {feedInfo.view?.displayName}
                </div>
                <div className={ProfileHandle()}>
                    created by @{feedInfo.view.creator.handle}
                </div>
                <div className={ProfileBio()}>{feedInfo.view?.description}</div>
            </div>
        </div>
    )
}
