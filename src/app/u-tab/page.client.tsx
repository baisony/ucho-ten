"use client"

import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react"
import { SwiperSlide } from "swiper/react"
import SwiperCore from "swiper/core"
import { Virtual } from "swiper/modules"
import FeedPage from "../_components/FeedPage/FeedPage"
import {
    useCurrentMenuType,
    useHeaderMenusByHeaderAtom,
    useMenuIndex,
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
import { DummyHeader } from "@/app/_components/DummyHeader"
import { SwiperContainer } from "@/app/_components/SwiperContainer"

SwiperCore.use([Virtual])

const NOW_COUNT_UP_INTERVAL: number = 10 * 1000

const Root = () => {
    const { t } = useTranslation()
    const [, setCurrentMenuType] = useCurrentMenuType()
    const [agent] = useAgent()
    const [nextQueryParams] = useNextQueryParamsAtom()
    const [menuIndex, setMenuIndex] = useMenuIndex()
    const [menus] = useHeaderMenusByHeaderAtom()
    const [, setMenuIndexChangedByMenu] = useMenuIndexChangedByMenu()
    const [currentMenuType] = useCurrentMenuType()
    const [tappedTabbarButton] = useTappedTabbarButtonAtom()
    const [now, setNow] = useState<Date>(new Date())
    const [disableSlideVerticalScroll] = useState<boolean>(false)

    const swiperRef = useRef<SwiperCore | null>(null)

    const [bookmarks] = useBookmarks()
    const [randomPost, setRandomPost] = useState<PostView | undefined>(
        undefined
    )

    useLayoutEffect(() => {
        setCurrentMenuType("utab")
    }, [])

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
        if (
            currentMenuType === "utab" &&
            swiperRef.current &&
            menuIndex !== swiperRef.current.activeIndex
        ) {
            swiperRef.current.slideTo(menuIndex)
        }
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
        <SwiperContainer props={{ page: "utab" }}>
            {menus.utab.map((menu, index) => {
                console.log(menu)
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
                            {menu.info !== "random-bookmark" && (
                                <FeedPage
                                    {...{
                                        isActive: index === menuIndex,
                                        isViaUFeed: true,
                                        isNextActive: index === menuIndex + 1,
                                        feedKey: menu.info,
                                        pageName: "utab",
                                        disableSlideVerticalScroll,
                                        now,
                                    }}
                                />
                            )}
                            {menu.info === "random-bookmark" &&
                                bookmarks.length > 0 && (
                                    <>
                                        <DummyHeader />
                                        <ViewPostCard
                                            bodyText={processPostBodyText(
                                                nextQueryParams,
                                                randomPost
                                            )}
                                            postJson={randomPost}
                                            isMobile={isMobile}
                                            nextQueryParams={nextQueryParams}
                                        />
                                    </>
                                )}
                        </div>
                    </SwiperSlide>
                )
            })}
        </SwiperContainer>
    )
}

export default Root
