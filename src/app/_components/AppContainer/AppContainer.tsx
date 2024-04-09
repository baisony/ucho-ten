"use client"

import dynamic from "next/dynamic"
import "@/app/_i18n/config" //i18
import React, {
    Suspense,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react"
import { layout } from "@/app/styles"
import { isMobile } from "react-device-detect"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useAgent } from "@/app/_atoms/agent"
import { useUserProfileDetailedAtom } from "@/app/_atoms/userProfileDetail"
import { useFeedGeneratorsAtom } from "@/app/_atoms/feedGenerators"
import { useUserPreferencesAtom } from "@/app/_atoms/preferences"

import { push as BurgerPush } from "react-burger-menu"

import { HeaderMenu, useHeaderMenusByHeaderAtom } from "@/app/_atoms/headerMenu"
import { useWordMutes } from "@/app/_atoms/wordMute"
import { useTranslation } from "react-i18next"
import { useDisplayLanguage } from "@/app/_atoms/displayLanguage"
import { useNextQueryParamsAtom } from "@/app/_atoms/nextQueryParams"
import { useBookmarks } from "@/app/_atoms/bookmarks"
import { useAppearanceColor } from "@/app/_atoms/appearanceColor"
import { useUnreadNotificationAtom } from "@/app/_atoms/unreadNotifications"
import { useStatusCodeAtPage } from "@/app/_atoms/statusCode"
import { useQueryClient } from "@tanstack/react-query"
import { TabBar } from "@/app/_components/TabBar"
import { ViewHeader } from "@/app/_components/ViewHeader"
import ViewSideBar from "@/app/_components/ViewSideBar/ViewSideBar"
import { ViewFillPageBackground } from "@/app/_components/ViewFillPageBackground"
import { useAccounts } from "@/app/_atoms/accounts"
import useCheckNewNotification from "@/app/_components/AppContainer/lib/useCheckNewNotification"
import useGetSettings from "@/app/_components/AppContainer/lib/useGetSettings"
import useRefreshSession from "@/app/_components/AppContainer/lib/useRefreshSession"
import { useShouldFillPageBackground } from "@/app/_components/AppContainer/lib/useShouldFillPageBackground"
import { useKeyboardShortcuts } from "@/app/_components/AppContainer/lib/useKeyboardShortcuts"
import { useRestoreSession } from "@/app/_components/AppContainer/lib/useRestoreSession"
import { useServiceWorkerRegistration } from "@/app/_components/AppContainer/lib/useServiceWorkerRegistration"
import { useSystemAppearanceColor } from "@/app/_components/AppContainer/lib/useSystemAppearanceColor"
import { useUpdateTabQueryParam } from "@/app/_components/AppContainer/lib/useUpdateTabQueryParam"
import { useThemeColorSetting } from "@/app/_components/AppContainer/lib/useThemeColorSetting"
import { usePrefetchRoutes } from "@/app/_components/AppContainer/lib/usePrefetchRoutes"
import { GeneratorView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
//import { ViewLightbox } from "@/app/_components/ViewLightbox"
const ViewLightbox = dynamic(
    () =>
        import("@/app/_components/ViewLightbox").then(
            (mod) => mod.ViewLightbox
        ),
    {}
)

const ViewSideMenu = dynamic(
    () =>
        import("@/app/_components/ViewSideMenu").then(
            (mod) => mod.ViewSideMenu
        ),
    {}
)

export function AppContainer({ children }: { children: React.ReactNode }) {
    const [statusCode] = useStatusCodeAtPage()
    const router = useRouter()
    const pathName = usePathname()
    const [accounts, setAccounts] = useAccounts()
    const searchParams = useSearchParams()
    const { i18n } = useTranslation()
    const isLoginPath = ["/login", "/"].includes(pathName)
    const [displayLanguage] = useDisplayLanguage()
    const [agent, setAgent] = useAgent()
    const [headerMenusByHeader, setHeaderMenusByHeader] =
        useHeaderMenusByHeaderAtom()
    const [appearanceColor] = useAppearanceColor()
    const [, setMuteWords] = useWordMutes()
    const [, setBookmarks] = useBookmarks()
    const [nextQueryParams, setNextQueryParams] = useNextQueryParamsAtom()
    const [userProfileDetailed, setUserProfileDetailed] =
        useUserProfileDetailedAtom()
    const [userPreferences, setUserPreferences] = useUserPreferencesAtom()
    const [, setFeedGenerators] = useFeedGeneratorsAtom()
    const [, setUnreadNotification] = useUnreadNotificationAtom()

    const target = searchParams.get("target")
    const searchText = useRef<string | undefined>()
    const specificPaths = ["/post", "/", "/login"]
    const isMatchingPath = specificPaths.includes(pathName)
    const [showTabBar, setShowTabBar] = useState<boolean>(!isMatchingPath)
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false)
    console.log("AppContainer.tsx")

    const { background } = layout()

    usePrefetchRoutes(router)

    useEffect(() => {
        if (!agent) return
        const count = setInterval(
            () => {
                void useRefreshSession(agent, setAgent, accounts, setAccounts)
            },
            1000 * 60 * 5
        )

        return () => clearInterval(count)
    }, [agent])

    useUpdateTabQueryParam(pathName, searchParams, setNextQueryParams)

    useKeyboardShortcuts(router, pathName, nextQueryParams, isMobile)

    const updateMenuWithFeedGenerators = (feeds: GeneratorView[]) => {
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

        const hoge = localStorage.getItem("zenMode")
        console.log(hoge)
        if (!hoge || hoge === "false") {
            console.log(hoge)
            menus.unshift({
                displayText: "Following",
                info: "following",
            })
        }

        newHeaderMenusByHeader.home = menus

        setHeaderMenusByHeader((prevHeaderMenus) => ({
            ...prevHeaderMenus,
            home: menus,
        }))
    }

    useRestoreSession(
        agent,
        setAgent,
        router,
        pathName,
        searchParams,
        userProfileDetailed,
        setUserProfileDetailed,
        userPreferences,
        setUserPreferences,
        setFeedGenerators,
        updateMenuWithFeedGenerators
    )

    useEffect(() => {
        if (searchText.current === "" || !searchText.current) return
        const queryParams = new URLSearchParams(nextQueryParams)
        queryParams.set("word", searchText?.current)
        queryParams.set("target", target || "posts")

        router.push(`/search?${queryParams.toString()}`)
    }, [searchText])

    useEffect(() => {
        setShowTabBar(!specificPaths.includes(pathName))
    }, [pathName])

    const shouldFillPageBackground = useShouldFillPageBackground(
        pathName,
        searchParams
    )

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
        const lngChange = (lng: string) => {
            const lang = lng.replace(/-\w+$/, "")
            void i18n.changeLanguage(lang)
        }
        lngChange(displayLanguage[0])
    }, [displayLanguage])

    useSystemAppearanceColor()

    const getSettings = useGetSettings(setBookmarks, setMuteWords)

    const queryClient = useQueryClient()
    const autoRefetch = async () => {
        await queryClient.refetchQueries({
            queryKey: ["getNotification", "Inbox"],
        })
    }
    const checkNewNotification = useCheckNewNotification(
        agent,
        setUnreadNotification,
        autoRefetch
    )

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

    useThemeColorSetting(appearanceColor, pathName)

    useServiceWorkerRegistration()

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
                    outerContainerId={"burger-outer-container"}
                    pageWrapId={"main-container"}
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
                                    "h-full max-w-[600px] min-w-[350px] w-full overflow-x-hidden relative overscroll-contain"
                                }
                            >
                                {(pathName === "/login" || showTabBar) && (
                                    <ViewHeader
                                        isMobile={isMobile}
                                        setSideBarOpen={handleSideBarOpen}
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
                                            <ViewFillPageBackground />
                                        )}
                                    <Suspense>{children}</Suspense>
                                </div>
                                {showTabBar && !isLoginPath && <TabBar />}
                            </div>
                            <ViewLightbox />
                        </div>
                        <div
                            className={
                                "lg:w-[calc(100%/4)] h-full hidden lg:flex"
                            }
                        />
                    </div>
                </main>
            </div>
        </div>
    )
}
