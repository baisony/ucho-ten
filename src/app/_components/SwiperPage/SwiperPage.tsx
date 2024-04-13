"use client"
import { memo, useEffect, useLayoutEffect, useState } from "react"
import { SwiperSlide } from "swiper/react"
import FeedPage from "@/app/_components/FeedPage/FeedPage"
import {
    HeaderMenu,
    useCurrentMenuType,
    useHeaderMenusByHeaderAtom,
    useMenuIndex,
    useMenuIndexChangedByMenu,
} from "@/app/_atoms/headerMenu"
import { useTappedTabbarButtonAtom } from "@/app/_atoms/tabbarButtonTapped"
import { HEADER_MENUS, HeaderMenuType } from "@/app/_constants/headerMenus"
import "swiper/css"
import "swiper/css/pagination"
import { SwiperContainer } from "@/app/_components/SwiperContainer"

const NOW_COUNT_UP_INTERVAL: number = 10 * 1000

interface SwiperPageProps {
    page: HeaderMenuType
}

export const SwiperPage = memo((props: SwiperPageProps) => {
    const { page } = props
    const [, setCurrentMenuType] = useCurrentMenuType()
    const [menuIndex, setMenuIndex] = useMenuIndex()
    const [menus] = useHeaderMenusByHeaderAtom()
    const [, setMenuIndexChangedByMenu] = useMenuIndexChangedByMenu()
    const [tappedTabbarButton] = useTappedTabbarButtonAtom()

    const [now, setNow] = useState<Date>(new Date())
    const [disableSlideVerticalScroll] = useState<boolean>(false)

    useLayoutEffect(() => {
        if (HEADER_MENUS[page] === undefined) return
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

    return (
        <>
            <SwiperContainer props={{ page: page }}>
                {menus[page].map((menu: HeaderMenu, index: number) => {
                    return (
                        <>
                            <SwiperSlide key={index}>
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
                                            feedKey: menu.info,
                                            pageName: page,
                                            disableSlideVerticalScroll,
                                            now,
                                        }}
                                    />
                                </div>
                            </SwiperSlide>
                        </>
                    )
                })}
            </SwiperContainer>
        </>
    )
})
