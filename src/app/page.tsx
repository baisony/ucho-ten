"use client"

import { isMobile } from "react-device-detect"
import React, { useEffect, useRef, useState } from "react"
import { useAtom } from "jotai"
import { useAppearanceColor } from "@/app/_atoms/appearanceColor"
import { Swiper, SwiperSlide } from "swiper/react"
import SwiperCore from "swiper/core"
import { Pagination, Virtual } from "swiper/modules"
import FeedPage from "./_components/FeedPage/FeedPage"
import FeedPageQuery from "./_components/FeedPage/FeedPageQuery"
// import LazyFeedPage from "./_components/FeedPage/LazyFeedPage"
import {
    HeaderMenuType,
    menuIndexAtom,
    setMenuIndexAtom,
    useCurrentMenuType,
    useHeaderMenusByHeaderAtom,
    useMenuIndexChangedByMenu,
} from "./_atoms/headerMenu"

import "swiper/css"
import "swiper/css/pagination"
import { useTappedTabbarButtonAtom } from "./_atoms/tabbarButtonTapped"

SwiperCore.use([Virtual])

const NOW_COUNT_UP_INTERVAL: number = 10 * 1000

const Root = () => {
    const [appearanceColor] = useAppearanceColor()
    const [menuIndex] = useAtom(menuIndexAtom)
    const [, setMenuIndex] = useAtom(setMenuIndexAtom)
    // const [headerMenus] = useHeaderMenusAtom()
    const [menus] = useHeaderMenusByHeaderAtom()
    const [menuIndexChangedByMenu, setMenuIndexChangedByMenu] =
        useMenuIndexChangedByMenu()
    const [currentMenuType] = useCurrentMenuType()
    const [tappedTabbarButton, setTappedTabbarButton] =
        useTappedTabbarButtonAtom()

    const [darkMode, setDarkMode] = useState(false)
    const [now, setNow] = useState<Date>(new Date())
    const [disableSlideVerticalScroll, setDisableSlideVerticalScroll] =
        useState<boolean>(false)

    const swiperRef = useRef<SwiperCore | null>(null)
    const prevMenyType = useRef<HeaderMenuType>("home")

    // const [isAvailableMenus, setIsAvailableMenus] = useState<boolean>(false)

    const color: "dark" | "light" = darkMode ? "dark" : "light"

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
        console.log("home", currentMenuType, swiperRef.current, menuIndex)
        if (
            currentMenuType === "home" &&
            swiperRef.current &&
            menuIndex !== swiperRef.current.activeIndex
        ) {
            if (currentMenuType !== prevMenyType.current) {
                swiperRef.current.slideTo(menuIndex, 0)
            } else {
                swiperRef.current.slideTo(menuIndex)
            }
        }

        prevMenyType.current = currentMenuType
    }, [currentMenuType, menuIndex, swiperRef.current])

    // useEffect(() => {
    //     const handleTouchMove = (event: TouchEvent) => {
    //         console.log("Scrolling")
    //     }

    //     const handleTouchEnd = (event: TouchEvent) => {
    //         console.log("Not Scrolling")
    //     }

    //     const swiperWrappers =
    //         document.getElementsByClassName("swiper-wrapper")

    //     Array.from(swiperWrappers).forEach((wrapper: Element) => {
    //         if (wrapper instanceof HTMLDivElement) {
    //             console.log("touch moving")
    //             wrapper.addEventListener("touchmove", handleTouchMove)
    //         }
    //     })

    //     Array.from(swiperWrappers).forEach((wrapper: Element) => {
    //         if (wrapper instanceof HTMLDivElement) {
    //             console.log("touch end")
    //             wrapper.addEventListener("touchend", handleTouchEnd)
    //         }
    //     })

    //     // Clean up event listeners
    //     return () => {
    //         Array.from(swiperWrappers).forEach((wrapper: Element) => {
    //             if (wrapper instanceof HTMLDivElement) {
    //                 wrapper.removeEventListener("touchmove", handleTouchMove)
    //             }
    //         })
    //     }
    // }, [swiperRef.current])

    // useEffect(() => {
    //     const hasValidInfo = headerMenus.every(
    //         (item) => item.info === "following" || item.info.startsWith("at://")
    //     )

    //     if (hasValidInfo) {
    //         setIsAvailableMenus(true)
    //     }
    // }, [headerMenus])

    return (
        <Swiper
            onSwiper={(swiper) => {
                swiperRef.current = swiper
            }}
            cssMode={isMobile}
            virtual={true}
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
                if (menuIndexChangedByMenu === false) {
                    setMenuIndex(swiper.activeIndex)
                }

                if (tappedTabbarButton !== null) {
                    setTappedTabbarButton(null)
                }
            }}
            onTouchStart={(swiper, event) => {
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
            {menus.home.map((menu, index) => {
                return (
                    <SwiperSlide
                        key={`swiperslide-home-${index}`}
                        virtualIndex={index}
                    >
                        <div
                            id={`swiperIndex-div-${index}`}
                            key={index}
                            style={{
                                overflowY: "auto",
                                height: "100%",
                            }}
                        >
                            <FeedPageQuery
                                {...{
                                    isActive: menuIndex === index,
                                    feedKey: menu.info,
                                    color,
                                    disableSlideVerticalScroll,
                                    now,
                                }}
                            />
                            {/*<FeedPage*/}
                            {/*    {...{*/}
                            {/*        isActive: menuIndex === index,*/}
                            {/*        feedKey: menu.info,*/}
                            {/*        color,*/}
                            {/*        disableSlideVerticalScroll,*/}
                            {/*        now,*/}
                            {/*    }}*/}
                            {/*/>*/}
                        </div>
                    </SwiperSlide>
                )
            })}
        </Swiper>
    )
}

export default Root
