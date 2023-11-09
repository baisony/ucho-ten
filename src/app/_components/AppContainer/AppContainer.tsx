"use client"

import "../../_i18n/config" //i18
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
import { ViewSideBar } from "@/app/_components/ViewSideBar"
import { useAgent } from "../../_atoms/agent"
import { useUserProfileDetailedAtom } from "../../_atoms/userProfileDetail"
import { AppBskyFeedDefs, BskyAgent } from "@atproto/api"
import { useFeedGeneratorsAtom } from "../../_atoms/feedGenerators"
import { useUserPreferencesAtom } from "../../_atoms/preferences"
import { useImageGalleryAtom } from "../../_atoms/imageGallery"
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
import { HeaderMenu, useHeaderMenusByHeaderAtom } from "../../_atoms/headerMenu"
import { useWordMutes } from "@/app/_atoms/wordMute"
import { useTranslation } from "react-i18next"
import { useDisplayLanguage } from "@/app/_atoms/displayLanguage"
import { useNextQueryParamsAtom } from "../../_atoms/nextQueryParams"
import { isTabQueryParamValue, TabQueryParamValue } from "../../_types/types"
import logoImage from "../../../../public/images/logo/ucho-ten.svg"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faBookmark,
    faGear,
    faHome,
    faInbox,
    faMagnifyingGlass,
    faPenToSquare,
} from "@fortawesome/free-solid-svg-icons"
import Link from "next/link"
import {
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
} from "@nextui-org/react"

