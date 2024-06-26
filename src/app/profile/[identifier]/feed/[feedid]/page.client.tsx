"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useAgent } from "@/app/_atoms/agent"
import type {
    FeedViewPost,
    PostView,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { usePathname } from "next/navigation"
import { viewFeedPage } from "./styles"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faThumbtack } from "@fortawesome/free-solid-svg-icons/faThumbtack"
import { faArrowUpFromBracket } from "@fortawesome/free-solid-svg-icons/faArrowUpFromBracket"
import defaultFeedIcon from "@/../public/images/icon/default_feed_icon.svg"
import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Modal,
    ModalContent,
    Skeleton,
    useDisclosure,
} from "@nextui-org/react"
import "react-swipeable-list/dist/styles.css"
import { isMobile } from "react-device-detect"
import { useTranslation } from "react-i18next"
import { useNextQueryParamsAtom } from "@/app/_atoms/nextQueryParams"
import { Virtuoso, VirtuosoHandle } from "react-virtuoso"
import { ViewPostCard, ViewPostCardProps } from "@/app/_components/ViewPostCard"
import { processPostBodyText } from "@/app/_lib/post/processPostBodyText"
import { tabBarSpaceStyles } from "@/app/_components/TabBar/tabBarSpaceStyles"
import { DummyHeader } from "@/app/_components/DummyHeader"
import { AppBskyFeedGetFeedGenerator, AtUri, BskyAgent } from "@atproto/api"
import { useScrollPositions } from "@/app/_atoms/scrollPosition"
import { SwiperSlide } from "swiper/react"
import SwiperCore from "swiper/core"
import { Virtual } from "swiper/modules"
import {
    useCurrentMenuType,
    useHeaderMenusByHeaderAtom,
} from "@/app/_atoms/headerMenu"

import "swiper/css"
import "swiper/css/pagination"
import ViewPostCardSkelton from "@/app/_components/ViewPostCard/ViewPostCardSkelton"
import { SwiperContainer } from "@/app/_components/SwiperContainer"
import { useZenMode } from "@/app/_atoms/zenMode"
import { ScrollToTopButton } from "@/app/_components/ScrollToTopButton"
import { PostModal } from "@/app/_components/PostModal"
import { useSaveScrollPosition } from "@/app/_components/FeedPage/hooks/useSaveScrollPosition"
import { reactionJson } from "@/app/_types/types"

SwiperCore.use([Virtual])

