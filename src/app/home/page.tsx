"use client"

import React, { useEffect, useLayoutEffect, useRef, useState } from "react"
import { useAtom } from "jotai"
import { Swiper, SwiperSlide } from "swiper/react"
import SwiperCore from "swiper/core"
import { Pagination, Virtual } from "swiper/modules"
import FeedPage from "../_components/FeedPage/FeedPage"
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
import { SwiperEmptySlide } from "@/app/_components/SwiperEmptySlide"

SwiperCore.use([Virtual])
const NOW_COUNT_UP_INTERVAL: number = 10 * 1000

const Root = () => {
    const [, setCurrentMenuType] = useCurrentMenuType()
    const [menuIndex, setMenuIndex] = useAtom(menuIndexAtom)
    const [menus] = useHeaderMenusByHeaderAtom()
    const [menuIndexChangedByMenu, setMenuIndexChangedByMenu] =
        useMenuIndexChangedByMenu()
    const [currentMenuType] = useCurrentMenuType()
    const [tappedTabbarButton, setTappedTabbarButton] =
        useTappedTabbarButtonAtom()

    const [now, setNow] = useState<Date>(new Date())
    const [disableSlideVerticalScroll] = useState<boolean>(false)

    const swiperRef = useRef<SwiperCore | null>(null)

    useLayoutEffect(() => {
        setCurrentMenuType("home")
    }, [])

    useEffect(() => {
        if (tappedTabbarButton == "home") {
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
        if (
            currentMenuType === "home" &&
            swiperRef.current &&
            menuIndex !== swiperRef.current.activeIndex
        ) {
            swiperRef.current.slideTo(menuIndex)
        }
    }, [currentMenuType, menuIndex, swiperRef.current])

    return (
        <Swiper
            onSwiper={(swiper) => {
                swiperRef.current = swiper
            }}
            cssMode={isMobile}
            pagination={{ type: "custom", clickable: false }}
            hidden={true} // ??
            modules={[Pagination]}
            className="swiper-home"
            style={{ height: "100%" }}
            touchEventsTarget={"container"}
            touchRatio={1}
            threshold={1}
            resistance={false}
            longSwipes={false}
            initialSlide={menuIndex}
            touchStartForcePreventDefault={true}
            preventInteractionOnTransition={true}
            touchStartPreventDefault={false}
            edgeSwipeDetection={true}
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
        >
            {menus.home.map((menu, index) => {
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
                                <FeedPage
                                    {...{
                                        isActive: index === menuIndex,
                                        isNextActive: index === menuIndex + 1,
                                        feedKey: menu.info,
                                        pageName: "home",
                                        disableSlideVerticalScroll,
                                        now,
                                    }}
                                />
                            </div>
                        </SwiperSlide>
                        {menus.home.length === 1 && (
                            <SwiperSlide>
                                <SwiperEmptySlide />
                            </SwiperSlide>
                        )}
                    </>
                )
            })}
        </Swiper>
    )
}

export default Root