export function AppConatiner({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathName = usePathname()
    const searchParams = useSearchParams()
    const { i18n } = useTranslation()
    const searchPath = ["/search"]
    const isSearchScreen = searchPath.includes(pathName)
    const [displayLanguage] = useDisplayLanguage()
    const [agent, setAgent] = useAgent()
    const [headerMenusByHeader, setHeaderMenusByHeader] =
        useHeaderMenusByHeaderAtom()
    const [muteWords, setMuteWords] = useWordMutes()
    const [nextQueryParams, setNextQueryParams] = useNextQueryParamsAtom()
    const [imageGallery, setImageGallery] = useImageGalleryAtom()
    const [userProfileDetailed, setUserProfileDetailed] =
        useUserProfileDetailedAtom()
    const [userPreferences, setUserPreferences] = useUserPreferencesAtom()
    const [, setFeedGenerators] = useFeedGeneratorsAtom()

    const target = searchParams.get("target")
    const [searchText, setSearchText] = useState<string>("")
    const [imageSlides, setImageSlides] = useState<Slide[] | null>(null)
    const [imageSlideIndex, setImageSlideIndex] = useState<number | null>(null)
    const specificPaths = ["/post", "/login"]
    const isMatchingPath = specificPaths.includes(pathName)
    const [showTabBar, setShowTabBar] = useState<boolean>(!isMatchingPath)
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false)

    const zoomRef = useRef<ZoomRef>(null)
    const captionsRef = useRef<CaptionsRef>(null)

    const { background } = layout()

    useEffect(() => {
        router.prefetch("/")
        router.prefetch("/login")
        router.prefetch("/search")
        router.prefetch("/inbox")
        router.prefetch("/post")
        router.prefetch("/settings")
        router.prefetch("/bookmarks")
        router.prefetch("/feeds")
        router.prefetch("/profile/[identifier]/post/[postid]")
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
                            console.log(e)
                        })

                    promises.push(userPreferencesPromise)
                }

                // 並列で実行する
                Promise.all(promises).then(() => {
                    console.log("done")
                })
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
                    <div
                        className={
                            "w-full h-full flex justify-center select-none"
                        }
                    >
                        <div
                            className={
                                "xl:w-[calc(100%/4)] h-full hidden xl:block"
                            }
                        >
                            {showTabBar && (
                                <div className={"flex justify-end items-end"}>
                                    <div
                                        className={
                                            "mr-[30px] mt-[25px] text-[16px]"
                                        }
                                    >
                                        <div
                                            className={
                                                "mb-[50px] cursor-pointer"
                                            }
                                        >
                                            <Link href={"/"}>
                                                <img
                                                    className={"h-[24px]"}
                                                    src={logoImage.src}
                                                    alt={"logo"}
                                                />
                                            </Link>
                                        </div>
                                        <Link
                                            className={
                                                "mb-[15px] cursor-pointer flex"
                                            }
                                            href={"/"}
                                        >
                                            <div className={"mr-[10px]"}>
                                                <FontAwesomeIcon
                                                    icon={faHome}
                                                />
                                            </div>
                                            Home
                                        </Link>
                                        <Link
                                            className={
                                                "mb-[15px] cursor-pointer flex"
                                            }
                                            href={"/bookmarks"}
                                        >
                                            <div className={"mr-[10px]"}>
                                                <FontAwesomeIcon
                                                    icon={faBookmark}
                                                />
                                            </div>
                                            Bookmark
                                        </Link>
                                        <Link
                                            className={
                                                "mb-[15px] cursor-pointer flex"
                                            }
                                            href={"/inbox"}
                                        >
                                            <div className={"mr-[10px]"}>
                                                <FontAwesomeIcon
                                                    icon={faInbox}
                                                />
                                            </div>
                                            Inbox
                                        </Link>
                                        <Link
                                            className={
                                                "mb-[15px] cursor-pointer flex"
                                            }
                                            href={"/search"}
                                        >
                                            <div className={"mr-[10px]"}>
                                                <FontAwesomeIcon
                                                    icon={faMagnifyingGlass}
                                                />
                                            </div>
                                            Search
                                        </Link>
                                        <Link
                                            className={
                                                "mb-[15px] cursor-pointer flex"
                                            }
                                            href={"/post"}
                                        >
                                            <div className={"mr-[10px]"}>
                                                <FontAwesomeIcon
                                                    icon={faPenToSquare}
                                                />
                                            </div>
                                            Post
                                        </Link>
                                        <Link
                                            href={"/settings"}
                                            className={
                                                "mb-[15px] cursor-pointer flex"
                                            }
                                        >
                                            <div className={"mr-[10px]"}>
                                                <FontAwesomeIcon
                                                    icon={faGear}
                                                />
                                            </div>
                                            Settings
                                        </Link>
                                        <Dropdown>
                                            <DropdownTrigger>
                                                <div
                                                    className={
                                                        "w-full flex cursor-pointer"
                                                    }
                                                >
                                                    <img
                                                        src={
                                                            userProfileDetailed?.avatar
                                                        }
                                                        className={
                                                            "h-[20px] w-[20px] rounded-full overflow-hidden mr-[10px]"
                                                        }
                                                    />
                                                    <div
                                                        className={
                                                            "text-[14px]"
                                                        }
                                                    >
                                                        {
                                                            userProfileDetailed?.displayName
                                                        }
                                                    </div>
                                                </div>
                                            </DropdownTrigger>
                                            <DropdownMenu
                                                className={
                                                    "text-black dark:text-white"
                                                }
                                                aria-label={"dropdown-menu"}
                                                onAction={(key) => {
                                                    switch (key) {
                                                        case "about":
                                                            console.log("hoge")
                                                            break
                                                        case "bugreport":
                                                            console.log("hoge")
                                                            break
                                                        case "switchaccount":
                                                            console.log("hoge")
                                                            break
                                                    }
                                                }}
                                            >
                                                <DropdownItem key="new">
                                                    About
                                                </DropdownItem>
                                                <DropdownItem key="copy">
                                                    <a
                                                        href={
                                                            process.env
                                                                .NEXT_PUBLIC_BUG_REPORT_PAGE ||
                                                            "https://google.com"
                                                        }
                                                        target={"_blank"}
                                                        rel={"noreferrer"}
                                                    >
                                                        Bug Report
                                                    </a>
                                                </DropdownItem>
                                                <DropdownItem key="edit">
                                                    Switch Account
                                                </DropdownItem>
                                                <DropdownItem
                                                    key="delete"
                                                    className="text-danger"
                                                    color="danger"
                                                >
                                                    Logout
                                                </DropdownItem>
                                            </DropdownMenu>
                                        </Dropdown>
                                    </div>
                                </div>
                            )}
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
                                {showTabBar && (
                                    <ViewHeader
                                        isMobile={isMobile}
                                        setSideBarOpen={handleSideBarOpen}
                                        setSearchText={setSearchText}
                                    />
                                )}
                                <div className={`pt-[0px] h-[100%] relative`}>
                                    {shouldFillPageBackground && (
                                        <div className="absolute top-0 left-0 flex justify-center w-full h-full">
                                            <div
                                                className={`bg-white dark:bg-[#2C2C2C] w-full max-w-[600px] ${
                                                    isSearchScreen
                                                        ? `xl:mt-[100px]`
                                                        : `xl:mt-[50px]`
                                                } md:mt-[100px] mt-[85px] xl:h-[calc(100%-50px)] md:h-[calc(100%-100px)] h-[calc(100%-85px)]`}
                                            />
                                        </div>
                                    )}
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
                        </div>
                        <div
                            className={
                                "xl:w-[calc(100%/4)] h-full hidden xl:flex"
                            }
                        ></div>
                    </div>
                </main>
            </div>
        </div>
    )
}
