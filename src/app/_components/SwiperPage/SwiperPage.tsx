"use client"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { useAtom } from "jotai"
import { SwiperSlide } from "swiper/react"
import SwiperCore from "swiper/core"
import { Virtual } from "swiper/modules"
import FeedPage from "@/app/_components/FeedPage/FeedPage"
import {
    HeaderMenu,
    menuIndexAtom,
    useCurrentMenuType,
    useHeaderMenusByHeaderAtom,
    useMenuIndexChangedByMenu,
} from "@/app/_atoms/headerMenu"
import { useTappedTabbarButtonAtom } from "@/app/_atoms/tabbarButtonTapped"
import { SwiperEmptySlide } from "@/app/_components/SwiperEmptySlide"
import { HEADER_MENUS } from "@/app/_constants/headerMenus"
import "swiper/css"
import "swiper/css/pagination"
import { SwiperContainer } from "@/app/_components/SwiperContainer"

SwiperCore.use([Virtual])
const NOW_COUNT_UP_INTERVAL: number = 10 * 1000

interface SwiperPageProps {
    page: string
}

export const SwiperPage = (props: SwiperPageProps) => {
    const { page } = props
    const [, setCurrentMenuType] = useCurrentMenuType()
    const [menuIndex, setMenuIndex] = useAtom(menuIndexAtom)
    const [menus] = useHeaderMenusByHeaderAtom()
    const [, setMenuIndexChangedByMenu] = useMenuIndexChangedByMenu()
    const [currentMenuType] = useCurrentMenuType()
    const [tappedTabbarButton] = useTappedTabbarButtonAtom()

    const [now, setNow] = useState<Date>(new Date())
    const [disableSlideVerticalScroll] = useState<boolean>(false)

    const swiperRef = useRef<SwiperCore | null>(null)

    useLayoutEffect(() => {
        //@ts-ignore
        if (HEADER_MENUS[page] === undefined) return
        //@ts-ignore
        setCurrentMenuType(`${page}`)
    }, [])

    useEffect(() => {
        if (tappedTabbarButton == `${page}`) {
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
            currentMenuType === `${page}` &&
            swiperRef.current &&
            menuIndex !== swiperRef.current.activeIndex
        ) {
            swiperRef.current.slideTo(menuIndex)
        }
    }, [currentMenuType, menuIndex, swiperRef.current])
    return (
        <>
            <SwiperContainer
                //@ts-ignore
                props={{ page: page }}
            >
                {/*//@ts-ignore*/}
                {menus[page].map((menu: HeaderMenu, index: number) => {
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
                                            isNextActive:
                                                index === menuIndex + 1,
                                            feedKey: menu.info,
                                            pageName: page,
                                            disableSlideVerticalScroll,
                                            now,
                                        }}
                                    />
                                </div>
                            </SwiperSlide>
                            {/*//@ts-ignore*/}
                            {menus[page].length === 1 && (
                                <SwiperSlide>
                                    <SwiperEmptySlide />
                                </SwiperSlide>
                            )}
                        </>
                    )
                })}
            </SwiperContainer>
        </>
    )
}
