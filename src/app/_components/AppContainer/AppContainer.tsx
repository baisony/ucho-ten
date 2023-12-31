"use client"

import dynamic from "next/dynamic"
import "@/app/_i18n/config" //i18
import React, {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react"
import { layout } from "@/app/styles"
import { isMobile } from "react-device-detect"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useAgent } from "@/app/_atoms/agent"
import { useUserProfileDetailedAtom } from "@/app/_atoms/userProfileDetail"
import { AppBskyFeedDefs, BskyAgent } from "@atproto/api"
import { useFeedGeneratorsAtom } from "@/app/_atoms/feedGenerators"
import { useUserPreferencesAtom } from "@/app/_atoms/preferences"
import { useImageGalleryAtom } from "@/app/_atoms/imageGallery"
import { Captions, Counter, Zoom } from "yet-another-react-lightbox/plugins"
import Lightbox, {
    CaptionsRef,
    Slide,
    ZoomRef,
} from "yet-another-react-lightbox"

import { push as BurgerPush } from "react-burger-menu"

import "yet-another-react-lightbox/styles.css"
import "yet-another-react-lightbox/plugins/captions.css"
import "yet-another-react-lightbox/plugins/counter.css"
import { HeaderMenu, useHeaderMenusByHeaderAtom } from "@/app/_atoms/headerMenu"
import { MuteWord, useWordMutes } from "@/app/_atoms/wordMute"
import { useTranslation } from "react-i18next"
import { useDisplayLanguage } from "@/app/_atoms/displayLanguage"
import { useNextQueryParamsAtom } from "@/app/_atoms/nextQueryParams"
import { isTabQueryParamValue, TabQueryParamValue } from "@/app/_types/types"
import { useBookmarks } from "@/app/_atoms/bookmarks"
import { useAppearanceColor } from "@/app/_atoms/appearanceColor"
import { useUnreadNotificationAtom } from "@/app/_atoms/unreadNotifications"
import { useStatusCodeAtPage } from "@/app/_atoms/statusCode"
import { useTranslationLanguage } from "@/app/_atoms/translationLanguage"
import { useQueryClient } from "@tanstack/react-query"
import { TabBar } from "@/app/_components/TabBar"
import { ViewHeader } from "@/app/_components/ViewHeader"
import ViewSideBar from "@/app/_components/ViewSideBar/ViewSideBar"
import "./lightbox.css"

const ViewSideMenu = dynamic(
    () =>
        import("@/app/_components/ViewSideMenu").then(
            (mod) => mod.ViewSideMenu
        ),
    {}
)

//const ViewSideBar = dynamic(() => import("../ViewSideBar/ViewSideBar"), {})

