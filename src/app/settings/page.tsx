"use client"

import {
    Button,
    ButtonGroup,
    Select,
    SelectItem,
    Switch,
} from "@nextui-org/react"
import React, { useEffect, useRef, useState } from "react"
import { viewSettingsPage } from "@/app/settings/styles"
import { useUserPreferencesAtom } from "@/app/_atoms/preferences"
import { useAgent } from "@/app/_atoms/agent"
import { useAppearanceColor } from "@/app/_atoms/appearanceColor"
import { BskyAgent, BskyLabelPreference } from "@atproto/api/"
import { useTranslationLanguage } from "@/app/_atoms/translationLanguage"
import { useDisplayLanguage } from "@/app/_atoms/displayLanguage"
import { useTranslation } from "react-i18next"
import { useNextQueryParamsAtom } from "../_atoms/nextQueryParams"
import Link from "next/link"
import {
    menuIndexAtom,
    useCurrentMenuType,
    useMenuIndexChangedByMenu,
} from "../_atoms/headerMenu"
import {
    DISPLAY_LANGUAGES,
    TO_TRANSLATE_LANGUAGES,
} from "../_constants/lanuages"
import { useAtom } from "jotai"
import { Swiper, SwiperSlide } from "swiper/react"
import SwiperCore from "swiper/core"
import { Pagination } from "swiper/modules"

import "swiper/css"
import "swiper/css/pagination"

const Page = () => {
    const [userPreferences] = useUserPreferencesAtom()
    const [currentMenuType, setCurrentMenuType] = useCurrentMenuType()
    setCurrentMenuType("settings")

    const { t } = useTranslation()

    const [menuIndex, setMenuIndex] = useAtom(menuIndexAtom)
    const [menuIndexChangedByMenu, setMenuIndexChangedByMenu] =
        useMenuIndexChangedByMenu()

    const [agent] = useAgent()
    const [nextQueryParams] = useNextQueryParamsAtom()

    const swiperRef = useRef<SwiperCore | null>(null)

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
            <Swiper
                onSwiper={(swiper) => {
                    swiperRef.current = swiper
                }}
                cssMode={false}
                pagination={{ type: "custom", clickable: false }}
                modules={[Pagination]}
                className="swiper-settings"
                style={{ height: "100%" }}
                touchAngle={30}
                touchRatio={0.8}
                touchReleaseOnEdges={true}
                touchMoveStopPropagation={true}
                preventInteractionOnTransition={true}
                onActiveIndexChange={(swiper) => {
                    if (menuIndexChangedByMenu === false) {
                        setMenuIndex(swiper.activeIndex)
                    }
                }}
                onTouchStart={(swiper, event) => {
                    setMenuIndexChangedByMenu(false)
                }}
            >
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
            </Swiper>
        </>
    )
}

interface SettingsGeneralPageProps {
    t: any
    nextQueryParams: URLSearchParams
    agent: BskyAgent | null
}

