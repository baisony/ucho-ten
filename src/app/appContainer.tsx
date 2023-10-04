'use client';
import {ViewHeader} from "@/app/components/ViewHeader";
import React, {useState, useEffect} from "react";
import {layout} from "@/app/styles";
import {TabBar} from "@/app/components/TabBar";
import {isMobile} from "react-device-detect";
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
// import {useRequiredSession} from "@/app/_lib/hooks/useRequiredSession";
import {ViewSideBar} from "@/app/components/ViewSideBar";
//import { useSpring, animated, interpolate } from '@react-spring/web'
//import { useDrag } from '@use-gesture/react';
import './sidebar.css'
import { useAgent } from "./_atoms/agent";
import { useUserProfileDetailedAtom } from "./_atoms/userProfileDetail";
import { BskyAgent } from "@atproto/api";
import { useFeedGeneratorsAtom } from "./_atoms/feedGenerators";
import { useUserPreferencesAtom } from "./_atoms/preferences";
import { useImageGalleryAtom } from "./_atoms/imageGallery";
import Lightbox, { Slide } from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

export function AppConatiner({ children }: { children: React.ReactNode }) {
    //ここでsession作っておかないとpost画面を直で行った時にpostできないため
    const [agent, setAgent] = useAgent()
    const [imageGallery, setImageGallery] = useImageGalleryAtom()
    const [userProfileDetailed, setUserProfileDetailed] = useUserProfileDetailedAtom()
    const [userPreferences, setUserPreferences] = useUserPreferencesAtom()
    const [feedGenerators, setFeedGenerators] = useFeedGeneratorsAtom()
    const router = useRouter()
    const pathName = usePathname()
    const searchParams = useSearchParams()
    const target = searchParams.get('target')
    const [value, setValue] = useState(false)
    const [isSideBarOpen, setIsSideBarOpen] = useState(false)
    const tab = pathName === '/' ? 'home' : (pathName === '/search' || pathName === '/inbox' || pathName === '/post') ? pathName.replace("/",'') : 'home';
    //@ts-ignore
    const [selectedTab, setSelectedTab] = useState<"home" | "search" | "inbox" | "post">(tab);
    const [searchText, setSearchText] = useState("");
    const [imageSlides, setImageSlides] = useState<Slide[] | null>(null)
    const [imageSlideIndex, setImageSlideIndex] = useState<number | null>(null)
    const specificPaths = ['/post', '/login']
    const isMatchingPath = specificPaths.includes(pathName)
    const {background} = layout();
    const [darkMode, setDarkMode] = useState(false);
    const color = darkMode ? 'dark' : 'light'

    const [page, setPage] = useState<'profile' | 'home' | 'post' | 'search'>("home")

    const modeMe = (e:any) => {
        setDarkMode(!!e.matches);
    };

    useEffect(() => {
        if (agent?.hasSession === true) {
            return
        }

        const restoreSession = async () => {
            const sessionJson = localStorage.getItem('session')

            if (!sessionJson) {
                if(pathName === '/login') return
                if (router) {
                    router.push(`/login${pathName? `?toRedirect=${pathName.replace('/', '')}${searchParams ? `&${searchParams}` : ``}` : ``}`)
                } else {
                    location.href = '/login'
                }
                return
            }

            const session = JSON.parse(sessionJson).session
            const agent = new BskyAgent({ service: `https://${JSON.parse(sessionJson).server}` })

            try {
                await agent.resumeSession(session)

                setAgent(agent)
            } catch (error) {
                console.error(error)
                if(pathName === '/login') return
                if (router) {
                    router.push(`/login${pathName? `?toRedirect=${pathName.replace('/', '')}${searchParams ? `&${searchParams}` : ``}` : ``}`)
                } else {
                    location.href = '/login'
                }
            }

            if (!userProfileDetailed && agent.hasSession === true) {
                const res = await agent.getProfile({ actor: agent.session?.did || "" })
                const {data} = res
        
                setUserProfileDetailed(data)
            }

            if (!userPreferences && agent.hasSession === true) {
                try {
                    console.log('fetch preferences')
                    const res = await agent.getPreferences()
            
                    if (res) {
                        console.log(res)
            
                        setUserPreferences(res)
            
                        const {data} = await agent.app.bsky.feed.getFeedGenerators({feeds: res.feeds.pinned as string[]})
            
                        console.log(data)
            
                        setFeedGenerators(data.feeds)
                    } else {
                        // もしresがundefinedだった場合の処理
                        console.log('Responseがundefinedです。')
                    }
                } catch(e) {
                    console.log(e)
                }
            }
        }

        restoreSession()
    }, [agent && agent.hasSession, pathName])

    useEffect(() => {
        console.log(searchText)
        if(searchText === '' || !searchText) return
        router.push(`/search?word=${searchText}&target=${target || 'posts'}`)
    },[searchText])

    useEffect(() => {
        console.log('hoge')
        const matchMedia = window.matchMedia("(prefers-color-scheme: dark)");

        setDarkMode(matchMedia.matches);
        matchMedia.addEventListener("change", modeMe);

        return () => matchMedia.removeEventListener("change", modeMe);
    }, []);

    useEffect(() => {
        if (pathName.startsWith("/search")) {
            console.log("search", pathName)
            setPage("search")
        } else if (pathName.startsWith("/profile")) {
            console.log("profile", pathName)
            setPage("profile")
        } else if (pathName.startsWith("/post")) {
            console.log("post", pathName)
            setPage("post")
        } else {
            console.log("home", pathName)
            setPage("home")
        }
    }, [pathName])

    useEffect(() => {
        if (imageGallery && imageGallery.imageURLs.length > 0) {
            let slides: Slide[] = []

            for(const imageURL of imageGallery.imageURLs) {
                slides.push({
                    src: imageURL
                })
            }

            console.log("here")

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
                {agent ? (
                    <div className={'h-full max-w-[600px] min-w-[350px] w-full overflow-x-hidden relative'}>
                        {!isMatchingPath && (
                            <ViewHeader color={color} page={page} tab={selectedTab} setSideBarOpen={setIsSideBarOpen} setSearchText={setSearchText} selectedTab={selectedTab}/>
                        )}
                        <div className={`z-[11] bg-black bg-opacity-50 absolute h-full w-full ${!isSideBarOpen && `hidden`}`}
                            onClick={() => setIsSideBarOpen(false)}
                        >
                            {/*<animated.div
                                className={`${isSideBarOpen && `openSideBar`} absolute h-full w-[70svw] min-w-[210px] max-w-[350px] bg-black z-[12] left-[-300px]`}
                                style={{x: x}}
                            >
                                <ViewSideBar color={color} setSideBarOpen={setIsSideBarOpen} isMobile={isMobile}/>
                            </animated.div>*/}
                            <div className={`${isSideBarOpen && `openSideBar`} absolute h-[calc(100%-50px)] w-[70svw] min-w-[210px] max-w-[350px] bg-black bg-opacity-90 z-[12] left-[-300px]`}>
                                <ViewSideBar color={color} setSideBarOpen={setIsSideBarOpen} isMobile={isMobile}/>
                            </div>
                        </div>
                        <div className={`${isMatchingPath ? `pt-[0px]` : `pt-[100px]`} h-[calc(100%-50px)] overflow-y-scroll`}>
                            {children}
                        </div>
                        {!isMatchingPath && (
                            <TabBar color={color} selected={selectedTab} setValue={setSelectedTab}/>
                        )}
                    </div>
                ) : (
                    <div className={'h-full max-w-[600px] min-w-[350px] w-full'}>
                        {children}
                    </div>
                )}
            </main>
            {(imageSlides && imageSlideIndex !== null) &&
                <div style= {
                    {
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        width: "100%",
                        height: "100%",
                        zIndex: 1000
                    }
                }>
                    <Lightbox 
                        open={true}
                        index={imageSlideIndex}
                        close={() => {
                            setImageGallery(null)
                            setImageSlides(null)
                            setImageSlideIndex(null)
                        }}
                        slides={imageSlides}
                    />
                </div>
            }
        </>
    )
}