export function AppConatiner({ children }: { children: React.ReactNode }) {
    const [statusCode] = useStatusCodeAtPage()
    const router = useRouter()
    const pathName = usePathname()
    const searchParams = useSearchParams()
    const { i18n } = useTranslation()
    const searchPath = ["/search"]
    const isSearchScreen = searchPath.includes(pathName)
    const isLoginPath = ["/login", "/"].includes(pathName)
    const [displayLanguage] = useDisplayLanguage()
    const [agent, setAgent] = useAgent()
    const [headerMenusByHeader, setHeaderMenusByHeader] =
        useHeaderMenusByHeaderAtom()
    const [appearanceColor] = useAppearanceColor()
    const [muteWords, setMuteWords] = useWordMutes()
    const [, setBookmarks] = useBookmarks()
    const [nextQueryParams, setNextQueryParams] = useNextQueryParamsAtom()
    const [imageGallery, setImageGallery] = useImageGalleryAtom()
    const [userProfileDetailed, setUserProfileDetailed] =
        useUserProfileDetailedAtom()
    const [userPreferences, setUserPreferences] = useUserPreferencesAtom()
    const [, setFeedGenerators] = useFeedGeneratorsAtom()
    const [, setUnreadNotification] = useUnreadNotificationAtom()

    const [translateTo] = useTranslationLanguage()

    const target = searchParams.get("target")
    const [searchText, setSearchText] = useState<string>("")
    const [imageSlides, setImageSlides] = useState<Slide[] | null>(null)
    const [imageSlideIndex, setImageSlideIndex] = useState<number | null>(null)
    const specificPaths = ["/post", "/", "/login"]
    const isMatchingPath = specificPaths.includes(pathName)
    const [showTabBar, setShowTabBar] = useState<boolean>(!isMatchingPath)
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false)

    const zoomRef = useRef<ZoomRef>(null)
    const captionsRef = useRef<CaptionsRef>(null)

    const { background } = layout()

    useEffect(() => {
        router.prefetch("/")
        router.prefetch("/home")
        router.prefetch("/login")
        router.prefetch("/search")
        router.prefetch("/u-tab")
        router.prefetch("/inbox")
        router.prefetch("/post")
        router.prefetch("/settings")
        router.prefetch("/bookmarks")
        router.prefetch("/feeds")
        router.prefetch("/profile/[identifier]/post/[postid]")
    }, [])

    const headerAndSlash = (url: string) => {
        return url.replace(/https?:\/\//, "").replace(/\/$/, "")
    }

    const refreshSession = async () => {
        if (!agent) return
        if (!agent?.session) return
        console.log(agent?.session)

        try {
            const url = new URL(agent?.service)
            const req = {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${agent?.session.refreshJwt}`,
                },
            }
            const res = await fetch(
                `${url}xrpc/com.atproto.server.refreshSession`,
                req
            )
            const json = await res.json()

            const prevSession = agent
            if (!prevSession?.session) return
            prevSession.session.accessJwt = json.accessJwt
            prevSession.session.refreshJwt = json.refreshJwt
            const sessionJson = {
                server: headerAndSlash(agent?.service.toString()),
                session: agent.session,
            }
            setAgent(prevSession)
            localStorage.setItem("session", JSON.stringify(sessionJson))
        } catch (e) {}
    }
    useEffect(() => {
        if (!agent) return
        const count = setInterval(
            () => {
                refreshSession()
            },
            1000 * 60 * 5
        )

        return () => clearInterval(count)
    }, [agent])

    useEffect(() => {
        const queryParams = new URLSearchParams(searchParams)

        let tabValue: TabQueryParamValue = "h"

        if (!queryParams.get("f")) {
            const pathComponents = pathName.split("/")

            if (pathComponents.length > 1) {
                switch (pathComponents[1]) {
                    case "":
                        tabValue = "h"
                        break
                    case "search":
                        tabValue = "s"
                        break
                    case "inbox":
                        tabValue = "i"
                        break
                    case "post":
                        tabValue = "p"
                        break
                }
            }
        } else {
            const f = queryParams.get("f")

            if (isTabQueryParamValue(f)) {
                tabValue = f
            } else {
                tabValue = "h"
            }
        }

        queryParams.set("f", tabValue)

        setNextQueryParams(queryParams)
    }, [pathName, searchParams])

    useEffect(() => {
        if (isMobile) {
            return
        }

        const handleKeyDown = (event: any) => {
            // FIXME: do not use 'any' as type
            if (event.key === "Escape" && pathName === "/post") {
                event.preventDefault()
                router.back()
                return
            }

            if (
                event.target.tagName.toLowerCase() === "textarea" ||
                event.target.tagName.toLowerCase() === "input"
            ) {
                return
            }

            if (
                !event.ctrlKey &&
                !event.metaKey &&
                (event.key === "n" || event.key === "N") &&
                pathName !== "/post"
            ) {
                event.preventDefault()
                router.push(`/post?${nextQueryParams.toString()}`)

                return
            }
        }

        window.addEventListener("keydown", handleKeyDown)

        return () => {
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [router, pathName])

    useEffect(() => {
        if (agent?.hasSession === true) {
            return
        }

        const restoreSession = async () => {
            const sessionJson = localStorage.getItem("session")

            if (!sessionJson) {
                if (pathName === "/login" || pathName === "/") return
                if (router) {
                    router.push(
                        `/${
                            pathName
                                ? `?toRedirect=${pathName.replace("/", "")}${
                                      searchParams ? `&${searchParams}` : ``
                                  }`
                                : ``
                        }`
                    )
                } else {
                    location.href = "/"
                }
                return
            }

            const session = JSON.parse(sessionJson).session
            const agent = new BskyAgent({
                service: `https://${JSON.parse(sessionJson).server}`,
            })

            try {
                await agent.resumeSession(session)

                setAgent(agent)
            } catch (error) {
                console.error(error)
                if (pathName === "/login" || pathName === "/") return
                if (router) {
                    router.push(
                        `/${
                            pathName
                                ? `?toRedirect=${pathName.replace("/", "")}${
                                      searchParams ? `&${searchParams}` : ``
                                  }`
                                : ``
                        }`
                    )
                } else {
                    location.href = "/"
                }
            }

            if (agent.hasSession) {
                const promises: Promise<any>[] = []

                if (!userProfileDetailed) {
                    const userProfilePromise = agent
                        .getProfile({ actor: agent.session?.did || "" })
                        .then((res) => {
                            const { data } = res
                            setUserProfileDetailed(data)
                        })
                    promises.push(userProfilePromise)
                }

                if (!userPreferences) {
                    const userPreferencesPromise = agent
                        .getPreferences()
                        .then((res) => {
                            if (res) {
                                if (!res?.adultContentEnabled) {
                                    res.contentLabels.nsfw = "hide"
                                    res.contentLabels.nudity = "hide"
                                    res.contentLabels.suggestive = "hide"
                                }

                                setUserPreferences(res)

                                return agent.app.bsky.feed.getFeedGenerators({
                                    feeds: res.feeds.pinned as string[],
                                })
                            } else {
                                console.log("Responseがundefinedです。")
                                return null
                            }
                        })
                        .then((data) => {
                            if (data) {
                                const { data: feedData } = data
                                console.log(feedData)
                                setFeedGenerators(feedData.feeds)
                                updateMenuWithFeedGenerators(feedData.feeds)
                            }
                        })
                        .catch((e) => {
                            //console.log(e)
                        })

                    promises.push(userPreferencesPromise)
                }

                // 並列で実行する
                Promise.all(promises).then(() => {})
            }
        }

        void restoreSession()
    }, [agent && agent.hasSession, pathName])

    useEffect(() => {
        if (searchText === "" || !searchText) return
        const queryParams = new URLSearchParams(nextQueryParams)
        queryParams.set("word", searchText)
        queryParams.set("target", target || "posts")

        router.push(`/search?${queryParams.toString()}`)
    }, [searchText])

    useEffect(() => {
        setShowTabBar(!specificPaths.includes(pathName))
    }, [pathName])

    useEffect(() => {
        if (imageGallery && imageGallery.images.length > 0) {
            const slides: Slide[] = []

            for (const image of imageGallery.images) {
                slides.push({
                    src: image.fullsize,
                    description: image.alt,
                })
            }

            setImageSlideIndex(imageGallery.index)
            setImageSlides(slides)
        }
    }, [imageGallery])

    const shouldFillPageBackground = useMemo((): boolean => {
        if (pathName.startsWith("/login") || pathName === "/") {
            return false
        } else if (
            pathName.startsWith("/search") &&
            !searchParams.get("word")
        ) {
            return false
        } else return !pathName.startsWith("/post")
    }, [pathName, searchParams])

    useEffect(() => {
        if (!translateTo) return
        if (translateTo[0] !== "") return
        //setTranslateTo([])
    }, [translateTo])

    useEffect(() => {
        if (!agent) return
        if (muteWords.length === 0) return
        //ミュートワードはあるけど新システムに移行してない場合

        for (const word of muteWords) {
            if (typeof word === "string") {
                const createdAt = new Date().getTime()
                const json = {
                    category: null,
                    word: word,
                    selectPeriod: null,
                    end: null,
                    isActive: true,
                    updatedAt: createdAt,
                    createdAt: createdAt,
                    deletedAt: null,
                }
                const isDuplicate = muteWords.find(
                    (muteWord: MuteWord) => muteWord.word === word
                )

                if (!isDuplicate) {
                    console.log("add")

                    setMuteWords((prevMuteWords) => [...prevMuteWords, json])
                } else {
                    console.log("この単語は既に存在します") // TODO: i18n
                }
            }
        }
    }, [JSON.stringify(muteWords), agent])

    const updateMenuWithFeedGenerators = (
        feeds: AppBskyFeedDefs.GeneratorView[]
    ) => {
        if (feeds.length === 0) {
            return
        }
        const newHeaderMenusByHeader = headerMenusByHeader
        const menus: HeaderMenu[] = feeds.map((feed) => {
            return {
                displayText: feed.displayName,
                info: feed.uri,
            }
        })

        menus.unshift({
            displayText: "Following",
            info: "following",
        })

        newHeaderMenusByHeader.home = menus

        setHeaderMenusByHeader((prevHeaderMenus) => ({
            ...prevHeaderMenus,
            home: menus,
        }))
    }

    const handleSideBarOpen = (isOpen: boolean) => {
        setDrawerOpen(isOpen)
    }

    const burgerMenuStyles = {
        bmBurgerButton: {
            position: "fixed",
            width: "0",
            height: "0",
            left: "0",
            top: "0",
        },
        bmBurgerBars: {},
        bmBurgerBarsHover: {},
        bmCrossButton: {
            height: "0",
            width: "0",
        },
        bmCross: {},
        bmMenuWrap: {},
        bmMenu: {},
        bmMorphShape: {},
        bmItemList: {},
        bmOverlay: { background: "transparent", zIndex: "49" }, // Modal's z-index is 50
    }

    useLayoutEffect(() => {
        const lngChange = (lng: any) => {
            const lang = lng.replace(/-\w+$/, "")
            void i18n.changeLanguage(lang)
        }
        lngChange(displayLanguage[0])
    }, [displayLanguage])

    useEffect(() => {
        const mediaQueryLlistener = (e: any) => {
            const appearanceColor = localStorage.getItem("appearanceColor")

            if (appearanceColor) {
                const parsedAppearanceColor = JSON.parse(appearanceColor)
                if (parsedAppearanceColor === "system") {
                    if (e.matches) {
                        document.documentElement.classList.add("dark")
                        const element = document.querySelector(
                            "meta[name=theme-color]"
                        )!
                        element.setAttribute("content", "#000000")
                    } else {
                        document.documentElement.classList.remove("dark")
                        const element = document.querySelector(
                            "meta[name=theme-color]"
                        )!
                        element.setAttribute("content", "#FFFFFF")
                    }
                }
            }
        }

        const mql = window.matchMedia("(prefers-color-scheme: dark)")
        mql.addEventListener("change", mediaQueryLlistener)

        // Clean up the event listener on component unmount
        return () => {
            mql.removeEventListener("change", mediaQueryLlistener)
        }
    }, [])

    const getSettings = async () => {
        try {
            const data = localStorage.getItem("session")
            if (!data) return
            const res = await fetch(`/api/getSettings/${data}`, {
                method: "GET",
            })
            //res.json()
            if (res.status == 200) {
                const data = await res.json()
                if (data.hasOwnProperty("bookmarks")) {
                    const bookmarks = data.bookmarks
                    setBookmarks(bookmarks)
                } else {
                    setBookmarks([])
                }
                if (data.hasOwnProperty("muteWords")) {
                    const muteWords = data.muteWords
                    setMuteWords(muteWords)
                } else {
                    setMuteWords([])
                }
            } else if (res.status == 404) {
                setBookmarks([])
                setMuteWords([])
            }
        } catch (e) {
            console.log(e)
        }
    }
    const queryClient = useQueryClient()
    const autoRefetch = async () => {
        await queryClient.refetchQueries({
            queryKey: ["getNotification", "Inbox"],
        })
    }
    const checkNewNotification = useCallback(async () => {
        if (!agent) {
            return
        }
        try {
            const { data } = await agent.countUnreadNotifications()
            const notifications = await agent.listNotifications()
            const { count } = data
            const reason = ["mention", "reply"]
            let notify_num = 0
            for (let i = 0; i < count; i++) {
                const notificationReason =
                    notifications.data.notifications[i].reason
                if (reason.some((item) => notificationReason.includes(item))) {
                    notify_num++
                }
            }
            if (notify_num === 0) return
            setUnreadNotification(notify_num)
            autoRefetch()
        } catch (e) {
            console.log(e)
        }
    }, [agent, setUnreadNotification])

    useEffect(() => {
        void checkNewNotification()
        const interval = setInterval(() => {
            void checkNewNotification()
        }, 10000)
        // クリーンアップ関数
        return () => {
            clearInterval(interval) // インターバルをクリーンアップ
        }
    }, [agent])

    useEffect(() => {
        if (!userProfileDetailed) return
        if (!userProfileDetailed.did) return
        void getSettings()
    }, [userProfileDetailed])

    useEffect(() => {
        console.log(appearanceColor)
        if (pathName === "/login" || pathName === "/") return
        // DarkモードとLightモードの判定
        const isDarkMode = document.documentElement.classList.contains("dark")

        // theme-colorの設定
        const themeColor = isDarkMode ? "#000000" : "#FFFFFF"
        const element = document.querySelector("meta[name=theme-color]")!
        element.setAttribute("content", themeColor)
    }, [appearanceColor, agent, pathName])

    return (
        <div
            className={`bg-cover bg-[url(/images/backgroundImage/light/image.webp)] dark:bg-[url(/images/backgroundImage/dark/image.webp)]`}
            style={{
                overscrollBehaviorY: "none",
                WebkitOverflowScrolling: "touch",
                overscrollBehavior: "none",
                overflow: "hidden",
                height: "100%",
                width: "100%",
                //背景をスクロールさせない
                position: "fixed",
            }}
        >
            <div id="burger-outer-container" className={"h-full w-full"}>
                <BurgerPush
                    className={"backdrop-blur-[5px]"}
                    outerContainerId="burger-outer-container"
                    pageWrapId="main-container"
                    styles={burgerMenuStyles}
                    isOpen={drawerOpen}
                    onClose={() => {
                        setDrawerOpen(false)
                    }}
                >
                    <ViewSideBar
                        isSideBarOpen={drawerOpen}
                        openSideBar={handleSideBarOpen}
                        isMobile={isMobile}
                    />
                </BurgerPush>
                <main
                    id="main-container"
                    className={background()}
                    onClick={() => {
                        handleSideBarOpen(false)
                    }}
                >
                    <div
                        className={
                            "w-full h-full flex justify-center select-none"
                        }
                    >
                        <div
                            className={
                                "lg:w-[calc(100%/4)] h-full hidden lg:block"
                            }
                        >
                            {showTabBar && <ViewSideMenu />}
                        </div>
                        <div
                            className={
                                "min-w-[350px] max-w-[600px] h-full w-full "
                            }
                        >
                            <div
                                className={
                                    "h-full max-w-[600px] min-w-[350px] w-full overflow-x-hidden relative"
                                }
                            >
                                {(pathName === "/login" || showTabBar) && (
                                    <ViewHeader
                                        isMobile={isMobile}
                                        setSideBarOpen={handleSideBarOpen}
                                        setSearchText={setSearchText}
                                    />
                                )}
                                <div
                                    className={`pt-[0px] ${
                                        isLoginPath
                                            ? `h-full`
                                            : `h-[calc(100dvh-50px-env(safe-area-inset-bottom))]`
                                    } lg:h-full relative`}
                                >
                                    {shouldFillPageBackground &&
                                        statusCode !== 404 && (
                                            <div className="absolute top-[env(safe-area-inset-top)] left-0 flex justify-center w-full h-full lg:hidden">
                                                <div
                                                    className={`bg-white dark:bg-[#16191F] w-full max-w-[600px] ${
                                                        isSearchScreen
                                                            ? `lg:mt-[100px]`
                                                            : `lg:mt-[50px]`
                                                    } md:mt-[100px] mt-[85px] lg:h-[calc(100%-50px)] md:h-[calc(100%-100px)] h-[calc(100%-85px)]`}
                                                />
                                            </div>
                                        )}
                                    {children}
                                </div>
                                {showTabBar && !isLoginPath && <TabBar />}
                            </div>
                            {imageSlides && imageSlideIndex !== null && (
                                <div
                                    onClick={(e) => {
                                        const clickedElement =
                                            e.target as HTMLDivElement

                                        console.log(e.target)
                                        if (
                                            clickedElement.classList.contains(
                                                "yarl__fullsize"
                                            ) ||
                                            clickedElement.classList.contains(
                                                "yarl__flex_center"
                                            )
                                        ) {
                                            setImageGallery(null)
                                            setImageSlides(null)
                                            setImageSlideIndex(null)
                                        }
                                    }}
                                >
                                    <Lightbox
                                        open={true}
                                        index={imageSlideIndex}
                                        plugins={[Zoom, Captions, Counter]}
                                        zoom={{
                                            ref: zoomRef,
                                            scrollToZoom: true,
                                        }}
                                        captions={{
                                            ref: captionsRef,
                                            showToggle: true,
                                            descriptionMaxLines: 2,
                                            descriptionTextAlign: "start",
                                        }}
                                        close={() => {
                                            setImageGallery(null)
                                            setImageSlides(null)
                                            setImageSlideIndex(null)
                                        }}
                                        slides={imageSlides}
                                        carousel={{
                                            finite: imageSlides.length <= 5,
                                        }}
                                        render={{
                                            buttonPrev:
                                                imageSlides.length <= 1
                                                    ? () => null
                                                    : undefined,
                                            buttonNext:
                                                imageSlides.length <= 1
                                                    ? () => null
                                                    : undefined,
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                        <div
                            className={
                                "lg:w-[calc(100%/4)] h-full hidden lg:flex"
                            }
                        ></div>
                    </div>
                </main>
            </div>
        </div>
    )
}
