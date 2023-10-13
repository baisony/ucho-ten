"use client"

import React, { useEffect, useRef, useState } from "react"
// import { isMobile } from "react-device-detect"
// import { useAgent } from "@/app/_atoms/agent"
// import type { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
// import { useSearchParams } from "next/navigation"
import { useAppearanceColor } from "@/app/_atoms/appearanceColor"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination } from "swiper/modules"

import "swiper/css"
import "swiper/css/pagination"
import FeedPage from "./components/FeedPage/FeedPage"
// import LazyFeedPage from "./components/FeedPage/LazyFeedPage"
import { useFeedGeneratorsAtom } from "./_atoms/feedGenerators"
import LazyFeedPage from "./components/FeedPage/LazyFeedPage"

export default function Root(props: any) {
    const [appearanceColor] = useAppearanceColor()

    const [loading, setLoading] = useState(false)
    const [darkMode, setDarkMode] = useState(false)
    const [now, setNow] = useState<Date>(new Date())

    // const currentFeed = useRef<string>("")

    const [pinnedFeeds] = useFeedGeneratorsAtom()

    const color: "dark" | "light" = darkMode ? "dark" : "light"

    // const searchParams = useSearchParams()
    // const selectedFeed = searchParams.get("feed") || "following"

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

    return (
        <>
            <Swiper
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
            >
                <SwiperSlide key="following">
                    <div
                        id={`swiperIndex-div-following`}
                        style={{ overflowY: "auto", height: "100%" }}
                    >
                        <LazyFeedPage
                            {...{
                                feedKey: "following",
                                loading,
                                color,
                                now,
                            }}
                        />
                    </div>
                </SwiperSlide>
                {pinnedFeeds &&
                    pinnedFeeds.map((feed, swiperIndex) => {
                        return (
                            <SwiperSlide key={`swiperslide-${swiperIndex}`}>
                                <div
                                    id={`swiperIndex-div-${swiperIndex}`}
                                    key={swiperIndex}
                                    style={{
                                        overflowY: "auto",
                                        height: "100%",
                                    }}
                                >
                                    <LazyFeedPage
                                        {...{
                                            feedKey: feed.uri,
                                            loading,
                                            color,
                                            feed,
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
