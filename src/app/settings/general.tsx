import { useDisplayLanguage } from "@/app/_atoms/displayLanguage"
import { useTranslationLanguage } from "@/app/_atoms/translationLanguage"
import { useAppearanceColor } from "@/app/_atoms/appearanceColor"
import { useContentFontSize } from "@/app/_atoms/contentFontSize"
import { useHideRepost } from "@/app/_atoms/hideRepost"
import { viewSettingsPage } from "@/app/settings/styles"
import { DummyHeader } from "@/app/_components/DummyHeader"
import {
    Button,
    ButtonGroup,
    Select,
    SelectItem,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from "@nextui-org/react"
import {
    DISPLAY_LANGUAGES,
    TO_TRANSLATE_LANGUAGES,
} from "@/app/_constants/lanuages"
import { ViewPostCard } from "@/app/_components/ViewPostCard"
import { processPostBodyText } from "@/app/_lib/post/processPostBodyText"
import { BskyAgent } from "@atproto/api"
import { useEffect, useState } from "react"
import OneSignal from "react-onesignal"
import { useOneSignalLogin } from "@/app/_atoms/onesignalLoggined"
import { useAgent } from "@/app/_atoms/agent"
import { useZenMode } from "@/app/_atoms/zenMode"
import { useHeaderMenusByHeaderAtom } from "@/app/_atoms/headerMenu"

interface SettingsGeneralPageProps {
    t: any
    nextQueryParams: URLSearchParams
    agent: BskyAgent | null
}

export const SettingsGeneralPage = ({
    t,
    nextQueryParams,
}: SettingsGeneralPageProps) => {
    const [agent] = useAgent()
    const [displayLanguage, setDisplayLanguage] = useDisplayLanguage()
    const [translateTo, setTranslateTo] = useTranslationLanguage()
    const [appearanceColor, setAppearanceColor] = useAppearanceColor()
    const [contentFontSize, setContentFontSize] = useContentFontSize()
    const [hideRepost, setHideRepost] = useHideRepost()
    const [subscribed, setSubscribed] = useState<boolean | undefined>()
    const [OneSignalLogin] = useOneSignalLogin()
    const [zenMode, setZenMode] = useZenMode()
    const [menus, setMenus] = useHeaderMenusByHeaderAtom()

    const { /*background, */ accordion, appearanceTextColor } =
        viewSettingsPage()

    const handleDisplayLanguageSelectionChange = (e: any) => {
        setDisplayLanguage(e.target.value.split(","))
    }

    const handleTranslateToSelectionChange = (e: any) => {
        setTranslateTo(e.target.value.split(","))
    }

    const testJson = {
        uri: "at://did:plc:zdpzt7tc2zzfffzrtfgy2imz/app.bsky.feed.post/3kha275xdht2t",
        cid: "bafyreian4dkpve2fklm3bdycyxzxzjwu6wmsufzq6xqq2wked6pek4vtcq",
        author: {
            did: "did:plc:zdpzt7tc2zzfffzrtfgy2imz",
            handle: "tutorial.ucho-ten.net",
            viewer: { muted: false, blockedBy: false },
            labels: [],
        },
        record: {
            text: "あのイーハトーヴォのすきとおった風、夏でも底に冷たさをもつ青いそら、うつくしい森で飾られたモリーオ市、郊外のぎらぎらひかる草の波。",
            $type: "app.bsky.feed.post",
            langs: ["ja"],
            createdAt: "2023-12-23T16:44:01.300Z",
        },
        replyCount: 1,
        repostCount: 28,
        likeCount: 50,
        indexedAt: "2023-12-23T16:44:01.300Z",
        viewer: {},
        labels: [],
    }

    const confirmSubscribe = async () => {
        const session = await localStorage.getItem("session")
        const res = await fetch(`/api/getNotifySubscribed/${session}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
        const json = await res.json()
        console.log(json.res)
        return json.res.length !== 0
    }

    const pushNotifySubscribed = async () => {
        const session = await localStorage.getItem("session")
        const res = await fetch(`/api/setNotifySubscribed/1`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: session,
        })
        if (res.status === 200) alert("通知の購読に成功しました。")
    }

    useEffect(() => {
        if (
            typeof window === "undefined" ||
            OneSignal.User.PushSubscription.optedIn === undefined
        )
            return
        setSubscribed(OneSignal.User.PushSubscription.optedIn)
    }, [OneSignalLogin, OneSignal.User.PushSubscription.optedIn])

    return (
        <div className={"w-full h-full"}>
            <DummyHeader />
            <div
                className={
                    "w-full pt-[5px] pb-[7px] text-black dark:text-white"
                }
            >
                <div
                    className={
                        "font-[600] sm:text-black lg:text-white dark:text-white"
                    }
                >
                    {t("pages.settings.timeline")}
                </div>
                <Table hideHeader className={"w-full"}>
                    <TableHeader>
                        <TableColumn> </TableColumn>
                        <TableColumn> </TableColumn>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>{t("pages.settings.zenMode")}</TableCell>
                            <TableCell
                                className={"flex justify-end items-center"}
                            >
                                <Switch
                                    isSelected={zenMode}
                                    onValueChange={(e) => {
                                        console.log(e)
                                        setZenMode(e)
                                        if (e) {
                                            // If e is true, remove the first element from menus
                                            const updatedMenus =
                                                menus.home.slice(1)

                                            setMenus((prevHeaderMenus) => ({
                                                ...prevHeaderMenus,
                                                home: updatedMenus,
                                            }))
                                        } else {
                                            // If e is false, add a new element to the beginning of menus
                                            const newMenu = {
                                                displayText: "Following",
                                                info: "following",
                                            }

                                            setMenus((prevHeaderMenus) => ({
                                                ...prevHeaderMenus,
                                                home: [
                                                    newMenu,
                                                    ...prevHeaderMenus.home,
                                                ],
                                            }))
                                        }
                                    }}
                                />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                {t("pages.settings.hideRepost")}
                            </TableCell>
                            <TableCell
                                className={"flex justify-end items-center"}
                            >
                                <Switch
                                    isSelected={hideRepost}
                                    onValueChange={setHideRepost}
                                />
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>

                <div
                    className={
                        "font-[600] sm:text-black lg:text-white dark:text-white"
                    }
                >
                    {t("pages.settings.pushNotification")}
                </div>
                <Table className={"w-full"}>
                    <TableHeader>
                        <TableColumn>
                            <div>{t("text.betaFeature")}</div>
                        </TableColumn>
                        <TableColumn> </TableColumn>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                <div>
                                    {t("pages.settings.onlyMentionNotify")}
                                </div>
                            </TableCell>
                            <TableCell
                                className={"flex justify-end items-center"}
                            >
                                <div className={"h-[40px] overflow-hidden"}>
                                    {OneSignal?.Notifications?.isPushSupported() &&
                                    agent?.service.host === "bsky.social" ? (
                                        <Button
                                            onClick={async () => {
                                                if (
                                                    OneSignal?.Notifications
                                                        ?.permissionNative ===
                                                    "denied"
                                                )
                                                    return
                                                if (subscribed) {
                                                    await OneSignal.User.PushSubscription.optOut()
                                                    setSubscribed(false)
                                                } else {
                                                    const res =
                                                        await confirmSubscribe()
                                                    if (!res) {
                                                        await pushNotifySubscribed()
                                                    }
                                                    await OneSignal.User.PushSubscription.optIn()
                                                    setSubscribed(true)
                                                }
                                            }}
                                            isDisabled={
                                                OneSignal?.Notifications
                                                    ?.permissionNative ===
                                                "denied"
                                            }
                                        >
                                            {OneSignal?.Notifications
                                                ?.permissionNative !== "denied"
                                                ? !subscribed
                                                    ? t("button.enable")
                                                    : t("button.disable")
                                                : t("button.permissionDenied")}
                                        </Button>
                                    ) : (
                                        <Button isDisabled>
                                            {t("button.unsupported")}
                                        </Button>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <div
                    className={
                        "font-[600] sm:text-black lg:text-white dark:text-white"
                    }
                >
                    {t("pages.settings.appearance")}
                </div>
                <Table hideHeader className={"w-full"}>
                    <TableHeader>
                        <TableColumn>
                            {t("pages.settings.appearance")}
                        </TableColumn>
                        <TableColumn> </TableColumn>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>{t("pages.settings.theme")}</TableCell>
                            <TableCell
                                className={"flex justify-end items-center"}
                            >
                                <ButtonGroup>
                                    <Button
                                        isDisabled={
                                            appearanceColor === "system"
                                        }
                                        onClick={() => {
                                            setAppearanceColor("system")
                                            if (
                                                window?.matchMedia(
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
                            <TableCell>
                                {t("pages.settings.displayLanguage")}
                            </TableCell>
                            <TableCell
                                className={"flex justify-end items-center"}
                            >
                                <Select
                                    size={"sm"}
                                    label={t("pages.settings.selectLanguage")}
                                    selectedKeys={displayLanguage}
                                    className={`${accordion()} max-w-xs ${appearanceTextColor()}`}
                                    onChange={(event) => {
                                        if (event.target.value === "") return
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
                            <TableCell>
                                {t("pages.settings.translateTo")}
                            </TableCell>
                            <TableCell
                                className={"flex justify-end items-center"}
                            >
                                <Select
                                    size={"sm"}
                                    label={t("pages.settings.selectLanguage")}
                                    className={`${accordion()} max-w-xs`}
                                    selectedKeys={translateTo}
                                    onChange={(event) => {
                                        if (event.target.value === "") return
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
                            <TableCell>
                                {t("pages.settings.contentFontSize")}
                            </TableCell>
                            <TableCell
                                className={"flex justify-end items-center"}
                            >
                                <Select
                                    size={"sm"}
                                    label={t("pages.settings.size")}
                                    selectedKeys={String(contentFontSize)}
                                    className={`${accordion()} max-w-xs ${appearanceTextColor()}`}
                                    onChange={(event) => {
                                        if (event.target.value === "") return
                                        setContentFontSize(
                                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                            //@ts-ignore
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
                                    <SelectItem
                                        key={"6"}
                                        className={`${appearanceTextColor()}`}
                                    >
                                        6
                                    </SelectItem>
                                    <SelectItem
                                        key={"7"}
                                        className={`${appearanceTextColor()}`}
                                    >
                                        7
                                    </SelectItem>
                                    <SelectItem
                                        key={"8"}
                                        className={`${appearanceTextColor()}`}
                                    >
                                        8
                                    </SelectItem>
                                    <SelectItem
                                        key={"9"}
                                        className={`${appearanceTextColor()}`}
                                    >
                                        9
                                    </SelectItem>
                                    <SelectItem
                                        key={"10"}
                                        className={`${appearanceTextColor()}`}
                                    >
                                        10
                                    </SelectItem>
                                </Select>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <div className={"lg:w-full h-full mt-[20px]"}>
                    <div
                        className={
                            "sm:text-black sm:dark:text-white lg:text-black lg:dark:text-white font-[600]"
                        }
                    >
                        {t("pages.settings.fontSizePreview")}
                    </div>
                    <div
                        onClick={(e) => {
                            if (e.button === 0) return
                        }}
                        style={{ pointerEvents: "none" }}
                    >
                        <ViewPostCard
                            t={t}
                            bodyText={processPostBodyText(
                                nextQueryParams,
                                testJson
                            )}
                            postJson={testJson}
                            nextQueryParams={nextQueryParams}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SettingsGeneralPage
