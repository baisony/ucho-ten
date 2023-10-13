"use client"

import React, { useEffect, useRef, useState } from "react"
import { useAppearanceColor } from "@/app/_atoms/appearanceColor"
import { Swiper, SwiperSlide } from "swiper/react"
import SwiperCore from "swiper/core"
import { Pagination } from "swiper/modules"
// import FeedPage from "./components/FeedPage/FeedPage"
import LazyFeedPage from "./components/FeedPage/LazyFeedPage"
import { useHeaderMenusAtom, useMenuIndexAtom } from "./_atoms/headerMenu"

import "swiper/css"
import "swiper/css/pagination"

const Root = () => {
    const [appearanceColor] = useAppearanceColor()
    const [menuIndex, setMenuIndex] = useMenuIndexAtom()
    const [headerMenus] = useHeaderMenusAtom()

    const [darkMode, setDarkMode] = useState(false)
    const [now, setNow] = useState<Date>(new Date())

    const swiperRef = useRef<SwiperCore | null>(null)

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

    return (
        <>
            <Swiper
                onSwiper={(swiper) => {
                    swiperRef.current = swiper
                }}
                pagination={{ type: "custom", clickable: false }}
                hidden={true}
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
                        <SwiperSlide key={`swiperslide-home-${index}`}>
                            <div
                                id={`swiperIndex-div-${index}`}
                                key={index}
                                style={{
                                    overflowY: "auto",
                                    height: "100%",
                                }}
                            >
                                <LazyFeedPage
                                    {...{
                                        isActive: menuIndex === index,
                                        feedKey: menu.info,
                                        color,
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
}

export default Root
