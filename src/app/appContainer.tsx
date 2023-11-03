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
import { BskyAgent } from "@atproto/api"
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
import { HistoryContext } from "@/app/_lib/hooks/historyContext"
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
    const [history, setHistory] = useState([pathName, ""])

    const zoomRef = useRef<ZoomRef>(null)
    const captionsRef = useRef<CaptionsRef>(null)

    const { background } = layout()

    // "/", "/search", "/inbox", "/post" それぞれを router.prefetch() を実行する
    useEffect(() => {
        router.prefetch("/")
        router.prefetch("/search")
        router.prefetch("/inbox")
        router.prefetch("/post")
    }, [])

    // クエリパラメータから、表示するべき画面タブの種別を取得し、setNextQueryParams() に設定する
    // deps: [pathName, searchParams]
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

    // isMobileでない場合に、キーのイベントリスナーを設定する
    // deps: [router, pathName]
    useEffect(() => {
        // モバイルだとキーイベントハンドラは登録しない
        // FIXME: モバイルでのBluetoothキーボードとかつないでる場合も考慮しない？
        if (isMobile) {
            return
        }

        // 設定するキーイベントハンドラ
        const handleKeyDown = (event: any) => {
            // FIXME: do not use 'any' as type

            // パスが "/post" の場合は、「"Escape" で戻る」のみ対応
            if (event.key === "Escape" && pathName === "/post") {
                event.preventDefault()
                router.back()
                return
            }

            // フォーカスがあたっている対象が、"textarea", "input" の場合は無効として何もしない
            if (
                event.target.tagName.toLowerCase() === "textarea" ||
                event.target.tagName.toLowerCase() === "input"
            ) {
                return
            }

            // Ctrl もしくは meta(Command や Windows) キーが押されていない状態(Option , Altは？) で "n" もしくは "N" を押したら、新規ポスト作成画面へ
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

        // キーイベントハンドラ登録
        window.addEventListener("keydown", handleKeyDown)

        return () => {
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [router, pathName])

    // [pathName, history[0]] を setHistory() に渡す
    // deps: [pathName]
    useEffect(() => {
        setHistory([pathName, history[0]])
    }, [pathName])

    // セッションの復元、もしくはログイン画面へのリダイレクト
    // deps [agent && agent.hasSession, pathName]
    useEffect(() => {
        // セッションが成立していれば何もしない
        if (agent?.hasSession === true) {
            return
        }

        // セッション復元、もしくはログイン画面へのリダイレクトをおこなうメソッド
        // FIXME: このセッション確認とログイン画面への遷移、Next の middleware でおこなった方がいいのかも
        // https://nextjs.org/docs/app/building-your-application/routing/middleware
        const restoreSession = async () => {
            // ローカルストレージから "session" アイテムを取得してみる
            const sessionJson = localStorage.getItem("session")

            // "session" アイテム が取得できなかった場合、"/login" ログイン画面に遷移する
            if (!sessionJson) {
                // 現在の画面が "/login" だったら、そのまま
                // FIXME: ここの "/login" への遷移は、下の同じパターンの所と共通処理にできるのでは？
                if (pathName === "/login") return
                if (router) {
                    // router が取得できていれば、ログイン後の戻り画面として現在の画面情報を設定して、"/login" 画面に遷移する
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
                    // router が取得できてなければ、location.href で "/login" 画面に遷移する
                    location.href = "/login"
                }
                return
            }

            // "session" アイテム が取得できてれば、パースし、resumeSession を試みる
            const session = JSON.parse(sessionJson).session
            const agent = new BskyAgent({
                service: `https://${JSON.parse(sessionJson).server}`,
            })

            try {
                // resumeSession を試みる
                await agent.resumeSession(session)
                // 成功したら agent を setAgent() に設定
                setAgent(agent)
            } catch (error) {
                // resumeSession に失敗したら、、"/login" ログイン画面に遷移する
                // FIXME: ここの "/login" への遷移は、上の同じパターンの所と共通処理にできるのでは？
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

            // userProfileDetailed がなくて、セッションが確立されていたら、getProfile() を呼び出す
            if (!userProfileDetailed && agent.hasSession === true) {
                const res = await agent.getProfile({
                    actor: agent.session?.did || "",
                })
                const { data } = res
                // getProfile()で取得した情報を、setUserProfileDetailed() で設定する
                setUserProfileDetailed(data)
            }

            // userPreferences がなくて、セッションが確立されていたら、getPreferences() を呼び出す
            if (!userPreferences && agent.hasSession === true) {
                try {
                    // getPreferences() を呼び出す
                    console.log("fetch preferences")
                    const res = await agent.getPreferences()

                    if (res) {
                        // 成功したら、setUserPreferences() で設定する
                        console.log(res)

                        setUserPreferences(res)

                        // UserPreferences.feed.pinned の feed のurlリストから、getFeedGenerators()を呼んで、feedの情報を取得する
                        const { data } =
                            await agent.app.bsky.feed.getFeedGenerators({
                                feeds: res.feeds.pinned as string[],
                            })

                        console.log(data)
                        // 取得できたフィード情報を、setFeedGenerators() で設定
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

        // セッション回復メソッドの呼び出し
        restoreSession()
    }, [agent && agent.hasSession, pathName])

    // searchText が設定されていたら検索画面に遷移する
    // deps [searchText]
    useEffect(() => {
        console.log(searchText)
        // searchText が空だったら何もしない
        if (searchText === "" || !searchText) return
        // searchText になにか文字列が設定されていたら、パラメータ設定して "/search" 検索画面に遷移する
        const queryParams = new URLSearchParams(nextQueryParams)
        queryParams.set("word", searchText)
        queryParams.set("target", target || "posts")

        router.push(`/search?${queryParams.toString()}`)
    }, [searchText])

    // pathName から、表示するタブバーを setShowTabBar()で設定する
    // deps [pathName]
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

    // imageGallery が設定されていたら、setImageSlideIndex() と setImageSlides() を設定する
    // deps [imageGallery]
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

    // pathName から、背景画像を表示させるかどうかの判定 useMemo()を使用
    // deps [pathName, searchParams]
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

    // muteWords の設定
    // deps [JSON.stringify(muteWords)]
    useEffect(() => {
        // muteWords が何も設定されてなかったら、設定しない
        if (muteWords.length === 0) return

        let newMuteWords = [...muteWords]

        // muteWords の word ごとに設定する
        for (const word of muteWords) {
            if (typeof word === "string") {
                // ひとまず？ word 以外は固定内容の Object を作成
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

                // 重複があるかチェック
                const isDuplicate = muteWords.find(
                    (muteWord) => muteWord.word === word
                )

                // 重複してなければ、登録
                if (!isDuplicate) {
                    console.log("add")
                    newMuteWords.push(json)
                } else {
                    console.log("この単語は既に存在します")
                }
            }
        }

        // FIXME: 各要素の型チェック "string" でない要素のみ("Object" もしくは "Muteword"型のみにした方がいいのでは？) filter で選別
        newMuteWords = newMuteWords.filter(
            (muteWord) => typeof muteWord !== "string"
        )
        // 更新した newMuteWords を setMuteWords() で設定
        setMuteWords(newMuteWords)
    }, [JSON.stringify(muteWords)])

    /*const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }))
    const bind = useDrag(({ down, offset: [ox, oy] }) => api.start({ x: ox, y: oy, immediate: down }), {
        bounds: { left: 0, right: 300, top: 0, bottom: 0 }
    })*/

    // const onChangeMenuIndex = (index: number) => {
    //     setMenuIndex(index)
    // }

    // feedGenerators の feed 詳細情報から、 displayName と uti のみのリストを作成する
    // deps [feedGenerators]
    useEffect(() => {
        // feedGenerators が未定義だったら何もしない
        if (!feedGenerators) {
            return
        }

        console.log("feedGenerators", feedGenerators)

        const newHeaderMenusByHeader = headerMenusByHeader
        // feedGenerators の feed 詳細情報から、 displayName と uti のみのリストを作成 -> menus
        const menus: HeaderMenu[] = feedGenerators.map((feed) => {
            return {
                displayText: feed.displayName,
                info: feed.uri,
            }
        })

        // menus の最初に "Following" を追加
        menus.unshift({
            displayText: "Following",
            info: "following",
        })

        // newHeaderMenusByHeader.home = menus

        // setHeaderMenusByHeader() で HeaderMenusByHeader Atom の home: を menus で置き換える
        setHeaderMenusByHeader((prevHeaderMenus) => ({
            ...prevHeaderMenus,
            home: menus,
        }))
    }, [feedGenerators])

    // FIXME: headerMenusByHeader の内容を console.log() で出力だけする(更新確認用？)
    // deps [headerMenusByHeader]
    useEffect(() => {
        console.log("headerMenusByHeader", headerMenusByHeader)
    }, [headerMenusByHeader])

    // pathName から、currentMenuType を setCurrentMenuType() で設定
    // pathName が "/search" の場合のみ、と searchParams の "target" から menuIndex を setMenuIndex() で設定
    // deps [pathName, searchParams]
    useEffect(() => {
        // pathName から、currentMenuType("home" | "search" | "inbox" | "onlyPost" | その他はないの?) を setCurrentMenuType() で設定
        if (pathName === "/") {
            setCurrentMenuType("home")
        } else if (pathName === "/search") {
            setCurrentMenuType("search")

            // pathName が "/search" の場合のみ、と searchParams の "target" から menuIndex ("post"=>0| "users"=>1 | "feeds"=>2 | その他=>0) を setMenuIndex() で設定
            // FIXME: 型にした方がいいのでは？
            switch (searchParams.get("target")) {
                case "posts":
                    setMenuIndex(0)
                    break
                case "users":
                    setMenuIndex(1)
                    break
                case "feeds":
                    setMenuIndex(2)
                    break
                default:
                    setMenuIndex(0)
                    break
            }
        } else if (pathName === "/inbox") {
            // setMenus(HEADER_MENUS.inbox)
            setCurrentMenuType("inbox")
        } else if (
            pathName.match(/^\/profile\/did:(\w+):(\w+)\/post\/(\w+)$/)
        ) {
            //setMenus(HEADER_MENUS.onlyPost)
            setCurrentMenuType("onlyPost")
        } // FIXME: else はなくて大丈夫？
    }, [pathName, searchParams])

    // FIXME: setDrawerOpen のエイリアスメソッド setDrawerOpen を渡せない理由があるのでしょうか？
    const setSideBarOpen = (isOpen: boolean) => {
        setDrawerOpen(isOpen)
    }

    // FIXME: css 定義だけど、外に出した方がいいのでは？
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

    // 表示言語設定 displayLanguage が変更されたら、i18n.changeLanguage() を設定する
    // deps [displayLanguage]
    useLayoutEffect(() => {
        const lngChange = (lng: any) => {
            // FIXME: displayLanguageの "-" 以降を削除して "en" とか "ja" のみにしてるけど、"-" のあとの国情報も考慮すべき
            // 同じ言語でも、国/地域によってちがう表現をすることもある。一番は中国語。文字自体がちがう
            // 例： 参考: https://so-zou.jp/web-app/tech/data/code/language.htm#rfc-4646
            // zh-CN 中国語(簡体字)
            // zh-TW 中国語(繁体字)
            // pt    ポルトガル語
            // pt-PT ポルトガル語(ポルトガル)
            // pt-BR ポルトガル語(ブラジル)
            // en-GB 英語(英国)
            // en-US 英語(米国)
            // "en-US" で指定して、なければ "en" にして再指定するなど。
            const lang = lng.replace(/-\w+$/, "")
            console.log(lang)
            // FIXME: 指定言語のファイルが見つからなかった場合のエラー対策が必要
            i18n.changeLanguage(lang)
            console.log(i18n.resolvedLanguage)
        }
        lngChange(displayLanguage[0])
    }, [displayLanguage])

    // テーマの設定 "system" の場合に、イベントリスナーを登録して、システム側のテーマが変更になった際に、テーマ変更をおこなう
    // deps []
    useEffect(() => {
        const mediaQueryLlistener = (e: any) => {
            // FIXME: Atom を使っていないのは何か理由があるのでしょうか？
            const appearanceColor = localStorage.getItem("appearanceColor")

            if (appearanceColor) {
                const parsedAppearanceColor = JSON.parse(appearanceColor)
                if (parsedAppearanceColor === "system") {
                    // FIXME: ここでのテーマの変更は、どこかに記録しないでも大丈夫でしょうか？
                    if (e.matches) {
                        document.documentElement.classList.add("dark")
                    } else {
                        document.documentElement.classList.remove("dark")
                    }
                }
            }
        }

        // FIXME: ここで "color-scheme: dark" としているのは、system側が "light" だったときには、必ず "change" イベントが発生するということでしょうか？
        const mql = window.matchMedia("(prefers-color-scheme: dark)")
        mql.addEventListener("change", mediaQueryLlistener)

        // Clean up the event listener on component unmount
        return () => {
            mql.removeEventListener("change", mediaQueryLlistener)
        }
    }, [])

    return (
        <HistoryContext.Provider value={history}>
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
                            setSideBarOpen={setSideBarOpen}
                            isMobile={isMobile}
                        />
                    </BurgerPush>
                    <main
                        id="main-container"
                        className={background()}
                        onClick={() => {
                            setSideBarOpen(false)
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
                                    // FIXME: isMobile は、ViewHeader 側で取得できるので、Props からはずしました。
                                    //isMobile={isMobile}
                                    //page={page}
                                    //tab={selectedTab}
                                    setSideBarOpen={setSideBarOpen}
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
        </HistoryContext.Provider>
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
