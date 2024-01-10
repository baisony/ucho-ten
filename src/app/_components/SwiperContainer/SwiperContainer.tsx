"use client"
import React, { useEffect, useLayoutEffect, useRef, useState } from "react"
import { useAtom } from "jotai"
import { Swiper } from "swiper/react"
import SwiperCore from "swiper/core"
import { Pagination, Virtual } from "swiper/modules"
import {
    menuIndexAtom,
    useCurrentMenuType,
    useMenuIndexChangedByMenu,
} from "@/app/_atoms/headerMenu"
import { useTappedTabbarButtonAtom } from "@/app/_atoms/tabbarButtonTapped"

import { isMobile } from "react-device-detect"
import { HEADER_MENUS, HeaderMenuType } from "@/app/_constants/headerMenus"

SwiperCore.use([Virtual])
const NOW_COUNT_UP_INTERVAL: number = 10 * 1000

interface SwiperPageProps {
    page: HeaderMenuType
}

export function SwiperContainer({
    children,
    props,
}: {
    children: React.ReactNode
    props: SwiperPageProps
}) {
    const { page } = props
    const [, setCurrentMenuType] = useCurrentMenuType()
    const [menuIndex, setMenuIndex] = useAtom(menuIndexAtom)
    const [menuIndexChangedByMenu, setMenuIndexChangedByMenu] =
        useMenuIndexChangedByMenu()
    const [currentMenuType] = useCurrentMenuType()
    const [tappedTabbarButton, setTappedTabbarButton] =
        useTappedTabbarButtonAtom()

    const [now, setNow] = useState<Date>(new Date())

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
                {children}
            </Swiper>
        </>
    )
}
