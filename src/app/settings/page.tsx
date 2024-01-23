"use client"

import { useEffect, useLayoutEffect, useRef } from "react"
import { useUserPreferencesAtom } from "@/app/_atoms/preferences"
import { useAgent } from "@/app/_atoms/agent"
import { useTranslation } from "react-i18next"
import { useNextQueryParamsAtom } from "../_atoms/nextQueryParams"
import { useCurrentMenuType, useMenuIndex } from "../_atoms/headerMenu"
import { SwiperSlide } from "swiper/react"
import SwiperCore from "swiper/core"

import "swiper/css"
import "swiper/css/pagination"
import { SettingsGeneralPage } from "./general"
import SettingsContentFilteringPage from "@/app/settings/contentFiltering"
import SettingsMutePage from "@/app/settings/mute"
import { SwiperContainer } from "@/app/_components/SwiperContainer"

const Page = () => {
    const [userPreferences] = useUserPreferencesAtom()
    const [currentMenuType, setCurrentMenuType] = useCurrentMenuType()
    const { t } = useTranslation()

    const [menuIndex] = useMenuIndex()

    const [agent] = useAgent()
    const [nextQueryParams] = useNextQueryParamsAtom()

    const swiperRef = useRef<SwiperCore | null>(null)

    useLayoutEffect(() => {
        setCurrentMenuType("settings")
    }, [])

    useEffect(() => {
        if (
            currentMenuType === "settings" &&
            swiperRef.current &&
            menuIndex !== swiperRef.current.activeIndex
        ) {
            swiperRef.current.slideTo(menuIndex)
        }
    }, [currentMenuType, menuIndex, swiperRef.current])

    return (
        <>
            <SwiperContainer props={{ page: "settings" }}>
                <SwiperSlide>
                    <SettingsGeneralPage {...{ t, nextQueryParams, agent }} />
                </SwiperSlide>
                <SwiperSlide>
                    <SettingsContentFilteringPage
                        {...{ t, nextQueryParams, agent, userPreferences }}
                    />
                </SwiperSlide>
                <SwiperSlide>
                    <SettingsMutePage {...{ t, nextQueryParams, agent }} />
                </SwiperSlide>
            </SwiperContainer>
        </>
    )
}

export default Page
