"use client"
import React, { useEffect, useLayoutEffect, useRef } from "react"
import { Swiper } from "swiper/react"
import SwiperCore from "swiper/core"
import { Pagination, Virtual } from "swiper/modules"
import {
    useCurrentMenuType,
    useMenuIndex,
    useMenuIndexChangedByMenu,
} from "@/app/_atoms/headerMenu"
import { useTappedTabbarButtonAtom } from "@/app/_atoms/tabbarButtonTapped"

import { isMobile } from "react-device-detect"
import { HEADER_MENUS, HeaderMenuType } from "@/app/_constants/headerMenus"

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
    const [menuIndex, setMenuIndex] = useMenuIndex()
    const [menuIndexChangedByMenu, setMenuIndexChangedByMenu] =
        useMenuIndexChangedByMenu()
    const [currentMenuType] = useCurrentMenuType()
    const [tappedTabbarButton, setTappedTabbarButton] =
        useTappedTabbarButtonAtom()

    const swiperRef = useRef<SwiperCore | null>(null)

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
        if (currentMenuType !== page) return
        if (
            currentMenuType === `${page}` &&
            swiperRef.current &&
            menuIndex !== swiperRef.current.activeIndex
        ) {
            swiperRef.current.slideTo(menuIndex)
        }
    }, [page, currentMenuType, menuIndex, swiperRef.current])

    return (
        <>
            <Swiper
                onSwiper={(swiper) => {
                    swiperRef.current = swiper
                }}
                //@ts-ignore
                ref={swiperRef}
                cssMode={isMobile}
                pagination={{ type: "custom", clickable: false }}
                hidden={true} // ??
                modules={[Pagination, Virtual]}
                className="swiper-home"
                style={{ height: "100%" }}
                touchEventsTarget={"container"}
                touchRatio={1}
                threshold={1}
                resistance={false}
                longSwipes={false}
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
