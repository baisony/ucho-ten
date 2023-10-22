"use client"
import {
    Accordion,
    AccordionItem,
    Button,
    ButtonGroup,
    Select,
    SelectItem,
    Switch,
} from "@nextui-org/react"
import { useEffect, useState } from "react"
import { viewSettingsPage } from "@/app/settings/styles"
import { useRouter } from "next/navigation"
import { useUserPreferencesAtom } from "@/app/_atoms/preferences"
import { useAgent } from "@/app/_atoms/agent"
import { useAppearanceColor } from "@/app/_atoms/appearanceColor"
import { BskyLabelPreference } from "@atproto/api/"
import { useTranslationLanguage } from "@/app/_atoms/translationLanguage"
import { useDisplayLanguage } from "@/app/_atoms/displayLanguage"
import { useNextQueryParamsAtom } from "../_atoms/nextQueryParams"
import { useTranslation } from "react-i18next"

export default function Root() {
    const router = useRouter()
    const DisplayLanguages = {
        English: "en-US",
        Japanese: "ja-JP",
    }
    const ToTranslateLanguages = {
        English: "en-US",
        Japanese: "ja-JP",
        Chinese: "zh-CN",
        Korean: "ko-KR",
        Russian: "ru-RU",
        Spanish: "es-ES",
        French: "fr-FR",
        German: "de-DE",
        Indonesian: "id-ID",
        Thai: "th-TH",
    }
    const [userPreferences, setUserPreferences] = useUserPreferencesAtom()
    const [agent] = useAgent()
    const [nextQueryParams] = useNextQueryParamsAtom()

    const { t, i18n } = useTranslation()
    const [hashFlagment, setHashFlagment] = useState<string | null>(null)
    const [appearanceColor, setAppearanceColor] = useAppearanceColor()
    const [translateTo, setTranslateTo] = useTranslationLanguage()
    const [displayLanguage, setDisplayLanguage] = useDisplayLanguage()
    const [darkMode, setDarkMode] = useState(false)
    const color = darkMode ? "dark" : "light"
    const [isLoading, setIsLoading] = useState(false)
    const { background, accordion, button } = viewSettingsPage()

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
        if (location.hash !== "") {
            setHashFlagment(location.hash?.replace("#", ""))
        } else {
            setHashFlagment("general")
        }
    }, [])

    const { contentLabels } = userPreferences || {}

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

    const handleDisplayLanguageSelectionChange = (e: any) => {
        setDisplayLanguage(e.target.value.split(","))
    }

    const handleTranslateToSelectionChange = (e: any) => {
        setTranslateTo(e.target.value.split(","))
    }

    return (
        hashFlagment && (
            <>
                <div
                    className={`w-full h-full ${background({ color: color })}`}
                >
                    <Accordion
                        variant="light"
                        defaultExpandedKeys={[
                            hashFlagment !== "" ? `${hashFlagment}` : "general",
                        ]}
                        className={accordion({ color: color })}
                    >
                        <AccordionItem
                            key="general"
                            aria-label="General"
                            title={
                                <span className={"font-[600]"}>
                                    {t("pages.settings.general")}
                                </span>
                            }
                            className={accordion({ color: color })}
                        >
                            <div className={"pt-[5px] pb-[7px]"}>
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
                                            isDisabled={
                                                appearanceColor === "system"
                                            }
                                            onClick={() => {
                                                setAppearanceColor("system")
                                            }}
                                        >
                                            {t("pages.settings.system")}
                                        </Button>
                                        <Button
                                            isDisabled={
                                                appearanceColor === "light"
                                            }
                                            onClick={() => {
                                                setAppearanceColor("light")
                                            }}
                                        >
                                            {t("pages.settings.light")}
                                        </Button>
                                        <Button
                                            isDisabled={
                                                appearanceColor === "dark"
                                            }
                                            onClick={() => {
                                                setAppearanceColor("dark")
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
                                    <div>
                                        {t("pages.settings.displayLanguage")}
                                    </div>
                                    <Select
                                        size={"sm"}
                                        label="Languages"
                                        selectedKeys={displayLanguage}
                                        className={`${accordion({
                                            color: color,
                                        })} max-w-xs`}
                                        onChange={(event) => {
                                            handleDisplayLanguageSelectionChange(
                                                event
                                            )
                                            //lngChangeはappContainerにて実装
                                        }}
                                    >
                                        {Object.entries(
                                            DisplayLanguages || {}
                                        ).map(([key, value]) => {
                                            return (
                                                <SelectItem key={value}>
                                                    {key}
                                                </SelectItem>
                                            )
                                        })}
                                    </Select>
                                </div>
                            </div>
                            <div className={"pt-[5px] pb-[7px]"}>
                                <div className={"font-[600]"}>Notification</div>
                                <div
                                    className={
                                        "flex justify-between items-center h-[40px]"
                                    }
                                >
                                    <div>
                                        FF外からの引用リポスト通知を受け取らない
                                    </div>
                                    <Switch></Switch>
                                </div>
                            </div>
                            <div className={"pt-[5px] pb-[7px]"}>
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
                                        className={`${accordion({
                                            color: color,
                                        })} max-w-xs`}
                                        selectedKeys={translateTo}
                                        onChange={(event) => {
                                            handleTranslateToSelectionChange(
                                                event
                                            )
                                        }}
                                    >
                                        {Object.entries(
                                            ToTranslateLanguages || {}
                                        ).map(([key, value]) => {
                                            return (
                                                <SelectItem
                                                    key={value}
                                                    className={color}
                                                >
                                                    {key}
                                                </SelectItem>
                                            )
                                        })}
                                    </Select>
                                </div>
                            </div>
                        </AccordionItem>
                        <AccordionItem
                            key="filtering"
                            aria-label="Accordion 1"
                            title={
                                <span className={"font-bold"}>
                                    {t("pages.contentfiltering.title")}
                                </span>
                            }
                            className={`${accordion({
                                color: color,
                            })} relative`}
                        >
                            {Object.entries(
                                userPreferences?.contentLabels || {}
                            ).map(([key, value]) => (
                                <div
                                    key={key}
                                    className={
                                        "flex justify-between items-center pt-[5px] pb-[5px]"
                                    }
                                >
                                    <div>
                                        {key === "nsfw"
                                            ? t("pages.contentfiltering.nsfw")
                                            : key === "nudity"
                                            ? t(
                                                  "pages.contentfiltering.otherNudity"
                                              )
                                            : key === "spam"
                                            ? t("pages.contentfiltering.spam")
                                            : key === "gore"
                                            ? t(
                                                  "pages.contentfiltering.violence"
                                              )
                                            : key === "hate"
                                            ? t("pages.contentfiltering.hate")
                                            : key === "impersonation"
                                            ? t(
                                                  "pages.contentfiltering.impersonation"
                                              )
                                            : key === "suggestive"
                                            ? t(
                                                  "pages.contentfiltering.sexuallySuggestive"
                                              )
                                            : key}
                                    </div>
                                    <div className={""}>
                                        <ButtonGroup>
                                            <Button
                                                size="sm"
                                                isDisabled={
                                                    contentLabels &&
                                                    contentLabels[key] ===
                                                        "hide"
                                                }
                                                onClick={async () => {
                                                    await handleButtonClick(
                                                        key,
                                                        "hide"
                                                    )
                                                }}
                                            >
                                                {t("button.hide")}
                                            </Button>
                                            <Button
                                                size="sm"
                                                isDisabled={
                                                    contentLabels &&
                                                    contentLabels[key] ===
                                                        "warn"
                                                }
                                                onClick={async () => {
                                                    await handleButtonClick(
                                                        key,
                                                        "warn"
                                                    )
                                                }}
                                            >
                                                {t("button.warn")}
                                            </Button>
                                            <Button
                                                size="sm"
                                                isDisabled={
                                                    contentLabels &&
                                                    contentLabels[key] ===
                                                        "ignore"
                                                }
                                                onClick={async () => {
                                                    await handleButtonClick(
                                                        key,
                                                        "ignore"
                                                    )
                                                }}
                                            >
                                                {t("button.show")}
                                            </Button>
                                        </ButtonGroup>
                                    </div>
                                </div>
                            ))}
                        </AccordionItem>
                        <AccordionItem
                            key="mute"
                            aria-label={"Mute"}
                            title={
                                <span className={"font-bold"}>
                                    {t("pages.mute.title")}
                                </span>
                            }
                            className={accordion({ color: color })}
                        >
                            <div
                                className={
                                    "flex justify-between items-center h-[60px] w-full select-none cursor-pointer"
                                }
                                onClick={() => {
                                    router.push(
                                        `/settings/mute/words?${nextQueryParams.toString()}`
                                    )
                                }}
                            >
                                {t("pages.mute.muteWord")}
                            </div>
                            <div
                                className={
                                    "flex justify-between items-center h-[60px] w-full select-none cursor-pointer"
                                }
                                onClick={() => {
                                    router.push(
                                        `/settings/mute/accounts?${nextQueryParams.toString()}`
                                    )
                                }}
                            >
                                {t("pages.mute.muteUser")}
                            </div>
                        </AccordionItem>
                    </Accordion>
                </div>
            </>
        )
    )
}

const mute = {
    word: {
        Categories: [
            {
                word: "hoge",
                end: null,
                target: ["timeline", "notification"],
                targetAccount: "all",
            },
            {
                word: "fuga",
                end: "unixtime",
                target: ["timeline", "notification"],
                targetAccount: "notFollowee",
            },
            {
                word: "piyo",
                end: "unixtime",
                target: ["notification"],
                targetAccount: "all",
            },
        ],
        Timed: [
            {
                word: "hoge",
                end: "unixtime",
                target: ["notification"],
                targetAccount: "all",
            },
            {
                word: "fuga",
                end: "unixtime",
                target: ["notification"],
                targetAccount: "all",
            },
            {
                word: "piyo",
                end: "unixtime",
                target: ["notification"],
                targetAccount: "all",
            },
        ],
        Presistent: [
            {
                word: "hoge",
                end: null,
                target: ["timeline", "notification"],
                targetAccount: "all",
            },
        ],
    },
    account: {
        //以下同文
    },
}
