"use client"
import { useBookmarks } from "@/app/_atoms/bookmarks"
import { useAgent } from "@/app/_atoms/agent"
import React, { useEffect, useLayoutEffect, useRef, useState } from "react"
import { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { ViewPostCard } from "@/app/_components/ViewPostCard"
import { useNextQueryParamsAtom } from "../_atoms/nextQueryParams"
import { useTranslation } from "react-i18next"
import { processPostBodyText } from "../_lib/post/processPostBodyText"
import { isMobile } from "react-device-detect"
import { Virtuoso } from "react-virtuoso"
import { tabBarSpaceStyles } from "@/app/_components/TabBar/tabBarSpaceStyles"
import { useScrollPositions } from "@/app/_atoms/scrollPosition"
import { DummyHeader } from "@/app/_components/DummyHeader"
import { Swiper, SwiperSlide } from "swiper/react"
import SwiperCore from "swiper/core"

SwiperCore.use([Virtual])
import { Pagination, Virtual } from "swiper/modules"
import {
    menuIndexAtom,
    useCurrentMenuType,
    useHeaderMenusByHeaderAtom,
    useMenuIndexChangedByMenu,
} from "../_atoms/headerMenu"
import { useTappedTabbarButtonAtom } from "../_atoms/tabbarButtonTapped"

import "swiper/css"
import "swiper/css/pagination"
import { useAtom } from "jotai"
import { SwiperEmptySlide } from "@/app/_components/SwiperEmptySlide"

export default function Root() {
    const [, setCurrentMenuType] = useCurrentMenuType()
    const { t } = useTranslation()
    const { nullTimeline, notNulltimeline } = tabBarSpaceStyles()
    const [agent] = useAgent()
    const [nextQueryParams] = useNextQueryParamsAtom()
    const [bookmarks, setBookmarks] = useBookmarks()
    const [timeline, setTimeline] = useState<PostView[]>([])

    const virtuosoRef = useRef(null)
    const [scrollPositions, setScrollPositions] = useScrollPositions()

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
        setCurrentMenuType("bookmarks")
    }, [])

    const fetchBookmarks = async () => {
        if (!agent) {
            return
        }
        const maxBatchSize = 25 // 1つのリクエストに許容される最大数
        const batches = []
        //console.log(bookmarks[0][agent?.session?.did])
        console.log(bookmarks)
        for (let i = 0; i < bookmarks.length; i += maxBatchSize) {
            const batch = bookmarks
                .slice(i, i + maxBatchSize)
                .map((bookmark) => bookmark.uri)
            batches.push(batch)
        }
        //console.log(batches)
        const results = []
        for (const batch of batches) {
            //@ts-ignore
            const { data } = await agent?.getPosts({ uris: batch })
            const { posts } = data
            results.push(...posts)
        }
        setTimeline(results)
    }

    const handleValueChange = (newValue: any) => {
        //setText(newValue);
        console.log(newValue)
        console.log(timeline)
        if (!timeline) return
        const foundObject = timeline.findIndex(
            (item) => item.uri === newValue.postUri
        )

        if (foundObject !== -1) {
            console.log(timeline[foundObject])
            switch (newValue.reaction) {
                case "like":
                    setTimeline((prevData) => {
                        //@ts-ignore
                        const updatedData = [...prevData]
                        if (
                            updatedData[foundObject] &&
                            updatedData[foundObject]?.viewer
                        ) {
                            updatedData[foundObject].viewer!.like =
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
                            updatedData[foundObject]?.viewer
                        ) {
                            updatedData[foundObject].viewer!.like = undefined
                        }
                        return updatedData
                    })
                    break
                case "repost":
                    setTimeline((prevData) => {
                        const updatedData = [...prevData]
                        if (
                            updatedData[foundObject] &&
                            updatedData[foundObject]?.viewer
                        ) {
                            updatedData[foundObject].viewer!.repost =
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
                            updatedData[foundObject]?.viewer
                        ) {
                            updatedData[foundObject].viewer!.repost = undefined
                        }
                        return updatedData
                    })
                    break
                case "delete":
                    setTimeline((prevData) => {
                        const updatedData = [...prevData]
                        const removedItem = updatedData.splice(foundObject, 1)
                        return updatedData
                    })
                //timeline.splice(foundObject, 1)
            }
            console.log(timeline)
        } else {
            console.log(
                "指定されたURIを持つオブジェクトは見つかりませんでした。"
            )
        }
    }

    const handleSaveScrollPosition = () => {
        console.log("save")
        //@ts-ignore
        virtuosoRef?.current?.getState((state) => {
            console.log(state)
            if (
                state.scrollTop !==
                //@ts-ignore
                scrollPositions[`bookmark`]?.scrollTop
            ) {
                const updatedScrollPositions = { ...scrollPositions }
                //@ts-ignore
                updatedScrollPositions[`bookmark`] = state
                setScrollPositions(updatedScrollPositions)
            }
        })
    }

    useEffect(() => {
        fetchBookmarks()
    }, [agent])

    return (
        <>
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
            >
                {menus.inbox.map((menu, index) => {
                    return (
                        <>
                            <SwiperSlide key={`swiperslide-home-${index}`}>
                                <div className={"h-full w-full z-[100]"}>
                                    {timeline.length !== 0 && (
                                        <Virtuoso
                                            scrollerRef={(ref) => {
                                                if (
                                                    ref instanceof HTMLElement
                                                ) {
                                                    //scrollRef.current = ref
                                                }
                                            }}
                                            //context={{ hasMore }}
                                            ref={virtuosoRef}
                                            restoreStateFrom={
                                                //@ts-ignore
                                                scrollPositions[`bookmark`]
                                            }
                                            overscan={200}
                                            increaseViewportBy={200}
                                            data={timeline}
                                            atTopThreshold={100}
                                            atBottomThreshold={100}
                                            itemContent={(index, data) => (
                                                <ViewPostCard
                                                    key={`bookmark-${data.uri}`}
                                                    {...{
                                                        isMobile,
                                                        isSkeleton: false,
                                                        bodyText:
                                                            processPostBodyText(
                                                                nextQueryParams,
                                                                data || null
                                                            ),
                                                        postJson: data || null,
                                                        nextQueryParams,
                                                        t,
                                                        handleValueChange:
                                                            handleValueChange,
                                                        handleSaveScrollPosition:
                                                            handleSaveScrollPosition,
                                                    }}
                                                />
                                            )}
                                            components={{
                                                Header: () => <DummyHeader />,
                                            }}
                                            //endReached={loadMore}
                                            className={nullTimeline()}
                                        />
                                    )}
                                    {timeline.length === 0 && (
                                        <div
                                            className={
                                                "w-full h-full flex items-center justify-center text-black dark:text-white"
                                            }
                                        >
                                            {t("pages.bookmarks.noContent")}
                                        </div>
                                    )}
                                </div>
                            </SwiperSlide>
                            <SwiperSlide>
                                <SwiperEmptySlide />
                            </SwiperSlide>
                        </>
                    )
                })}
            </Swiper>
        </>
    )
}