const SettingsGeneralPage = ({
    t,
    // nextQueryParams,
    agent,
}: SettingsGeneralPageProps) => {
    const [displayLanguage, setDisplayLanguage] = useDisplayLanguage()
    const [translateTo, setTranslateTo] = useTranslationLanguage()
    const [appearanceColor, setAppearanceColor] = useAppearanceColor()

    const { /*background, */ accordion, appearanceTextColor } =
        viewSettingsPage()

    const handleDisplayLanguageSelectionChange = (e: any) => {
        setDisplayLanguage(e.target.value.split(","))
    }

    const handleTranslateToSelectionChange = (e: any) => {
        setTranslateTo(e.target.value.split(","))
    }

    return (
        <>
            <div className={`md:h-[100px] h-[85px]`} />
            <div className={"font-[600] text-black dark:text-white"}>
                {t("pages.settings.general")}
            </div>
            <div className={"pt-[5px] pb-[7px] text-black dark:text-white"}>
                <div className={"font-[900]"}>
                    {t("pages.settings.appearance")}
                </div>
                <div
                    className={
                        "flex justify-between items-center pt-[5px] pb-[5px] h-[40px]"
                    }
                >
                    <div>{t("pages.settings.theme")}</div>
                    <ButtonGroup>
                        <Button
                            isDisabled={appearanceColor === "system"}
                            onClick={() => {
                                setAppearanceColor("system")
                                if (
                                    window.matchMedia(
                                        "(prefers-color-scheme: dark)"
                                    ).matches
                                ) {
                                    document.documentElement.classList.add(
                                        "dark"
                                    )
                                } else {
                                    document.documentElement.classList.remove(
                                        "dark"
                                    )
                                }
                            }}
                        >
                            {t("pages.settings.system")}
                        </Button>
                        <Button
                            isDisabled={appearanceColor === "light"}
                            onClick={() => {
                                setAppearanceColor("light")
                                document.documentElement.classList.remove(
                                    "dark"
                                )
                            }}
                        >
                            {t("pages.settings.light")}
                        </Button>
                        <Button
                            isDisabled={appearanceColor === "dark"}
                            onClick={() => {
                                setAppearanceColor("dark")
                                document.documentElement.classList.add("dark")
                            }}
                        >
                            {t("pages.settings.dark")}
                        </Button>
                    </ButtonGroup>
                </div>
                <div
                    className={
                        "flex justify-between items-center pt-[5px] pb-[5px] h-[40px]"
                    }
                >
                    <div>{t("pages.settings.displayLanguage")}</div>
                    <Select
                        size={"sm"}
                        label="Languages"
                        selectedKeys={displayLanguage}
                        className={`${accordion()} max-w-xs ${appearanceTextColor()}`}
                        onChange={(event) => {
                            handleDisplayLanguageSelectionChange(event)
                            //lngChangeはappContainerにて実装
                        }}
                    >
                        {Object.entries(DISPLAY_LANGUAGES || {}).map(
                            ([key, value]) => {
                                return (
                                    <SelectItem
                                        key={value}
                                        className={appearanceTextColor()}
                                    >
                                        {key}
                                    </SelectItem>
                                )
                            }
                        )}
                    </Select>
                </div>
            </div>
            <div className={"pt-[5px] pb-[7px] text-black dark:text-white"}>
                <div className={"font-[600]"}>Notification</div>
                <div className={"flex justify-between items-center h-[40px]"}>
                    <div>FF外からの引用リポスト通知を受け取らない</div>
                    {/* TODO: i18n */}
                    <Switch></Switch>
                </div>
            </div>
            <div className={"pt-[5px] pb-[7px] text-black dark:text-white"}>
                <div className={"font-[600]"}>
                    {t("pages.settings.translate")}
                </div>
                <div
                    className={
                        "flex justify-between items-center pt-[5px] pb-[5px] h-[40px]"
                    }
                >
                    <div>{t("pages.settings.translateTo")}</div>
                    <Select
                        size={"sm"}
                        label="Select a Language"
                        className={`${accordion()} max-w-xs`}
                        selectedKeys={translateTo}
                        onChange={(event) => {
                            handleTranslateToSelectionChange(event)
                        }}
                    >
                        {Object.entries(TO_TRANSLATE_LANGUAGES || {}).map(
                            ([key, value]) => {
                                return (
                                    <SelectItem key={value}>{key}</SelectItem>
                                )
                            }
                        )}
                    </Select>
                </div>
            </div>
        </>
    )
}

interface SettingsContentFilteringPageProps {
    t: any
    nextQueryParams: URLSearchParams
    agent: BskyAgent | null
    userPreferences: any
}

