"use client"

import { isMobile } from "react-device-detect"
import React, { useEffect, useRef, useState } from "react"
import { useAppearanceColor } from "@/app/_atoms/appearanceColor"
import { Swiper, SwiperSlide } from "swiper/react"
import SwiperCore from "swiper/core"
import { Pagination, Virtual } from "swiper/modules"
import FeedPage from "./components/FeedPage/FeedPage"
// import LazyFeedPage from "./components/FeedPage/LazyFeedPage"
import { useHeaderMenusAtom, useMenuIndexAtom } from "./_atoms/headerMenu"

import "swiper/css"
import "swiper/css/pagination"

SwiperCore.use([Virtual])

interface HTMLElementEvent<T extends HTMLElement> extends Event {
    target: T
}

const Root = () => {
    const [appearanceColor] = useAppearanceColor()
    const [menuIndex, setMenuIndex] = useMenuIndexAtom()
    const [headerMenus] = useHeaderMenusAtom()

    const [darkMode, setDarkMode] = useState(false)
    const [now, setNow] = useState<Date>(new Date())
    const [disableSlideVerticalScroll, setDisableSlideVerticalScroll] =
        useState<boolean>(false)

    const swiperRef = useRef<SwiperCore | null>(null)

    const [isAvailableMenus, setIsAvailableMenus] = useState<boolean>(false)

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
        const intervalId = setInterval(() => {
            setNow(new Date())
        }, 60 * 1000)

        return () => {
            clearInterval(intervalId)
        }
    }, [])

    useEffect(() => {
        if (!swiperRef.current) {
            return
        }

        if (menuIndex !== swiperRef.current.activeIndex) {
            swiperRef.current.slideTo(menuIndex)
        }
    }, [menuIndex])

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

    useEffect(() => {
        const hasValidInfo = headerMenus.every(
            (item) => item.info === "following" || item.info.startsWith("at://")
        )

        if (hasValidInfo) {
            setIsAvailableMenus(true)
        }
    }, [headerMenus])

    return (
        isAvailableMenus && (
            <>
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
                    onSlideChange={(swiper) => {
                        setMenuIndex(swiper.activeIndex)
                    }}
                >
                    {headerMenus.map((menu, index) => {
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
                                    <FeedPage
                                        {...{
                                            isActive: menuIndex === index,
                                            feedKey: menu.info,
                                            color,
                                            disableSlideVerticalScroll,
                                            now,
                                        }}
                                    />
                                </div>
                            </SwiperSlide>
                        )
                    })}
                </Swiper>
            </>
        )
    )
}

export default Root
