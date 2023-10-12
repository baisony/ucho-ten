"use client"
import { ViewHeader } from "@/app/components/ViewHeader"
import React, { useEffect, useRef, useState } from "react"
import { layout } from "@/app/styles"
import { TabBar } from "@/app/components/TabBar"
import { isMobile } from "react-device-detect"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
// import {useRequiredSession} from "@/app/_lib/hooks/useRequiredSession";
import { ViewSideBar } from "@/app/components/ViewSideBar"
//import { useSpring, animated, interpolate } from '@react-spring/web'
//import { useDrag } from '@use-gesture/react';
import "./sidebar.css"
import { useAgent } from "./_atoms/agent"
import { useUserProfileDetailedAtom } from "./_atoms/userProfileDetail"
import { BskyAgent } from "@atproto/api"
import { useFeedGeneratorsAtom } from "./_atoms/feedGenerators"
import { useUserPreferencesAtom } from "./_atoms/preferences"
import { useImageGalleryAtom } from "./_atoms/imageGallery"
import Lightbox, {
    CaptionsRef,
    Slide,
    ZoomRef,
} from "yet-another-react-lightbox"
import { Captions, Counter, Zoom } from "yet-another-react-lightbox/plugins"
import "yet-another-react-lightbox/styles.css"
import { useAppearanceColor } from "@/app/_atoms/appearanceColor"
import "yet-another-react-lightbox/plugins/captions.css"
import "yet-another-react-lightbox/plugins/counter.css"

export function AppConatiner({ children }: { children: React.ReactNode }) {
    //ここでsession作っておかないとpost画面を直で行った時にpostできないため
    const [agent, setAgent] = useAgent()
    const [appearanceColor] = useAppearanceColor()
    const [imageGallery, setImageGallery] = useImageGalleryAtom()
    const [userProfileDetailed, setUserProfileDetailed] =
        useUserProfileDetailedAtom()
    const [userPreferences, setUserPreferences] = useUserPreferencesAtom()
    const [feedGenerators, setFeedGenerators] = useFeedGeneratorsAtom()
    const router = useRouter()
    const pathName = usePathname()
    const searchParams = useSearchParams()
    const target = searchParams.get("target")
    const [value, setValue] = useState(false)
    const [isSideBarOpen, setIsSideBarOpen] = useState(false)
    const tab: string =
        pathName === "/"
            ? "home"
            : pathName === "/search" ||
              pathName === "/inbox" ||
              pathName === "/post"
            ? pathName.replace("/", "")
            : "home"
    //@ts-ignore
    const [selectedTab, setSelectedTab] = useState<string>(tab)
    const [searchText, setSearchText] = useState("")
    const [imageSlides, setImageSlides] = useState<Slide[] | null>(null)
    const [imageSlideIndex, setImageSlideIndex] = useState<number | null>(null)
    const specificPaths = ["/post", "/login"]
    const isMatchingPath = specificPaths.includes(pathName)
    const [showTabBar, setShowTabBar] = useState<boolean>(isMatchingPath)
    const { background } = layout()
    const [darkMode, setDarkMode] = useState(false)
    const zoomRef = useRef<ZoomRef>(null)
    const captionsRef = useRef<CaptionsRef>(null)
    const color = darkMode ? "dark" : "light"

    const [page, setPage] = useState<"profile" | "home" | "post" | "search">(
        "home"
    )

    const modeMe = (e: any) => {
        if (appearanceColor !== "system") return
        setDarkMode(!!e.matches)
    }

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
        router.push(`/search?word=${searchText}&target=${target || "posts"}`)
    }, [searchText])

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
        if (pathName.startsWith("/search")) {
            setPage("search")
            setSelectedTab("search")
        } else if (pathName.startsWith("/profile")) {
            setPage("profile")
            setSelectedTab("home")
        } else if (pathName.startsWith("/post")) {
            setPage("post")
            setSelectedTab("post")
        } else if (pathName.startsWith("/inbox")) {
            setPage("home") // TODO: ??
            setSelectedTab("inbox")
        } else {
            setPage("home")
            setSelectedTab("home")
        }

        setShowTabBar(specificPaths.includes(pathName))
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

    /*const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }))
    const bind = useDrag(({ down, offset: [ox, oy] }) => api.start({ x: ox, y: oy, immediate: down }), {
        bounds: { left: 0, right: 300, top: 0, bottom: 0 }
    })*/
    console.log(isMatchingPath)

    return (
        <>
            <main className={background({ color: color, isMobile: isMobile })}>
                <div
                    className={
                        "h-full max-w-[600px] min-w-[350px] w-full overflow-x-hidden relative"
                    }
                >
                    {!showTabBar && (
                        <ViewHeader
                            color={color}
                            page={page}
                            tab={selectedTab}
                            setSideBarOpen={setIsSideBarOpen}
                            setSearchText={setSearchText}
                            selectedTab={selectedTab}
                        />
                    )}
                    <div
                        className={`z-[11] bg-black bg-opacity-50 absolute h-full w-full ${
                            !isSideBarOpen && `hidden`
                        }`}
                        onClick={() => setIsSideBarOpen(false)}
                    >
                        {/*<animated.div
                            className={`${isSideBarOpen && `openSideBar`} absolute h-full w-[70svw] min-w-[210px] max-w-[350px] bg-black z-[12] left-[-300px]`}
                            style={{x: x}}
                        >
                            <ViewSideBar color={color} setSideBarOpen={setIsSideBarOpen} isMobile={isMobile}/>
                        </animated.div>*/}
                        <div
                            className={`${
                                isSideBarOpen && `openSideBar`
                            } absolute h-[calc(100%)] w-[70svw] min-w-[210px] max-w-[350px] backdrop-blur-[5px] bg-black/40 z-[12] left-[-300px]`}
                        >
                            <ViewSideBar
                                color={color}
                                setSideBarOpen={setIsSideBarOpen}
                                isMobile={isMobile}
                            />
                        </div>
                    </div>
                    <div
                        className={`${showTabBar ? `pt-[0px]` : `pt-[100px]`} 
                        ${
                            !isMatchingPath ? `h-[calc(100%-50px)]` : `h-full`
                        } overflow-y-scroll`}
                    >
                        {children}
                    </div>
                    {!showTabBar && (
                        <TabBar
                            color={color}
                            selected={selectedTab}
                            setValue={setSelectedTab}
                        />
                    )}
                </div>
            </main>
            {imageSlides && imageSlideIndex !== null && (
                <div
                    onClick={(e) => {
                        const clickedElement = e.target as HTMLDivElement

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
                        carousel={{ finite: imageSlides.length <= 5 }}
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
        </>
    )
}
