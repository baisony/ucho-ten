"use client"

import React, { useEffect, useRef, useState } from "react"
import { useUserPreferencesAtom } from "@/app/_atoms/preferences"
import { useAgent } from "@/app/_atoms/agent"
import { useTranslation } from "react-i18next"
import { useNextQueryParamsAtom } from "../_atoms/nextQueryParams"
import {
    menuIndexAtom,
    useCurrentMenuType,
    useHeaderMenusByHeaderAtom,
    useMenuIndexChangedByMenu,
} from "../_atoms/headerMenu"
import { useAtom } from "jotai"
import { Swiper, SwiperSlide } from "swiper/react"
import SwiperCore from "swiper/core"
import { Pagination } from "swiper/modules"

import "swiper/css"
import "swiper/css/pagination"
import { isMobile } from "react-device-detect"
import { layout } from "@/app/search/styles"
import Link from "next/link"
import { useSearchInfoAtom } from "@/app/_atoms/searchInfo"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import SearchPostPage from "@/app/search/posts"
import SearchActorPage from "@/app/search/actors"
import SearchFeedPage from "@/app/search/feeds"
import { useTappedTabbarButtonAtom } from "@/app/_atoms/tabbarButtonTapped"
import { useQueryClient } from "@tanstack/react-query"

const Page = () => {
    const pathname = usePathname()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [searchInfo, setSearchInfo] = useSearchInfoAtom()
    const [searchText, setSearchText] = useState("")
    const [searchTarget, setSearchTarget] = useState("")
    const [userPreferences] = useUserPreferencesAtom()
    const [currentMenuType, setCurrentMenuType] = useCurrentMenuType()
    const { t } = useTranslation()
    const { searchSupportCard } = layout()
    const [menus] = useHeaderMenusByHeaderAtom()
    const [menuIndex, setMenuIndex] = useAtom(menuIndexAtom)
    const [menuIndexChangedByMenu, setMenuIndexChangedByMenu] =
        useMenuIndexChangedByMenu()
    const [tappedTabbarButton, setTappedTabbarButton] =
        useTappedTabbarButtonAtom()

    const [agent] = useAgent()
    const [nextQueryParams] = useNextQueryParamsAtom()

    const swiperRef = useRef<SwiperCore | null>(null)
    const queryClient = useQueryClient()

    useEffect(() => {
        switch (searchTarget) {
            case "posts":
                setMenuIndex(0)
                break
            case "users":
                setMenuIndex(1)
                break
            case "feeds":
                setMenuIndex(2)
                break
            default:
                setMenuIndex(0)
                break
        }
    }, [])

    useEffect(() => {
        if (!searchParams) return
        setSearchTarget(searchParams.get("target") || "posts")
        setSearchText(searchParams.get("word") || "")
    }, [searchParams])

    useEffect(() => {
        if (searchInfo.searchWord !== searchParams.get("word")) {
            setCurrentMenuType("searchTop")
            return
        }

        setCurrentMenuType("search")
        const target = searchTarget || "posts"
        const word = searchParams.get("word") || ""

        setSearchTarget(target)
        setSearchText(word)
    }, [searchParams, searchInfo.target, searchInfo.searchWord])

    useEffect(() => {
        const searchParamsWord = searchParams.get("word")
        const searchParamsTarget = searchParams.get("word")

        if (
            searchParamsWord !== "" &&
            searchParamsWord !== null &&
            searchParamsTarget !== "" &&
            searchParamsTarget !== null
        ) {
            return
        }

        if (searchInfo.searchWord === "") {
            return
        }

        if (searchInfo.target === "") {
            return
        }

        setSearchTarget(searchInfo.target)
        setSearchText(searchInfo.searchWord)

        //cursor.current = ""

        const queryParams = new URLSearchParams(nextQueryParams)

        queryParams.set("target", searchInfo.target)
        queryParams.set("word", searchInfo.searchWord)

        console.log("here")
        router.replace(`/search?${queryParams.toString()}`)

        console.log("start search")
        //startSearch()
    }, [pathname])

    useEffect(() => {
        if (tappedTabbarButton === "search") {
            resetAll()
        }
    }, [tappedTabbarButton])

    useEffect(() => {
        if (searchTarget === "") {
            return
        }

        setSearchInfo((prevSearchInfo) => {
            const newSearchInfo = prevSearchInfo

            newSearchInfo.searchWord = searchText
            newSearchInfo.target = searchTarget

            return newSearchInfo
        })
    }, [searchTarget, searchText])

    useEffect(() => {
        console.log(searchText, searchTarget)

        if (searchText === "") {
            //setLoading(false)
            return
        }

        console.log("start search")
        //startSearch()
    }, [agent, searchText, searchTarget])

    useEffect(() => {
        if (currentMenuType !== "search") {
            return
        }

        if (menus.search.length === 0 || menus.search.length < menuIndex) {
            return
        }

        const target = menus.search[menuIndex].info

        setSearchTarget(target)

        console.log(target)

        setSearchInfo((prevSearchInfo) => {
            const newSearchInfo = prevSearchInfo

            newSearchInfo.target = target

            return newSearchInfo
        })
    }, [menuIndex])

    useEffect(() => {
        if (
            currentMenuType === "search" &&
            swiperRef.current &&
            menuIndex !== swiperRef.current.activeIndex
        ) {
            swiperRef.current.slideTo(menuIndex)
        }
    }, [currentMenuType, menuIndex, swiperRef.current])

    const resetAll = () => {
        console.log("resetall")
        setCurrentMenuType("searchTop")
        setSearchTarget("")
        setSearchText("")
        queryClient.resetQueries({ queryKey: ["getSearch"] })

        setSearchInfo({
            target: "",
            searchWord: "",
        })
    }

    const reSearch = (text: string) => {
        setSearchTarget("posts")
        setSearchText(text)
        queryClient.resetQueries({ queryKey: ["getSearch"] })

        setSearchInfo({
            target: searchTarget,
            searchWord: text,
        })
    }
    const findFeeds = () => {
        const queryParams = new URLSearchParams(nextQueryParams)
        queryParams.set("word", "フィード bsky.app")
        queryParams.set("target", "posts")
        return `/search?${queryParams.toString()}` as string
    }
    return (
        <>
            {searchText === "" ? (
                <div className={"w-full h-full text-white"}>
                    <div className={"absolute bottom-0  w-full"}>
                        {t("pages.search.FindPerson")}
                        <Link
                            className={searchSupportCard()}
                            href={`/profile/did:plc:pwlfo4w6auzwihryxik32t6d/feed/ufeed?${nextQueryParams.toString()}`}
                        >
                            <div className={"h-[50px] w-[50px]"}></div>
                            <div>
                                <div>穏やかなSNSを見つめる</div>
                                <div>by @Ucho-ten</div>
                            </div>
                        </Link>
                        <Link
                            className={searchSupportCard()}
                            href={`/profile/did:plc:q6gjnaw2blty4crticxkmujt/feed/cl-japanese?${nextQueryParams.toString()}`}
                        >
                            <div className={"h-[50px] w-[50px]"}></div>
                            <div>
                                <div>Japanese Cluster</div>
                                <div>by @jaz.bsky.social</div>
                            </div>
                        </Link>
                        <Link
                            className={searchSupportCard()}
                            href={findFeeds()}
                        >
                            <div className={"h-[50px] w-[50px]"}></div>
                            <div>
                                <div>日本語フィードを探す</div>
                                {/* TODO: i18n */}
                                <div>by @Ucho-ten</div>
                            </div>
                        </Link>
                    </div>
                </div>
            ) : (
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
                    <SwiperSlide key={`swiperslide-home-0`}>
                        <div
                            id={`swiperIndex-div-${0}`}
                            key={0}
                            style={{
                                overflowY: "auto",
                                height: "100%",
                            }}
                        >
                            <SearchPostPage
                                {...{
                                    isActive: menuIndex === 0,
                                    t,
                                    nextQueryParams,
                                    agent,
                                    searchText,
                                }}
                            />
                        </div>
                    </SwiperSlide>
                    <SwiperSlide key={`swiperslide-home-1`}>
                        <div
                            id={`swiperIndex-div-0`}
                            key={0}
                            style={{
                                overflowY: "auto",
                                height: "100%",
                            }}
                        >
                            <SearchActorPage
                                {...{
                                    t,
                                    agent,
                                    isActive: menuIndex === 1,
                                    nextQueryParams,
                                    searchText,
                                    userPreferences,
                                }}
                            />
                        </div>
                    </SwiperSlide>
                    <SwiperSlide>
                        <SearchFeedPage
                            {...{
                                t,
                                agent,
                                isActive: menuIndex === 2,
                                nextQueryParams,
                                searchText,
                                userPreferences,
                            }}
                        />
                    </SwiperSlide>
                </Swiper>
            )}
        </>
    )
}

export default Page
