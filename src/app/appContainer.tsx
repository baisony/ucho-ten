"use client"
import "./_i18n/config" //i18
import { ViewHeader } from "@/app/_components/ViewHeader"
import React, {
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react"
import { layout } from "@/app/styles"
import { TabBar } from "@/app/_components/TabBar"
import { isMobile } from "react-device-detect"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
// import {useRequiredSession} from "@/app/_lib/hooks/useRequiredSession";
import { ViewSideBar } from "@/app/_components/ViewSideBar"
//import { useSpring, animated, interpolate } from '@react-spring/web'
//import { useDrag } from '@use-gesture/react';
import "./sidebar.css"
import { useAgent } from "./_atoms/agent"
import { useUserProfileDetailedAtom } from "./_atoms/userProfileDetail"
import { AppBskyFeedDefs, BskyAgent } from "@atproto/api"
import { useFeedGeneratorsAtom } from "./_atoms/feedGenerators"
import { useUserPreferencesAtom } from "./_atoms/preferences"
import { useImageGalleryAtom } from "./_atoms/imageGallery"
import { useAppearanceColor } from "@/app/_atoms/appearanceColor"
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
import {
    HeaderMenu,
    setMenuIndexAtom,
    useCurrentMenuType,
    useHeaderMenusByHeaderAtom,
} from "./_atoms/headerMenu"
import { useWordMutes } from "@/app/_atoms/wordMute"
// import { HistoryContext } from "@/app/_lib/hooks/historyContext"
import { useTranslation } from "react-i18next"
import { useDisplayLanguage } from "@/app/_atoms/displayLanguage"
import { useNextQueryParamsAtom } from "./_atoms/nextQueryParams"
import { useAtom } from "jotai"
import { isTabQueryParamValue, TabQueryParamValue } from "./_types/types"

export function AppConatiner({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathName = usePathname()
    const searchParams = useSearchParams()
    const { i18n } = useTranslation()

    const [displayLanguage] = useDisplayLanguage()
    const [agent, setAgent] = useAgent()
    const [appearanceColor] = useAppearanceColor()
    const [headerMenusByHeader, setHeaderMenusByHeader] =
        useHeaderMenusByHeaderAtom()
    const [muteWords, setMuteWords] = useWordMutes()
    const [nextQueryParams, setNextQueryParams] = useNextQueryParamsAtom()
    const [imageGallery, setImageGallery] = useImageGalleryAtom()
    const [userProfileDetailed, setUserProfileDetailed] =
        useUserProfileDetailedAtom()
    const [userPreferences, setUserPreferences] = useUserPreferencesAtom()
    const [feedGenerators, setFeedGenerators] = useFeedGeneratorsAtom()

    const target = searchParams.get("target")
    // const [value, setValue] = useState(false)
    // const [isSideBarOpen, setIsSideBarOpen] = useState(false)
    // const tab: string =
    //     pathName === "/"
    //         ? "home"
    //         : pathName === "/search" ||
    //           pathName === "/inbox" ||
    //           pathName === "/post"
    //         ? pathName.replace("/", "")
    //         : "home"
    //const [, setMenus] = useHeaderMenusAtom()
    //const [menuIndex] = useAtom(menuIndexAtom)
    const [, setMenuIndex] = useAtom(setMenuIndexAtom)
    const [, setCurrentMenuType] = useCurrentMenuType()
    //const [selectedTab, setSelectedTab] = useState<string>(tab)
    const [searchText, setSearchText] = useState<string>("")
    const [imageSlides, setImageSlides] = useState<Slide[] | null>(null)
    const [imageSlideIndex, setImageSlideIndex] = useState<number | null>(null)
    const specificPaths = ["/post", "/login"]
    const isMatchingPath = specificPaths.includes(pathName)
    const [showTabBar, setShowTabBar] = useState<boolean>(!isMatchingPath)
    // const [page, setPage] = useState<
    //     "profile" | "home" | "inbox" | "post" | "search"
    // >("home")
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false)
    // const [history, setHistory] = useState([pathName, ""])

    const zoomRef = useRef<ZoomRef>(null)
    const captionsRef = useRef<CaptionsRef>(null)

    const { background } = layout()

    useEffect(() => {
        router.prefetch("/")
        router.prefetch("/search")
        router.prefetch("/inbox")
        router.prefetch("/post")
        router.prefetch("/settings")
        router.prefetch("/bookmarks")
    }, [])

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

    // useEffect(() => {
    //     setHistory([pathName, history[0]])
    // }, [pathName])

    useEffect(() => {
        if (agent?.hasSession === true) {
            return
        }

        const restoreSession = async () => {
            const sessionJson = localStorage.getItem("session")

            if (!sessionJson) {
                if (pathName === "/login") return
                if (router) {
                    router.push(
                        `/login${
                            pathName
                                ? `?toRedirect=${pathName.replace("/", "")}${
                                      searchParams ? `&${searchParams}` : ``
                                  }`
                                : ``
                        }`
                    )
                } else {
                    location.href = "/login"
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
                if (pathName === "/login") return
                if (router) {
                    router.push(
                        `/login${
                            pathName
                                ? `?toRedirect=${pathName.replace("/", "")}${
                                      searchParams ? `&${searchParams}` : ``
                                  }`
                                : ``
                        }`
                    )
                } else {
                    location.href = "/login"
                }
            }

            if (!userProfileDetailed && agent.hasSession === true) {
                const res = await agent.getProfile({
                    actor: agent.session?.did || "",
                })
                const { data } = res

                setUserProfileDetailed(data)
            }

            if (!userPreferences && agent.hasSession === true) {
                try {
                    console.log("fetch preferences")
                    const res = await agent.getPreferences()

                    if (res) {
                        console.log(res)

                        setUserPreferences(res)

                        const { data } =
                            await agent.app.bsky.feed.getFeedGenerators({
                                feeds: res.feeds.pinned as string[],
                            })

                        console.log(data)

                        setFeedGenerators(data.feeds)
                        updateMenuWithFeedGenerators(data.feeds)
                    } else {
                        // もしresがundefinedだった場合の処理
                        console.log("Responseがundefinedです。")
                    }
                } catch (e) {
                    console.log(e)
                }
            }
        }

        restoreSession()
    }, [agent && agent.hasSession, pathName])

    useEffect(() => {
        console.log(searchText)
        if (searchText === "" || !searchText) return
        const queryParams = new URLSearchParams(nextQueryParams)
        queryParams.set("word", searchText)
        queryParams.set("target", target || "posts")

        router.push(`/search?${queryParams.toString()}`)
    }, [searchText])

    useEffect(() => {
        // if (pathName.startsWith("/search")) {
        //     setPage("search")
        //     setSelectedTab("search")
        // } else if (pathName.startsWith("/profile")) {
        //     setPage("profile")
        //     setSelectedTab("home")
        // } else if (pathName.startsWith("/post")) {
        //     setPage("post")
        //     setSelectedTab("post")
        // } else if (pathName.startsWith("/inbox")) {
        //     setPage("inbox") // TODO: ??
        //     setSelectedTab("inbox")
        // } else {
        //     setPage("home")
        //     setSelectedTab("home")
        // }

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
        if (pathName.startsWith("/login")) {
            return false
        } else if (
            pathName.startsWith("/search") &&
            !searchParams.get("word")
        ) {
            return false
        } else if (pathName.startsWith("/post")) {
            return false
        } else {
            return true
        }
    }, [pathName, searchParams])

    useEffect(() => {
        if (muteWords.length === 0) return

        let newMuteWords = [...muteWords]

        for (const word of muteWords) {
            if (typeof word === "string") {
                const createdAt = new Date().getTime()
                const json = {
                    category: null,
                    word: word,
                    selectPeriod: null,
                    end: null,
                    isActive: true,
                    targets: ["timeline"],
                    muteAccountIncludesFollowing: true,
                    updatedAt: createdAt,
                    createdAt: createdAt,
                    deletedAt: null,
                }

                const isDuplicate = muteWords.find(
                    (muteWord) => muteWord.word === word
                )

                if (!isDuplicate) {
                    console.log("add")
                    newMuteWords.push(json)
                } else {
                    console.log("この単語は既に存在します") // TODO: i18n
                }
            }
        }

        newMuteWords = newMuteWords.filter(
            (muteWord) => typeof muteWord !== "string"
        )
        setMuteWords(newMuteWords)
    }, [JSON.stringify(muteWords)])

    /*const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }))
    const bind = useDrag(({ down, offset: [ox, oy] }) => api.start({ x: ox, y: oy, immediate: down }), {
        bounds: { left: 0, right: 300, top: 0, bottom: 0 }
    })*/

    // const onChangeMenuIndex = (index: number) => {
    //     setMenuIndex(index)
    // }

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

    // useEffect(() => {
    //     if (pathName === "/") {
    //         setCurrentMenuType("home")
    //     } else if (pathName === "/search") {
    //         setCurrentMenuType("search")

    //         switch (searchParams.get("target")) {
    //             case "posts":
    //                 setMenuIndex(0)
    //                 break
    //             case "users":
    //                 setMenuIndex(1)
    //                 break
    //             case "feeds":
    //                 setMenuIndex(2)
    //                 break
    //             default:
    //                 setMenuIndex(0)
    //                 break
    //         }
    //     } else if (pathName === "/inbox") {
    //         // setMenus(HEADER_MENUS.inbox)
    //         setCurrentMenuType("inbox")
    //         setMenuIndex(0)
    //     } else if (
    //         pathName.match(/^\/profile\/did:(\w+):(\w+)\/post\/(\w+)$/)
    //     ) {
    //         //setMenus(HEADER_MENUS.onlyPost)
    //         setCurrentMenuType("onlyPost")
    //         setMenuIndex(0)
    //     }
    // }, [pathName, searchParams])

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
        bmBurgerBars: {
            // background: '#373a47'
        },
        bmBurgerBarsHover: {
            // background: '#a90000'
        },
        bmCrossButton: {
            height: "0",
            width: "0",
        },
        bmCross: {
            // background: '#bdc3c7'
        },
        bmMenuWrap: {
            // overflowX: "hidden",
            // position: "fixed",
            // height: "100%",
        },
        bmMenu: {
            // background: '#373a47',
            // padding: '2.5em 1.5em 0',
            // fontSize: '1.15em'
        },
        bmMorphShape: {
            // fill: '#373a47'
        },
        bmItemList: {
            // color: '#b8b7ad',
            // padding: '0.8em'
        },
        bmItem: {},
        bmOverlay: { background: "transparent" },
    }
    useLayoutEffect(() => {
        const lngChange = (lng: any) => {
            const lang = lng.replace(/-\w+$/, "")
            console.log(lang)
            i18n.changeLanguage(lang)
            console.log(i18n.resolvedLanguage)
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
                    } else {
                        document.documentElement.classList.remove("dark")
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

    return (
        <div
            // className={`${noto.className}`}
            className={`bg-cover bg-[url(/images/backgroundImage/light/sky_00421.jpg)] dark:bg-[url(/images/backgroundImage/dark/starry-sky-gf5ade6b4f_1920.jpg)]`}
        >
            <div id="burger-outer-container">
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
                        setSideBarOpen={handleSideBarOpen}
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
                    {shouldFillPageBackground && (
                        <div className="absolute top-0 left-0 flex justify-center w-full h-full">
                            <div
                                className={`bg-white dark:bg-[#2C2C2C] w-full max-w-[600px] md:mt-[100px] mt-[85px] md:h-[calc(100%-100px)] h-[calc(100%-85px)]`}
                            />
                        </div>
                    )}
                    <div
                        className={
                            "h-full max-w-[600px] min-w-[350px] w-full overflow-x-hidden relative"
                        }
                    >
                        {showTabBar && (
                            <ViewHeader
                                isMobile={isMobile}
                                //page={page}
                                //tab={selectedTab}
                                setSideBarOpen={handleSideBarOpen}
                                setSearchText={setSearchText}
                                //selectedTab={selectedTab}
                                //menuIndex={menuIndex}
                                //menus={menus}
                                //onChangeMenuIndex={onChangeMenuIndex}
                            />
                        )}
                        <div
                            // className={`${
                            //     pathName === "/login"
                            //         ? "h-[calc(100%)]"
                            //         : showTabBar
                            //         ? `pt-[0px] h-[calc(100%-50px)]`
                            //         : `pt-[100px] h-[calc(100%-150px)]`
                            // }`}
                            className={`pt-[0px] h-[100%]`}
                        >
                            {children}
                        </div>
                        {showTabBar && <TabBar />}
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
                </main>
            </div>
        </div>
    )
}

// interface BurgerSiderBarProps {
//     isMobile: boolean
// }

// const BurgerSiderBar: React.FC<BurgerSiderBarProps> = (
//     children,
//     { isMobile }
// ) => {
//     const burgerMenuStyles = {
//         bmBurgerButton: {
//             position: "fixed",
//             width: "0",
//             height: "0",
//             left: "0",
//             top: "0",
//         },
//         bmBurgerBars: {
//             // background: '#373a47'
//         },
//         bmBurgerBarsHover: {
//             // background: '#a90000'
//         },
//         bmCrossButton: {
//             height: "0",
//             width: "0",
//         },
//         bmCross: {
//             // background: '#bdc3c7'
//         },
//         bmMenuWrap: {
//             // overflowX: "hidden",
//             // position: "fixed",
//             // height: "100%",
//         },
//         bmMenu: {
//             // background: '#373a47',
//             // padding: '2.5em 1.5em 0',
//             // fontSize: '1.15em'
//         },
//         bmMorphShape: {
//             // fill: '#373a47'
//         },
//         bmItemList: {
//             // color: '#b8b7ad',
//             // padding: '0.8em'
//         },
//         bmItem: {},
//         bmOverlay: { background: "transparent" },
//     }

//     return (
//         <>
//             <BurgerPush
//                 className={"backdrop-blur-[5px]"}
//                 outerContainerId="burger-outer-container"
//                 pageWrapId="main-container"
//                 // styles={burgerMenuStyles}
//                 // isOpen={drawerOpen}
//                 // onClose={() => {
//                 //     setDrawerOpen(false)
//                 // }}
//             >
//                 {children}
//             </BurgerPush>
//         </>
//     )
// }
