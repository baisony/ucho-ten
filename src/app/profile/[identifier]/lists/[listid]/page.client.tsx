"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useAgent } from "@/app/_atoms/agent"
import type {
    ListItemView,
    ListView,
} from "@atproto/api/dist/client/types/app/bsky/graph/defs"
import { usePathname } from "next/navigation"
import { viewFeedPage } from "./styles"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
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
import {
    ViewUserProfileCardCell,
    ViewUserProfileCardCellProps,
} from "@/app/_components/ViewUserProfileCard/ViewUserProfileCardCell"
import { Virtuoso, VirtuosoHandle } from "react-virtuoso"
import { AppBskyGraphDefs, AtUri } from "@atproto/api"
import { ViewPostCard, ViewPostCardProps } from "@/app/_components/ViewPostCard"
import { processPostBodyText } from "@/app/_lib/post/processPostBodyText"
import {
    FeedViewPost,
    PostView,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs"
import { tabBarSpaceStyles } from "@/app/_components/TabBar/tabBarSpaceStyles"
import { DummyHeader } from "@/app/_components/DummyHeader"
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
    let atUri = atUri1.replace("/lists/", "/app.bsky.graph.list/")

    const [loading, setLoading] = useState(true)
    const [hasMore, setHasMore] = useState(false)
    const [timeline, setTimeline] = useState<
        ListItemView[] | FeedViewPost[] | null
    >(null)
    //const [isEndOfFeed, setIsEndOfFeed] = useState(false)
    const [isSubscribed, setIsSubscribed] = useState<boolean>(false)
    const [feedInfo, setFeedInfo] = useState<ListView | null>(null)
    const [now, setNow] = useState<Date>(new Date())

    const scrollRef = useRef<HTMLElement | null>(null)
    const cursor = useRef<string>("")
    const [scrollIndex, setScrollIndex] = useState<number>(0)

    const virtuosoRef = useRef<VirtuosoHandle | null>(null)
    const [scrollPositions, setScrollPositions] = useScrollPositions()

    const [menus] = useHeaderMenusByHeaderAtom()
    const [zenMode] = useZenMode()

    useLayoutEffect(() => {
        setCurrentMenuType("list")
    }, [])

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
            await fetchFeed(data.list.purpose)
        } catch (e) {
            console.error(e)
        }
    }

    const fetchFeed = async (listPurporse?: string) => {
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
            let data
            let items: FeedViewPost[] | ListItemView[] | null = []
            if (listPurporse === "app.bsky.graph.defs#modlist") {
                data = await agent.app.bsky.graph.getList({ list: atUri })
                items = data?.data.items
            } else if (listPurporse === "app.bsky.graph.defs#curatelist") {
                data = await agent.app.bsky.feed.getListFeed({ list: atUri })
                items = data?.data.feed
            }
            setTimeline(items)

            if (
                items.length === 0 &&
                (cursor.current === data?.data.cursor || !data?.data.cursor)
            ) {
                //setIsEndOfFeed(true)
            }

            if (data?.data.cursor) {
                cursor.current = data?.data.cursor
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
                if (!feedInfo) {
                    return true
                }
                if (feedInfo.purpose === "app.bsky.graph.defs#modlist") {
                    return !timeline.some(
                        (oldItem) =>
                            (oldItem.subject as ProfileView).did ===
                            newItem.subject.did
                    )
                } else if (
                    feedInfo.purpose === "app.bsky.graph.defs#curatelist"
                ) {
                    return !timeline.some(
                        (oldItem) =>
                            (oldItem.post as PostView).uri ===
                            (newItem.post as PostView).uri
                    )
                }
            })
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
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
        }

        void doFetch()
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

    const handleValueChange = (newValue: reactionJson) => {
        if (!timeline) return
        const foundObject = timeline.findIndex(
            (item) => (item?.post as PostView).uri === newValue.postUri
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
                //timeline.splice(foundObject, 1)
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
        "list",
        atUri,
        scrollPositions,
        setScrollPositions
    )

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
            if (feedInfo?.purpose === "app.bsky.graph.defs#modlist") {
                const timelineData: CustomFeedCellProps[] = timeline.map(
                    (post) => {
                        const profileProps: ViewUserProfileCardCellProps = {
                            isMobile,
                            json: AppBskyGraphDefs.isListItemView(post)
                                ? post.subject
                                : null,
                            nextQueryParams,
                            t,
                        }
                        return {
                            profileProps,
                        }
                    }
                )

                data = [...data, ...timelineData]
            } else if (feedInfo?.purpose === "app.bsky.graph.defs#curatelist") {
                const timelineData: CustomFeedCellProps[] = timeline.map(
                    (post) => {
                        const postProps: ViewPostCardProps = {
                            isMobile,
                            bodyText: processPostBodyText(
                                nextQueryParams,
                                post.post as PostView
                            ),
                            postJson: post.post as PostView,
                            json: post as FeedViewPost,
                            now,
                            nextQueryParams,
                            t,
                            handleValueChange: handleValueChange,
                            handleSaveScrollPosition: handleSaveScrollPosition,
                            zenMode,
                        }
                        return {
                            postProps,
                        }
                    }
                )

                data = [...data, ...timelineData]
            }
        } else {
            if (feedInfo?.purpose === "app.bsky.graph.defs#modlist") {
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

                data = [...data, ...timelineData]
            } else if (feedInfo?.purpose === "app.bsky.graph.defs#curatelist") {
                const timelineData: CustomFeedCellProps[] = Array.from({
                    length: 20,
                }).map(() => {
                    const postProps: ViewPostCardProps = {
                        isSkeleton: true,
                        isMobile,
                        bodyText: undefined,
                        now,
                        nextQueryParams,
                        t,
                        zenMode,
                    }

                    return {
                        postProps,
                    }
                })

                data = [...data, ...timelineData]
            }
        }

        if (data.length > 0) {
            data = [{ isDummyHeader: true }, ...data]
        }

        return data
    }, [feedInfo, timeline, isSubscribed])

    return (
        <SwiperContainer props={{ page: "list" }}>
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
                                        scrollPositions[`list-${atUri}`]
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
                                                `feedInfo-${item?.feedProps?.feedInfo?.uri}` ||
                                                `actor-${item?.profileProps?.json?.did}` ||
                                                `actor-${item?.postProps?.postJson?.uri}`
                                            }
                                            {...item}
                                        />
                                    )}
                                    endReached={loadMore}
                                    className={nullTimeline()}
                                />
                                <ScrollToTopButton
                                    scrollRef={scrollRef}
                                    scrollIndex={scrollIndex}
                                />
                            </div>
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
    profileProps?: ViewUserProfileCardCellProps
    postProps?: ViewPostCardProps
}