const SettingsContentFilteringPage = ({
    t,
    nextQueryParams,
    agent,
    userPreferences,
}: SettingsContentFilteringPageProps) => {
    const [, setUserPreferences] = useUserPreferencesAtom()
    const { contentLabels } = userPreferences || {}

    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isAdultContentEnabled, setIsAdultContentEnabled] = useState(false)

    const handleButtonClick = async (key: any, value: BskyLabelPreference) => {
        if (isLoading) return
        setIsLoading(true)
        // ここでボタンの状態を更新
        const newContentLabels = { ...contentLabels }
        newContentLabels[key] = value
        //@ts-ignore
        setUserPreferences((prevUserPreferences) => ({
            ...prevUserPreferences,
            contentLabels: newContentLabels,
        }))

        // そして、APIなどで設定を保存する等の操作を実行
        await agent?.setContentLabelPref(key, value)
        setIsLoading(false)
    }

    const handleAdultContentEnabledChange = async (e: any) => {
        if (isLoading) return
        setIsLoading(true)
        const newAdultContentEnabled = e.target.checked
        //@ts-ignore
        setUserPreferences((prevUserPreferences) => ({
            ...prevUserPreferences,
            adultContentEnabled: newAdultContentEnabled,
        }))
        await agent?.setAdultContentEnabled(newAdultContentEnabled)
        setIsLoading(false)
    }

    useEffect(() => {
        setIsAdultContentEnabled(!!userPreferences?.adultContentEnabled)
    })

    console.log(userPreferences)

    return (
        <>
            <div className={"md:h-[100px] h-[85px]"} />
            <div className={"font-bold text-black dark:text-white"}>
                {t("pages.contentfiltering.title")}
            </div>
            <div
                className={
                    "w-full flex justify-between text-black dark:text-white"
                }
            >
                <div>birthday</div>
                <div></div>
            </div>
            {userPreferences?.birthDate && (
                <div
                    className={
                        "w-full flex justify-between text-black dark:text-white"
                    }
                >
                    <div>Enable Adult Content</div>
                    <div>
                        <Switch
                            onChange={async (e) => {
                                handleAdultContentEnabledChange(e)
                            }}
                            defaultSelected={
                                userPreferences?.adultContentEnabled
                            }
                        />
                    </div>
                </div>
            )}
            {Object.entries(userPreferences?.contentLabels || {}).map(
                ([key, value]) => (
                    <div
                        key={key}
                        className={
                            "flex justify-between items-center pt-[5px] pb-[5px] text-black dark:text-white"
                        }
                    >
                        <div>
                            {key === "nsfw"
                                ? t("pages.contentfiltering.nsfw")
                                : key === "nudity"
                                ? t("pages.contentfiltering.otherNudity")
                                : key === "spam"
                                ? t("pages.contentfiltering.spam")
                                : key === "gore"
                                ? t("pages.contentfiltering.violence")
                                : key === "hate"
                                ? t("pages.contentfiltering.hate")
                                : key === "impersonation"
                                ? t("pages.contentfiltering.impersonation")
                                : key === "suggestive"
                                ? t("pages.contentfiltering.sexuallySuggestive")
                                : key}
                        </div>
                        {console.log(key)}
                        <div className={""}>
                            <ButtonGroup
                                isDisabled={
                                    !isAdultContentEnabled &&
                                    (key === "nsfw" ||
                                        key === "nudity" ||
                                        key === "suggestive")
                                }
                            >
                                <Button
                                    size="sm"
                                    isDisabled={
                                        contentLabels &&
                                        contentLabels[key] === "hide"
                                    }
                                    onClick={async () => {
                                        await handleButtonClick(key, "hide")
                                    }}
                                >
                                    {t("button.hide")}
                                </Button>
                                <Button
                                    size="sm"
                                    isDisabled={
                                        contentLabels &&
                                        contentLabels[key] === "warn"
                                    }
                                    onClick={async () => {
                                        await handleButtonClick(key, "warn")
                                    }}
                                >
                                    {t("button.warn")}
                                </Button>
                                <Button
                                    size="sm"
                                    isDisabled={
                                        contentLabels &&
                                        contentLabels[key] === "ignore"
                                    }
                                    onClick={async () => {
                                        await handleButtonClick(key, "ignore")
                                    }}
                                >
                                    {t("button.show")}
                                </Button>
                            </ButtonGroup>
                        </div>
                    </div>
                )
            )}
        </>
    )
}

interface SettingsMutePageProps {
    t: any
    nextQueryParams: URLSearchParams
    agent: BskyAgent | null
}

const SettingsMutePage = ({
    t,
    nextQueryParams, // agent,
}: SettingsMutePageProps) => {
    return (
        <div className="w-full m-4 text-black dark:text-white">
            <div className={"md:h-[100px] h-[85px]"} />
            <div className={"font-bold"}>{t("pages.mute.title")}</div>
            <Link
                className={
                    "flex justify-between items-center h-[60px] w-full select-none cursor-pointer"
                }
                href={`/settings/mute/words?${nextQueryParams.toString()}`}
            >
                {t("pages.mute.muteWord")}
            </Link>
            <Link
                className={
                    "flex justify-between items-center h-[60px] w-full select-none cursor-pointer"
                }
                href={`/settings/mute/accounts?${nextQueryParams.toString()}`}
            >
                {t("pages.mute.muteUser")}
            </Link>
        </div>
    )
}

export default Page
