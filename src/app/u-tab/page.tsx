"use client"

// import { isMobile } from "react-device-detect"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { useAtom } from "jotai"
// import { useAppearanceColor } from "@/app/_atoms/appearanceColor"
import { Swiper, SwiperSlide } from "swiper/react"
import SwiperCore from "swiper/core"
import { Pagination, Virtual } from "swiper/modules"
import FeedPage from "../_components/FeedPage/FeedPage"
// import FeedPageQuery from "./_components/FeedPage/FeedPageQuery"
// import LazyFeedPage from "./_components/FeedPage/LazyFeedPage"
import {
    menuIndexAtom,
    useCurrentMenuType,
    useHeaderMenusByHeaderAtom,
    useMenuIndexChangedByMenu,
} from "../_atoms/headerMenu"
import { useTappedTabbarButtonAtom } from "../_atoms/tabbarButtonTapped"

import "swiper/css"
import "swiper/css/pagination"
import { isMobile } from "react-device-detect"
import { useBookmarks } from "@/app/_atoms/bookmarks"
import { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { useAgent } from "@/app/_atoms/agent"
import { ViewPostCard } from "@/app/_components/ViewPostCard"
import { processPostBodyText } from "@/app/_lib/post/processPostBodyText"
import { useNextQueryParamsAtom } from "@/app/_atoms/nextQueryParams"
import { useTranslation } from "react-i18next"

SwiperCore.use([Virtual])

const NOW_COUNT_UP_INTERVAL: number = 10 * 1000

const Root = () => {
    const { t } = useTranslation()
    const [, setCurrentMenuType] = useCurrentMenuType()
    setCurrentMenuType("utab")
    const [agent] = useAgent()
    const [nextQueryParams] = useNextQueryParamsAtom()
    //const [appearanceColor] = useAppearanceColor()
    const [menuIndex, setMenuIndex] = useAtom(menuIndexAtom)
    // const [headerMenus] = useHeaderMenusAtom()
    const [menus] = useHeaderMenusByHeaderAtom()
    const [menuIndexChangedByMenu, setMenuIndexChangedByMenu] =
        useMenuIndexChangedByMenu()
    const [currentMenuType] = useCurrentMenuType()
    const [tappedTabbarButton, setTappedTabbarButton] =
        useTappedTabbarButtonAtom()

    // const [darkMode, setDarkMode] = useState(false)
    const [now, setNow] = useState<Date>(new Date())
    const [disableSlideVerticalScroll] = useState<boolean>(false)

    const swiperRef = useRef<SwiperCore | null>(null)

    const [bookmarks] = useBookmarks()
    const [randomPost, setRandomPost] = useState<PostView | undefined>(
        undefined
    )

    useEffect(() => {
        if (tappedTabbarButton == "utab") {
            setMenuIndexChangedByMenu(true)
            setMenuIndex(0) // at least home menu has 1 element
        }
    }, [tappedTabbarButton])

    useEffect(() => {
        const intervalId = setInterval(() => {
            setNow(new Date())
        }, NOW_COUNT_UP_INTERVAL)

        return () => {
            clearInterval(intervalId)
        }
    }, [])

    useEffect(() => {
        // console.log("home", currentMenuType, swiperRef.current, menuIndex)
        if (
            currentMenuType === "utab" &&
            swiperRef.current &&
            menuIndex !== swiperRef.current.activeIndex
        ) {
            // if (currentMenuType !== prevMenyType.current) {
            //     swiperRef.current.slideTo(menuIndex, 0)
            // } else {
            swiperRef.current.slideTo(menuIndex)
            // }
        }

        //prevMenyType.current = currentMenuType
    }, [currentMenuType, menuIndex, swiperRef.current])

    const randomBookmark = useCallback(async () => {
        if (!agent) return
        if (bookmarks.length === 0) return
        const index = Math.floor(Math.random() * bookmarks.length)
        const { data } = await agent.getPosts({ uris: [bookmarks[index].uri] })
        const { posts } = await data
        setRandomPost(posts[0])
        console.log(posts[0])
    }, [agent, bookmarks])

    useEffect(() => {
        if (!agent) return
        if (menuIndex !== 1) return
        void randomBookmark()
    }, [agent, menuIndex])

    return (
        <Swiper
            onSwiper={(swiper) => {
                swiperRef.current = swiper
            }}
            cssMode={isMobile}
            // virtual={true}
            pagination={{ type: "custom", clickable: false }}
            hidden={true} // ??
            modules={[Pagination]}
            className="swiper-home"
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

                if (tappedTabbarButton !== null) {
                    setTappedTabbarButton(null)
                }
            }}
            onTouchStart={() => {
                setMenuIndexChangedByMenu(false)
            }}
            // onSlideChangeTransitionEnd={(swiper) => {
            //     setMenuIndex(swiper.activeIndex)
            // }}
            // onSlideChange={(swiper) => {
            //     console.error("onSlideChange", swiper)
            //     setMenuIndex(swiper.activeIndex)
            // }}
        >
            {menus.utab.map((menu, index) => {
                console.log(menu)
                return (
                    <SwiperSlide
                        key={`swiperslide-home-${index}`}
                        // virtualIndex={index}
                    >
                        <div
                            id={`swiperIndex-div-${index}`}
                            key={index}
                            style={{
                                overflowY: "auto",
                                height: "100%",
                            }}
                        >
                            {menu.info !== "random-bookmark" && (
                                <FeedPage
                                    {...{
                                        isActive: index === menuIndex,
                                        isViaUFeed: true,
                                        isNextActive: index === menuIndex + 1,
                                        feedKey: menu.info,
                                        // color,
                                        disableSlideVerticalScroll,
                                        now,
                                    }}
                                />
                            )}
                            {menu.info === "random-bookmark" &&
                                bookmarks.length > 0 && (
                                    <>
                                        <ViewPostCard
                                            isTop={true}
                                            bodyText={processPostBodyText(
                                                nextQueryParams,
                                                randomPost
                                            )}
                                            postJson={randomPost}
                                            isMobile={isMobile}
                                            nextQueryParams={nextQueryParams}
                                            t={t}
                                        />
                                    </>
                                )}
                        </div>
                    </SwiperSlide>
                )
            })}
        </Swiper>
    )
}

export default Root