const CustomFeedCell = (props: CustomFeedCellProps) => {
    const { isDummyHeader, feedProps, profileProps, postProps } = props

    if (isDummyHeader) {
        return <DummyHeader />
    }

    if (feedProps) {
        return <FeedHeaderComponent {...feedProps} />
    }

    if (profileProps) {
        return <ViewUserProfileCardCell {...profileProps} />
    }

    if (postProps) {
        if (postProps.isSkeleton) return <ViewPostCardSkelton zenMode />
        return <ViewPostCard {...postProps} />
    }
}

interface FeedProps {
    feedInfo?: ListView | null
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
    const [isSubscribed1, setIsSubscribed1] = useState<boolean | undefined>(
        isSubscribed
    )

    const { isOpen, onOpen, onOpenChange } = useDisclosure()

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

    useEffect(() => {
        if (isSubscribed === undefined) return
        setIsSubscribed1(isSubscribed)
    }, [isSubscribed])

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
                            initialEmbedType={"list"}
                        />
                    )}
                </ModalContent>
            </Modal>
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
                                <DropdownItem key="share" onClick={onOpen}>
                                    {t("pages.feedOnlyPage.postThisFeed")}
                                </DropdownItem>
                                <DropdownItem
                                    key="new"
                                    onClick={() => {
                                        if (!feedInfo) return
                                        const aturl = new AtUri(feedInfo?.uri)
                                        void navigator.clipboard.writeText(
                                            `https://bsky.app/profile/${aturl.hostname}/lists/${aturl.rkey}`
                                        )
                                    }}
                                >
                                    {t("pages.feedOnlyPage.copyFeedURL")}
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
                            onClick={() => {
                                try {
                                    onClick
                                    if (isSubscribed1) {
                                        setIsSubscribed1(false)
                                    } else {
                                        setIsSubscribed1(true)
                                    }
                                } catch (e) {
                                    console.log(e)
                                }
                            }}
                            isDisabled={
                                isSkeleton ||
                                feedInfo?.purpose ===
                                    "app.bsky.graph.defs#curatelist"
                            }
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
                                feedInfo?.creator.handle
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
        </>
    )
}
