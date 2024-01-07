"use client"
import { useAgent } from "@/app/_atoms/agent"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import Link from "next/link"
import { layout } from "./styles"
import {
    Button,
    Modal,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Spinner,
    useDisclosure,
} from "@nextui-org/react"
import { AtUri } from "@atproto/api"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBars, faGear, faThumbTack } from "@fortawesome/free-solid-svg-icons"
import defaultFeedIcon from "@/../public/images/icon/default_feed_icon.svg"
import { GeneratorView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { useNextQueryParamsAtom } from "../_atoms/nextQueryParams"
import {
    menuIndexAtom,
    useCurrentMenuType,
    useMenuIndexChangedByMenu,
} from "../_atoms/headerMenu"

import { Swiper, SwiperSlide } from "swiper/react"
import SwiperCore from "swiper/core"
import { Pagination } from "swiper/modules"

import "swiper/css"
import "swiper/css/pagination"
import { useAtom } from "jotai"
import { isMobile } from "react-device-detect"
import { DummyHeader } from "@/app/_components/DummyHeader"
import { Virtuoso } from "react-virtuoso"
import { useTranslation } from "react-i18next"
import { ListFooterSpinner } from "@/app/_components/ListFooterSpinner"
import { ListFooterNoContent } from "@/app/_components/ListFooterNoContent"

const Page = () => {
    const [currentMenuType, setCurrentMenuType] = useCurrentMenuType()
    const [menuIndex, setMenuIndex] = useAtom(menuIndexAtom)
    const [menuIndexChangedByMenu, setMenuIndexChangedByMenu] =
        useMenuIndexChangedByMenu()

    const swiperRef = useRef<SwiperCore | null>(null)

    useLayoutEffect(() => {
        setCurrentMenuType("myFeeds")
    }, [])

    useEffect(() => {
        if (
            currentMenuType === "myFeeds" &&
            swiperRef.current &&
            menuIndex !== swiperRef.current.activeIndex
        ) {
            swiperRef.current.slideTo(menuIndex)
        }
    }, [currentMenuType, menuIndex, swiperRef.current])

    return (
        <>
            <Swiper
                onSwiper={(swiper) => {
                    swiperRef.current = swiper
                }}
                cssMode={isMobile}
                pagination={{ type: "custom", clickable: false }}
                modules={[Pagination]}
                className="swiper-my-feeds"
                style={{ height: "100%" }}
                touchAngle={30}
                touchRatio={0.8}
                touchReleaseOnEdges={true}
                touchMoveStopPropagation={true}
                preventInteractionOnTransition={true}
                onActiveIndexChange={(swiper) => {
                    if (!menuIndexChangedByMenu) {
                        setMenuIndex(swiper.activeIndex)
                    }
                }}
                onTouchStart={() => {
                    setMenuIndexChangedByMenu(false)
                }}
            >
                <SwiperSlide>
                    <MyFeedsPage />
                </SwiperSlide>
                <SwiperSlide>
                    <div className="w-full h-full"></div>
                </SwiperSlide>
            </Swiper>
        </>
    )
}

export default Page

const MyFeedsPage = () => {
    const [agent] = useAgent()
    const { t } = useTranslation()
    const [nextQueryParams] = useNextQueryParamsAtom()
    const { background, FeedCard } = layout()
    const [userPreferences, setUserPreferences] = useState<any>(undefined)
    const [isFetching, setIsFetching] = useState<boolean>(false)
    const [savedFeeds, setSavedFeeds] = useState<GeneratorView[]>([])
    const [, setPinnedFeeds] = useState<GeneratorView[]>([])
    const [isLoading, setIsLoading] = useState<boolean | null>(null)
    const [selectedFeed, setSelectedFeed] = useState<GeneratorView | null>(null)
    const { isOpen, onOpen, onOpenChange } = useDisclosure()

    const fetchFeeds = async () => {
        if (!agent) {
            return
        }

        try {
            setIsFetching(true)
            const { feeds } = await agent.getPreferences()
            setUserPreferences(feeds)
            const saved = await agent.app.bsky.feed.getFeedGenerators({
                feeds: feeds.saved as string[],
            })
            const pinned = await agent.app.bsky.feed.getFeedGenerators({
                feeds: feeds.pinned as string[],
            })
            setSavedFeeds((saved.data as any).feeds || [])
            setPinnedFeeds((pinned.data as any).feeds || [])
            setIsFetching(false)
        } catch (e) {
            setIsFetching(false)
            console.error(e)
        }
    }
    const handleFeedDelete = async () => {
        if (!agent) {
            return
        }
        if (!selectedFeed) {
            return
        }

        try {
            setIsLoading(true)
            const res = await agent.removeSavedFeed(selectedFeed.uri)
            await fetchFeeds()
            setIsLoading(false)
            console.log(res)
        } catch (e) {
            setIsLoading(false)
            console.log(e)
        }
    }

    useEffect(() => {
        void fetchFeeds()
    }, [agent])

    const uriToURL = (uri: string) => {
        const transform_uri = new AtUri(uri)
        return `/profile/${transform_uri.hostname}/feed/${
            transform_uri.rkey
        }?${nextQueryParams.toString()}` as string
    }

    return (
        <div className={"h-full w-full z-[100]"}>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>
                                {t("pages.feeds.deleteFeed?")}
                                {`"${selectedFeed?.displayName}" ?`}
                            </ModalHeader>
                            <ModalFooter>
                                <Button
                                    color="danger"
                                    variant="light"
                                    onClick={onClose}
                                >
                                    {t("button.no")}
                                </Button>
                                <Button
                                    color="primary"
                                    onClick={async () => {
                                        await handleFeedDelete()
                                        onClose()
                                    }}
                                >
                                    {t("button.yes")}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
            {savedFeeds.length === 0 && (
                <div
                    className={`${background()} w-full h-full flex items-center justify-center`}
                >
                    {isFetching ? (
                        <div>
                            <Spinner />
                        </div>
                    ) : (
                        !isFetching ?? (
                            <div className={`text-white dark:text-black`}>
                                {/* FIXME: WTF is this? */}
                                {t("pages.feeds.notFound")}
                            </div>
                        )
                    )}
                </div>
            )}
            {savedFeeds.length !== 0 && (
                <Virtuoso
                    overscan={200}
                    increaseViewportBy={200}
                    data={savedFeeds}
                    atTopThreshold={100}
                    atBottomThreshold={100}
                    itemContent={(index, data) => (
                        <>
                            <Link
                                className={FeedCard()}
                                key={index}
                                href={uriToURL(data?.uri)}
                            >
                                <div className={"flex items-center ml-[12px]"}>
                                    <div className={"hidden"}>
                                        <FontAwesomeIcon
                                            icon={faBars}
                                            className={"text-gray-400"}
                                        />
                                    </div>
                                    <div
                                        className={
                                            "h-[50px] w-[50px] overflow-hidden rounded-[10px] ml-[12px]"
                                        }
                                    >
                                        <img
                                            src={
                                                data?.avatar ||
                                                defaultFeedIcon.src
                                            }
                                            alt={"avatar"}
                                        />
                                    </div>
                                    <div className={"ml-[12px]"}>
                                        <div>{data?.displayName}</div>
                                        <div className={"text-[12px]"}>
                                            by @{data?.creator?.handle}
                                        </div>
                                    </div>
                                </div>
                                <div className={"mr-[28px] flex items-center"}>
                                    <div className={"mr-[28px] cursor-pointer"}>
                                        <FontAwesomeIcon
                                            icon={faThumbTack}
                                            size={"lg"}
                                            className={` ${
                                                userPreferences.pinned.includes(
                                                    data.uri
                                                )
                                                    ? `text-[#016EFF]`
                                                    : `text-[#929292]`
                                            }`}
                                            onClick={async (e) => {
                                                e.preventDefault()
                                                if (
                                                    userPreferences.pinned.includes(
                                                        data.uri
                                                    )
                                                ) {
                                                    if (isLoading) return
                                                    setIsLoading(true)
                                                    const res =
                                                        await agent?.removePinnedFeed(
                                                            data.uri
                                                        )
                                                    await fetchFeeds()
                                                    setIsLoading(false)
                                                    console.log(res)
                                                } else {
                                                    if (isLoading) return
                                                    setIsLoading(true)
                                                    const res =
                                                        await agent?.addPinnedFeed(
                                                            data.uri
                                                        )
                                                    await fetchFeeds()
                                                    setIsLoading(false)
                                                    console.log(res)
                                                }
                                            }}
                                        />
                                    </div>
                                    <div
                                        className={"cursor-pointer"}
                                        onClick={async (e) => {
                                            e.preventDefault()
                                            setSelectedFeed(data)
                                            onOpen()
                                        }}
                                    >
                                        <FontAwesomeIcon
                                            icon={faGear}
                                            size={"lg"}
                                            className={"text-[#929292]"}
                                        />
                                    </div>
                                </div>
                            </Link>
                        </>
                    )}
                    components={{
                        Header: () => <DummyHeader />,
                    }}
                />
            )}
        </div>
    )
}