export default function Root() {
    const [, setCurrentMenuType] = useCurrentMenuType()
    const pathname = usePathname()
    const { t } = useTranslation()
    const { nullTimeline } = tabBarSpaceStyles()
    const [nextQueryParams] = useNextQueryParamsAtom()
    const [agent] = useAgent()
    const atUri1 = pathname.replace("/profile/", "at://")
    const atUri = atUri1.replace("/feed/", "/app.bsky.feed.generator/")

    const [loading, setLoading] = useState(true)
    const [hasMore, setHasMore] = useState(false)
    const [timeline, setTimeline] = useState<FeedViewPost[] | null>(null)
    const [, setIsEndOfFeed] = useState(false)
    const [isPinned, setIsPinned] = useState<boolean>(false)
    const [isSubscribed, setIsSubscribed] = useState<boolean>(false)
    const [feedInfo, setFeedInfo] =
        useState<AppBskyFeedGetFeedGenerator.OutputSchema | null>(null)
    const [now, setNow] = useState<Date>(new Date())

    const scrollRef = useRef<HTMLElement | null>(null)
    const cursor = useRef<string>("")

    const virtuosoRef = useRef<VirtuosoHandle | null>(null)
    const [scrollPositions, setScrollPositions] = useScrollPositions()
    const [scrollIndex, setScrollIndex] = useState(0)

    const [menus] = useHeaderMenusByHeaderAtom()
    const [zenMode] = useZenMode()

    useLayoutEffect(() => {
        setCurrentMenuType("feed")
    }, [])

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
                return (
                    item.post.author.did ===
                        (item.reply.parent as PostView).author.did &&
                    (item.reply.parent as PostView).author.did ===
                        (item.reply.root as PostView).author.did
                )
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
            //setUserPreference(res)

            const { feeds } = res
            const { pinned, saved } = feeds

            if (pinned) {
                setIsPinned(pinned.includes(atUri))
            } else {
                setIsPinned(false)
            }

            if (saved) {
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

            setFeedInfo(feedInfo.data)

            const { data } = await agent.app.bsky.feed.getFeed({ feed: atUri })
            const { feed } = data

            setTimeline(feed)

            if (
                feed.length === 0 &&
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

    const loadMore = async () => {
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

        void doFetch()
    }, [agent, atUri])

    const handleSubscribeClick = async () => {
        if (!agent) return
        if (!feedInfo) return
        try {
            if (isSubscribed) {
                await agent.removeSavedFeed(feedInfo.view.uri)
                setIsSubscribed(false)
            } else if (!isSubscribed) {
                await agent.addSavedFeed(feedInfo.view.uri)
                setIsSubscribed(true)
            }
        } catch (e) {
            console.log(e)
        }
    }

    const handleValueChange = (newValue: reactionJson) => {
        if (!timeline) return
        const foundObject = timeline.findIndex(
            (item) => item.post.uri === newValue.postUri
        )

        if (foundObject !== -1) {
            switch (newValue.reaction) {
                case "like":
                    setTimeline((prevData) => {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        //@ts-ignore
                        const updatedData = [...prevData]
                        if (
                            updatedData[foundObject] &&
                            updatedData[foundObject].post &&
                            updatedData[foundObject].post.viewer
                        ) {
                            updatedData[foundObject].post.viewer.like =
                                newValue.reactionUri
                        }
                        return updatedData
                    })
                    break
                case "unlike":
                    setTimeline((prevData) => {
                        const updatedData = [...prevData]
                        if (
                            updatedData[foundObject] &&
                            updatedData[foundObject].post &&
                            updatedData[foundObject].post.viewer
                        ) {
                            updatedData[foundObject].post.viewer.like =
                                undefined
                        }
                        return updatedData
                    })
                    break
                case "repost":
                    setTimeline((prevData) => {
                        const updatedData = [...prevData]
                        if (
                            updatedData[foundObject] &&
                            updatedData[foundObject].post &&
                            updatedData[foundObject].post.viewer
                        ) {
                            updatedData[foundObject].post.viewer.repost =
                                newValue.reactionUri
                        }
                        return updatedData
                    })
                    break
                case "unrepost":
                    setTimeline((prevData) => {
                        const updatedData = [...prevData]
                        if (
                            updatedData[foundObject] &&
                            updatedData[foundObject].post &&
                            updatedData[foundObject].post.viewer
                        ) {
                            updatedData[foundObject].post.viewer.repost =
                                undefined
                        }
                        return updatedData
                    })
                    break
                case "delete":
                    setTimeline((prevData) => {
                        const updatedData = [...prevData]
                        updatedData.splice(foundObject, 1)
                        return updatedData
                    })
            }
        } else {
            console.log(
                "指定されたURIを持つオブジェクトは見つかりませんでした。"
            )
        }
    }

    const handleSaveScrollPosition = useSaveScrollPosition(
        true,
        virtuosoRef,
        "feed",
        atUri,
        scrollPositions,
        setScrollPositions
    )

    const dataWithDummy = useMemo((): CustomFeedCellProps[] => {
        let data: CustomFeedCellProps[] = []

        if (feedInfo) {
            const feedProps: FeedProps = {
                agent,
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
                agent: null,
                isSkeleton: true,
            }

            const feedData: CustomFeedCellProps = {
                feedProps,
            }

            data.push(feedData)
        }

        if (timeline) {
            const timelineData: CustomFeedCellProps[] = timeline.map((post) => {
                const postProps: ViewPostCardProps = {
                    isMobile,
                    bodyText: processPostBodyText(nextQueryParams, post.post),
                    postJson: post.post,
                    nextQueryParams,
                    handleValueChange: handleValueChange,
                    handleSaveScrollPosition: handleSaveScrollPosition,
                }

                return {
                    postProps,
                }
            })

            data = [...data, ...timelineData]
        } else {
            const timelineData: CustomFeedCellProps[] = Array.from({
                length: 20,
            }).map(() => {
                const postProps: ViewPostCardProps = {
                    isSkeleton: true,
                    isMobile,
                    bodyText: undefined,
                    nextQueryParams,
                }

                return {
                    postProps,
                }
            })

            console.log("timelineData", timelineData)

            data = [...data, ...timelineData]
        }

        return data
    }, [feedInfo, timeline])

    return (
        <SwiperContainer props={{ page: "feed" }}>
            {menus.feed.map((menu, index) => {
                return (
                    <>
                        <SwiperSlide key={`swiperslide-home-${index}`}>
                            <div
                                id={`swiperIndex-div-${index}`}
                                key={index}
                                style={{
                                    overflowY: "auto",
                                    height: "100%",
                                }}
                            >
                                <Virtuoso
                                    scrollerRef={(ref) => {
                                        if (ref instanceof HTMLElement) {
                                            scrollRef.current = ref
                                        }
                                    }}
                                    ref={virtuosoRef}
                                    restoreStateFrom={
                                        scrollPositions[`feed-${atUri}`]
                                    }
                                    rangeChanged={(range) => {
                                        setScrollIndex(range.startIndex)
                                    }}
                                    context={{ hasMore }}
                                    overscan={200}
                                    increaseViewportBy={200}
                                    data={dataWithDummy}
                                    atTopThreshold={100}
                                    atBottomThreshold={100}
                                    itemContent={(_, item) => (
                                        <CustomFeedCell
                                            key={
                                                `post-${item.postProps?.postJson?.uri}` ||
                                                `feedInfo-${item.feedProps?.feedInfo?.uri}`
                                            }
                                            {...item}
                                        />
                                    )}
                                    endReached={loadMore}
                                    className={nullTimeline()}
                                />
                            </div>
                            <ScrollToTopButton
                                scrollRef={scrollRef}
                                scrollIndex={scrollIndex}
                            />
                        </SwiperSlide>
                    </>
                )
            })}
        </SwiperContainer>
    )
}

interface CustomFeedCellProps {
    isDummyHeader?: boolean
    feedProps?: FeedProps
    postProps?: ViewPostCardProps
}

const CustomFeedCell = (props: CustomFeedCellProps) => {
    const { feedProps, postProps } = props

    if (feedProps) {
        return <FeedHeaderComponent {...feedProps} />
    }

    if (postProps) {
        if (postProps.isSkeleton) return <ViewPostCardSkelton />
        return <ViewPostCard {...postProps} />
    }
}

interface FeedProps {
    agent: BskyAgent | null
    feedInfo?: AppBskyFeedGetFeedGenerator.OutputSchema
    isSubscribed?: boolean
    isPinned?: boolean
    onClick?: () => void
    isSkeleton?: boolean
}

const FeedHeaderComponent = ({
    agent,
    feedInfo,
    isSubscribed,
    isPinned,
    onClick,
    isSkeleton,
}: FeedProps) => {
    const { t } = useTranslation()
    const [onHoverButton, setOnHoverButton] = useState(false)
    const [isPinned1, setIsPinned1] = useState(isPinned)
    const [isSubscribed1, setIsSubscribed1] = useState(isSubscribed)

    useEffect(() => {
        if (isSubscribed === undefined || !isPinned === undefined) return
        setIsSubscribed1(isSubscribed)
        setIsPinned1(isPinned)
    }, [isSubscribed, isPinned])
    const handlePinnedClick = async () => {
        if (!agent) return
        if (!feedInfo) return
        try {
            if (isPinned1) {
                await agent.removePinnedFeed(feedInfo.view.uri)
                setIsPinned1(false)
            } else if (!isPinned) {
                await agent.addPinnedFeed(feedInfo.view.uri)
                setIsPinned1(true)
            }
        } catch (e) {
            console.log(e)
        }
    }

    const {
        ProfileContainer,
        ProfileInfoContainer,
        ProfileImage,
        ProfileDisplayName,
        ProfileHandle,
        ProfileCopyButton,
        ProfileActionButton,
        FollowButton,
        ProfileBio,
        Buttons,
        ShareButton,
        PinButton,
    } = viewFeedPage()

    const { isOpen, onOpen, onOpenChange } = useDisclosure()

    console.log(feedInfo)

    return (
        <>
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                placement={isMobile ? "top" : "center"}
                className={"z-[100] max-w-[600px] bg-transparent"}
            >
                <ModalContent>
                    {(onClose) => (
                        <PostModal
                            type={"Post"}
                            onClose={onClose}
                            initialEmbed={feedInfo?.view}
                            initialEmbedType={"feed"}
                        />
                    )}
                </ModalContent>
            </Modal>
            <DummyHeader />
            <div className={ProfileContainer()}>
                <div className={ProfileInfoContainer()}>
                    {!isSkeleton ? (
                        <img
                            className={ProfileImage()}
                            src={feedInfo?.view?.avatar || defaultFeedIcon.src}
                            alt={"profile"}
                        />
                    ) : (
                        <div className={ProfileImage()}>
                            <Skeleton
                                className={`h-full w-full rounded-[10px] `}
                            />
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
                            <DropdownMenu
                                className={"text-black dark:text-white"}
                                aria-label="dropdown share menu"
                            >
                                <DropdownItem key={"share"} onClick={onOpen}>
                                    {t("pages.feedOnlyPage.postThisFeed")}
                                </DropdownItem>
                                <DropdownItem
                                    key="new"
                                    onClick={() => {
                                        const aturl = new AtUri(
                                            feedInfo?.view?.uri ?? ""
                                        )
                                        void navigator.clipboard.writeText(
                                            `https://bsky.app/profile/${aturl.hostname}/feed/${aturl.rkey}`
                                        )
                                    }}
                                >
                                    {t("pages.feedOnlyPage.copyFeedURL")}
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                        <div
                            className={ProfileActionButton()}
                            onClick={handlePinnedClick}
                        >
                            <FontAwesomeIcon
                                icon={faThumbtack}
                                className={PinButton({
                                    isPinned: isPinned1,
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
                            onClick={() => {
                                try {
                                    onClick
                                    console.log("click")
                                    console.log(isSubscribed1)
                                    if (isSubscribed1) {
                                        setIsSubscribed1(false)
                                    } else {
                                        setIsSubscribed1(true)
                                    }
                                } catch (e) {
                                    console.log(e)
                                }
                            }}
                            isDisabled={isSkeleton}
                        >
                            {isSubscribed1
                                ? !onHoverButton
                                    ? t("button.subscribed")
                                    : t("button.unsubscribe")
                                : t("button.subscribe")}
                        </Button>
                    </div>
                    <div className={ProfileDisplayName()}>
                        {!isSkeleton ? (
                            feedInfo?.view?.displayName
                        ) : (
                            <Skeleton
                                className={`h-[24px] w-[300px] rounded-[10px] `}
                            />
                        )}
                    </div>
                    <div className={ProfileHandle()}>
                        {!isSkeleton ? (
                            `${t(`pages.feedOnlyPage.createdBy`)} @${
                                feedInfo?.view.creator.handle
                            }`
                        ) : (
                            <Skeleton
                                className={`h-3 w-[80px] rounded-[10px] mt-[5px] `}
                            />
                        )}
                    </div>
                    <div className={ProfileBio()}>
                        {!isSkeleton ? (
                            feedInfo?.view?.description
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
        </>
    )
}
