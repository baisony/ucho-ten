"use client"
import { useAgent } from "@/app/_atoms/agent"
import React, { useEffect, useRef, useState } from "react"
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

const Page = () => {
    const [currentMenuType, setCurrentMenuType] = useCurrentMenuType()
    setCurrentMenuType("myFeeds")

    const [menuIndex, setMenuIndex] = useAtom(menuIndexAtom)
    const [menuIndexChangedByMenu, setMenuIndexChangedByMenu] =
        useMenuIndexChangedByMenu()

    const swiperRef = useRef<SwiperCore | null>(null)

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
                cssMode={false}
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
                    if (menuIndexChangedByMenu === false) {
                        setMenuIndex(swiper.activeIndex)
                    }
                }}
                onTouchStart={(swiper, event) => {
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
    const [nextQueryParams] = useNextQueryParamsAtom()
    const { background, FeedCard } = layout()
    const [userPreferences, setUserPreferences] = useState<any>(undefined)
    const [isFetching, setIsFetching] = useState<boolean>(false)
    const [savedFeeds, setSavedFeeds] = useState<string[]>([])
    const [, setPinnedFeeds] = useState<string[]>([])
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
        fetchFeeds()
    }, [agent])

    const uriToURL = (uri: string) => {
        const transform_uri = new AtUri(uri)
        return `/profile/${transform_uri.hostname}/feed/${
            transform_uri.rkey
        }?${nextQueryParams.toString()}` as string
    }

    return (
        <>
            <div className={"md:h-[100px] h-[85px]"} />

            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>
                                Would you like to delete{" "}
                                {selectedFeed?.displayName}
                                {" ?"}
                            </ModalHeader>
                            {/* TODO: i18n */}
                            <ModalFooter>
                                <Button
                                    color="danger"
                                    variant="light"
                                    onClick={onClose}
                                >
                                    No
                                </Button>
                                <Button
                                    color="primary"
                                    onClick={async () => {
                                        await handleFeedDelete()
                                        onClose()
                                    }}
                                >
                                    Yes
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
                                ないよー
                            </div>
                        )
                    )}
                </div>
            )}
            {savedFeeds.length !== 0 && (
                <div className={`${background()} w-full h-full`}>
                    {/*@ts-ignore*/}
                    {savedFeeds.map((feed: GeneratorView, index) => {
                        return (
                            <Link
                                className={FeedCard()}
                                key={index}
                                href={uriToURL(feed.uri)}
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
                                                feed?.avatar ||
                                                defaultFeedIcon.src
                                            }
                                            alt={"avatar"}
                                        />
                                    </div>
                                    <div className={"ml-[12px]"}>
                                        <div>{feed?.displayName}</div>
                                        <div className={"text-[12px]"}>
                                            by @{feed?.creator?.handle}
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
                                                    feed.uri
                                                )
                                                    ? `text-[#016EFF]`
                                                    : `text-[#929292]`
                                            }`}
                                            onClick={async (e) => {
                                                e.stopPropagation()
                                                if (
                                                    userPreferences.pinned.includes(
                                                        feed.uri
                                                    )
                                                ) {
                                                    if (isLoading) return
                                                    setIsLoading(true)
                                                    const res =
                                                        await agent?.removePinnedFeed(
                                                            feed.uri
                                                        )
                                                    await fetchFeeds()
                                                    setIsLoading(false)
                                                    console.log(res)
                                                } else {
                                                    if (isLoading) return
                                                    setIsLoading(true)
                                                    const res =
                                                        await agent?.addPinnedFeed(
                                                            feed.uri
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
                                            e.stopPropagation()
                                            setSelectedFeed(feed)
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
                        )
                    })}
                </div>
            )}
        </>
    )
}
