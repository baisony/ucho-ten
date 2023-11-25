"use client"

import {
    Button,
    ButtonGroup,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Select,
    SelectItem,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    useDisclosure,
} from "@nextui-org/react"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { viewSettingsPage } from "@/app/settings/styles"
import { useUserPreferencesAtom } from "@/app/_atoms/preferences"
import { useAgent } from "@/app/_atoms/agent"
import { useAppearanceColor } from "@/app/_atoms/appearanceColor"
import { BskyAgent, BskyLabelPreference } from "@atproto/api/"
import { useTranslationLanguage } from "@/app/_atoms/translationLanguage"
import { useDisplayLanguage } from "@/app/_atoms/displayLanguage"
import { useTranslation } from "react-i18next"
import { useNextQueryParamsAtom } from "../_atoms/nextQueryParams"
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
import { isMobile } from "react-device-detect"
import { useContentFontSize } from "@/app/_atoms/contentFontSize"
import { DummyHeader } from "@/app/_components/DummyHeader"
import { type MuteWord, useWordMutes } from "@/app/_atoms/wordMute"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronRight } from "@fortawesome/free-solid-svg-icons"
import { useBookmarks } from "@/app/_atoms/bookmarks"

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
                cssMode={isMobile}
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
    const [contentFontSize, setContentFontSize] = useContentFontSize()

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
            <DummyHeader />
            <div className={"pt-[5px] pb-[7px] text-black dark:text-white"}>
                <div className={"font-[900]"}>
                    {t("pages.settings.appearance")}
                </div>
                <Table hideHeader>
                    <TableHeader>
                        <TableColumn>Appearance</TableColumn>
                        <TableColumn> </TableColumn>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>Theme</TableCell>
                            <TableCell>
                                <ButtonGroup>
                                    <Button
                                        isDisabled={
                                            appearanceColor === "system"
                                        }
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
                                            document.documentElement.classList.add(
                                                "dark"
                                            )
                                        }}
                                    >
                                        {t("pages.settings.dark")}
                                    </Button>
                                </ButtonGroup>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Display Language</TableCell>
                            <TableCell>
                                <Select
                                    size={"sm"}
                                    label="Languages"
                                    selectedKeys={displayLanguage}
                                    className={`${accordion()} max-w-xs ${appearanceTextColor()}`}
                                    onChange={(event) => {
                                        handleDisplayLanguageSelectionChange(
                                            event
                                        )
                                        //lngChangeはappContainerにて実装
                                    }}
                                >
                                    {Object.entries(
                                        DISPLAY_LANGUAGES || {}
                                    ).map(([key, value]) => {
                                        return (
                                            <SelectItem
                                                key={value}
                                                className={appearanceTextColor()}
                                            >
                                                {key}
                                            </SelectItem>
                                        )
                                    })}
                                </Select>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>FF外からの引用を表示しない</TableCell>
                            <TableCell>
                                <Switch />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Translate to</TableCell>
                            <TableCell>
                                <Select
                                    size={"sm"}
                                    label="Select a Language"
                                    className={`${accordion()} max-w-xs`}
                                    selectedKeys={translateTo}
                                    onChange={(event) => {
                                        handleTranslateToSelectionChange(event)
                                    }}
                                >
                                    {Object.entries(
                                        TO_TRANSLATE_LANGUAGES || {}
                                    ).map(([key, value]) => {
                                        return (
                                            <SelectItem
                                                key={value}
                                                className={`${appearanceTextColor()}`}
                                            >
                                                {key}
                                            </SelectItem>
                                        )
                                    })}
                                </Select>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Content font size</TableCell>
                            <TableCell>
                                <Select
                                    size={"sm"}
                                    label="font size"
                                    selectedKeys={String(contentFontSize)}
                                    className={`${accordion()} max-w-xs ${appearanceTextColor()}`}
                                    onChange={(event) => {
                                        //@ts-ignore
                                        setContentFontSize(
                                            Number(event.target.value)
                                        )
                                    }}
                                >
                                    <SelectItem
                                        key={"1"}
                                        className={`${appearanceTextColor()}`}
                                    >
                                        1
                                    </SelectItem>
                                    <SelectItem
                                        key={"2"}
                                        className={`${appearanceTextColor()}`}
                                    >
                                        2
                                    </SelectItem>
                                    <SelectItem
                                        key={"3"}
                                        className={`${appearanceTextColor()}`}
                                    >
                                        3
                                    </SelectItem>
                                    <SelectItem
                                        key={"4"}
                                        className={`${appearanceTextColor()}`}
                                    >
                                        4
                                    </SelectItem>
                                    <SelectItem
                                        key={"5"}
                                        className={`${appearanceTextColor()}`}
                                    >
                                        5
                                    </SelectItem>
                                </Select>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <div
                    className={
                        "flex justify-between items-center pt-[5px] pb-[5px] h-[40px]"
                    }
                >
                    <div>{t("pages.settings.theme")}</div>
                </div>
                <div
                    className={
                        "flex justify-between items-center pt-[5px] pb-[5px] h-[40px]"
                    }
                >
                    <div>{t("pages.settings.displayLanguage")}</div>
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
                                    <SelectItem
                                        key={value}
                                        className={`${appearanceTextColor()}`}
                                    >
                                        {key}
                                    </SelectItem>
                                )
                            }
                        )}
                    </Select>
                </div>
                <div
                    className={
                        "flex justify-between items-center pt-[5px] pb-[5px] h-[40px]"
                    }
                >
                    <div>font size</div>
                    <Select
                        size={"sm"}
                        label="font size"
                        selectedKeys={String(contentFontSize)}
                        className={`${accordion()} max-w-xs ${appearanceTextColor()}`}
                        onChange={(event) => {
                            //@ts-ignore
                            setContentFontSize(Number(event.target.value))
                        }}
                    >
                        <SelectItem
                            key={"1"}
                            className={`${appearanceTextColor()}`}
                        >
                            1
                        </SelectItem>
                        <SelectItem
                            key={"2"}
                            className={`${appearanceTextColor()}`}
                        >
                            2
                        </SelectItem>
                        <SelectItem
                            key={"3"}
                            className={`${appearanceTextColor()}`}
                        >
                            3
                        </SelectItem>
                        <SelectItem
                            key={"4"}
                            className={`${appearanceTextColor()}`}
                        >
                            4
                        </SelectItem>
                        <SelectItem
                            key={"5"}
                            className={`${appearanceTextColor()}`}
                        >
                            5
                        </SelectItem>
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

    return (
        <>
            <DummyHeader />
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
    const [agent] = useAgent()
    const [muteWords, setMuteWords] = useWordMutes()
    const [bookmarks] = useBookmarks()
    const [editMode, setEditMode] = useState<boolean>(false)
    const [inputMuteWord, setInputMuteWord] = useState<string>("")
    const [inputMuteCategory, setInputMuteCategory] = useState<string>("")
    const [inputTimePeriod, setInputTimePeriod] = useState<string>("")
    const [selectMuteWord, setSelectMuteWord] = useState<any>(null)
    const [switchIsActive, setSwitchIsActive] = useState<boolean>(false)
    const [modalEditMode, setModalEditMode] = useState<boolean>(false)
    const {
        isOpen: isOpenEdit,
        onOpen: onOpenEdit,
        onOpenChange: onOpenChangeEdit,
    } = useDisclosure()

    const syncMuteWords = async (mutelist: any[]) => {
        if (!agent) return
        const syncData = {
            bookmarks: bookmarks,
            muteWords: mutelist,
        }
        console.log(syncData)
        try {
            const syncData_string = JSON.stringify(syncData)
            const data = localStorage.getItem("session")
            if (!data) return
            const res = await fetch(`/api/setSettings/${data}`, {
                method: "POST",
                body: syncData_string,
            })
            console.log(await res)
            if ((await res.status) !== 200) {
                console.log("sync error")
            }
        } catch (e) {
            console.log(e)
        }
    }

    const handleAddMuteWordClick = useCallback(() => {
        if (!agent) return
        console.log("add")
        console.log(muteWords)
        const createdAt = new Date().getTime()
        const json: MuteWord = {
            category: null,
            word: inputMuteWord,
            selectPeriod: null,
            end: null,
            isActive: true,
            updatedAt: createdAt,
            createdAt: createdAt,
            deletedAt: null,
        }
        const myDID = agent?.session?.did as string
        const index = muteWords.find(
            (muteWord: any) => muteWord.word === inputMuteWord
        )
        if (index) return
        setMuteWords((prevMutewords) => [...prevMutewords, json])
        syncMuteWords([...muteWords, json])
    }, [agent, muteWords, setMuteWords, inputMuteWord, syncMuteWords])

    const handleSaveClick = useCallback(() => {
        if (!agent) return
        console.log("save")
        const updatedAt = new Date().getTime()
        const json: MuteWord = selectMuteWord
        const myDID = agent?.session?.did as string
        const index = muteWords.findIndex(
            (muteWord: any) => muteWord.word === inputMuteWord
        )
        if (muteWords[index] === json) return
        json.updatedAt = updatedAt

        const newMuteWords = [...muteWords]
        newMuteWords[index] = json

        setMuteWords((prevMuteWords) => {
            const newMuteWords = [...prevMuteWords] // 前の状態のコピーを作成
            newMuteWords[index] = json // 特定のインデックスの要素を編集
            return newMuteWords // 新しい状態を返す
        })
        syncMuteWords(newMuteWords)
    }, [
        selectMuteWord,
        agent,
        muteWords,
        setMuteWords,
        inputMuteWord,
        syncMuteWords,
    ])

    const handleDelete = useCallback(() => {
        if (!agent) return
        console.log("delete")
        const myDID = agent?.session?.did as string
        const index = muteWords.findIndex(
            (muteWord: any) => muteWord.word === selectMuteWord.word
        )
        const newMuteWords = muteWords
        const deleteMutewods = newMuteWords.splice(index, 1)
        setMuteWords(newMuteWords)
        syncMuteWords(newMuteWords)
    }, [agent, muteWords, selectMuteWord, setMuteWords, syncMuteWords])

    const getNowTime = () => {
        const now = new Date()
        console.log(now)
        return now.getTime()
    }

    const getEndTime = () => {
        const now = new Date()
        const year = now.getFullYear()
        const month = now.getMonth() + 1
        const date = now.getDate()
        return `${year}-${month}-${date}`
    }

    const mutePeriods = {
        day: "a day",
        week: "a week",
        month: "a month",
        year: "a year",
    }
    return (
        agent && (
            <>
                <Modal
                    isOpen={isOpenEdit}
                    onOpenChange={onOpenChangeEdit}
                    hideCloseButton
                    className={"text-black dark:text-white"}
                >
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader
                                    className={
                                        "flex justify-between lg:justify-center"
                                    }
                                >
                                    <Button
                                        className={"lg:hidden"}
                                        variant={"light"}
                                        onClick={() => {
                                            onClose()
                                        }}
                                    >
                                        cancel
                                    </Button>
                                    <div>Edit word</div>
                                    <Button
                                        className={"lg:hidden"}
                                        variant={"light"}
                                        onClick={() => {
                                            if (inputMuteWord.length === 0)
                                                return
                                            if (modalEditMode) {
                                                handleSaveClick()
                                            } else {
                                                handleAddMuteWordClick()
                                            }
                                            onClose()
                                        }}
                                        isDisabled={
                                            inputMuteWord.length === 0 ||
                                            inputMuteWord.length >= 21
                                        }
                                    >
                                        save
                                    </Button>
                                </ModalHeader>
                                <ModalBody>
                                    <div>
                                        <div>
                                            <div
                                                className={
                                                    "flex justify-between"
                                                }
                                            >
                                                <div>ワード</div>
                                                <div
                                                    className={`${
                                                        inputMuteWord.length >=
                                                            21 && `text-red-600`
                                                    }`}
                                                >
                                                    {modalEditMode
                                                        ? selectMuteWord.word
                                                              .length
                                                        : inputMuteWord.length}{" "}
                                                    / 20
                                                </div>
                                            </div>
                                            <Input
                                                onValueChange={(e) => {
                                                    console.log(e)
                                                    setInputMuteWord(e)
                                                }}
                                                isDisabled={modalEditMode}
                                                defaultValue={
                                                    modalEditMode
                                                        ? selectMuteWord.word
                                                        : inputMuteWord
                                                }
                                            ></Input>
                                        </div>
                                        <div className={"flex justify-between"}>
                                            <div>有効</div>
                                            <Switch
                                                defaultSelected={
                                                    modalEditMode
                                                        ? selectMuteWord.isActive
                                                        : true
                                                }
                                                onValueChange={
                                                    setSwitchIsActive
                                                }
                                            />
                                        </div>
                                        <div className={"mt-[10px]"}>
                                            <div>ミュート解除までの期間</div>
                                            <div
                                                className={
                                                    "flex justify-between items-center"
                                                }
                                            >
                                                <div>期間</div>
                                                <Select
                                                    size={"sm"}
                                                    label=""
                                                    className={`md:max-w-xs max-w-[200px] w-full`}
                                                    onChange={(e) =>
                                                        console.log(e)
                                                    }
                                                    defaultValue={
                                                        inputMuteCategory
                                                    }
                                                    labelPlacement={
                                                        "outside-left"
                                                    }
                                                    isDisabled={true}
                                                >
                                                    {Object.entries(
                                                        mutePeriods
                                                    ).map(([key, value]) => (
                                                        <SelectItem
                                                            key={key}
                                                            value={key}
                                                        >
                                                            {value}
                                                        </SelectItem>
                                                    ))}
                                                </Select>
                                            </div>
                                        </div>
                                        <div
                                            className={
                                                "flex justify-center items-center mt-[20px]"
                                            }
                                        >
                                            <div
                                                className={"cursor-pointer"}
                                                onClick={() => {
                                                    handleDelete()
                                                    onClose()
                                                }}
                                            >
                                                delete
                                            </div>
                                        </div>
                                    </div>
                                </ModalBody>
                                <ModalFooter className={"md:flex md:items-end"}>
                                    <Button
                                        onClick={() => {
                                            onClose()
                                        }}
                                        className={"hidden lg:block"}
                                    >
                                        cancel
                                    </Button>
                                    <Button
                                        color={"primary"}
                                        onClick={() => {
                                            if (inputMuteWord.length === 0)
                                                return
                                            if (modalEditMode) {
                                                handleSaveClick()
                                            } else {
                                                handleAddMuteWordClick()
                                            }
                                            onClose()
                                        }}
                                        className={"hidden lg:block"}
                                        isDisabled={
                                            inputMuteWord.length === 0 ||
                                            inputMuteWord.length >= 21
                                        }
                                    >
                                        save
                                    </Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>
                <div className="text-black dark:text-white">
                    <div className={"md:h-[100px] lg:h-[50px] h-[85px]"} />
                    <div className={"font-bold flex "}>
                        <div>{t("pages.mute.title")}</div>
                        <div className={"ml-[15px]"}>
                            {muteWords.length} / 30
                        </div>
                    </div>
                    <div className={"w-full h-fulll"}>
                        {muteWords.map((muteWord: any, index: number) => {
                            return (
                                <div
                                    key={index}
                                    className={
                                        "w-full h-[50px] border-b-[1px] border-t-[1px] border-[#E8E8E8] dark:text-[#D7D7D7] dark:border-[#292929] bg-white dark:bg-[#16191F] flex justify-between items-center px-[10px] cursor-pointer"
                                    }
                                    onClick={() => {
                                        setSelectMuteWord(muteWord)
                                        setModalEditMode(true)
                                        onOpenEdit()
                                    }}
                                >
                                    <div>{muteWord?.word}</div>
                                    <div className={"flex"}>
                                        <div>
                                            {muteWord.end === null
                                                ? "無期限"
                                                : muteWord.end < getNowTime()
                                                ? getEndTime()
                                                : "期限切れ"}
                                        </div>
                                        <div className={"w-[14px] ml-[10px]"}>
                                            <FontAwesomeIcon
                                                icon={faChevronRight}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div
                        className={
                            "absolute bottom-0 left-0 h-[50px] w-full bg-white dark:bg-black flex items-center justify-between"
                        }
                    >
                        {editMode ? (
                            <>
                                <div
                                    onClick={() => {
                                        setEditMode(false)
                                    }}
                                >
                                    cancel
                                </div>
                                <Button>delete</Button>
                            </>
                        ) : (
                            <>
                                <div
                                    onClick={() => {
                                        //setEditMode(true)
                                    }}
                                ></div>
                                <Button
                                    onClick={() => {
                                        setModalEditMode(false)
                                        onOpenEdit()
                                    }}
                                    isDisabled={muteWords.length >= 30}
                                >
                                    add
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </>
        )
    )
}

export default Page
