"use client"

import {
    memo,
    MutableRefObject,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react"
import Image from "next/image"
import { viewHeader } from "./styles"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBars } from "@fortawesome/free-solid-svg-icons/faBars"
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft"
import { faXmark } from "@fortawesome/free-solid-svg-icons/faXmark"

import { Button } from "@nextui-org/react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Swiper, SwiperSlide } from "swiper/react"
import SwiperCore from "swiper/core"
import {
    HeaderMenu,
    useCurrentMenuType,
    useHeaderMenusByHeaderAtom,
    useMenuIndex,
    useMenuIndexChangedByMenu,
} from "@/app/_atoms/headerMenu"
import { HeaderMenuType } from "@/app/_constants/headerMenus"
import { useNextQueryParamsAtom } from "@/app/_atoms/nextQueryParams"
import { useTranslation } from "react-i18next"
import "swiper/css"

import logoImage from "@/../public/images/logo/ucho-ten.svg"
import { useTappedTabbarButtonAtom } from "@/app/_atoms/tabbarButtonTapped"
import { useSearchInfoAtom } from "@/app/_atoms/searchInfo"
import Link from "next/link"
import { useFeedGeneratorsAtom } from "@/app/_atoms/feedGenerators"
import { isMobile } from "react-device-detect"

interface Props {
    className?: string
    open?: boolean
    isNextPage?: boolean
    setSideBarOpen?: (v: boolean) => void
    setSearchText?: MutableRefObject<string | undefined>
}

export const ViewHeader: React.FC<Props> = memo((props: Props) => {
    const router = useRouter()
    const pathname = usePathname()
    const specificPaths = ["/search"]
    const isMatchingPath = specificPaths.includes(pathname)
    const [feedGenerators] = useFeedGeneratorsAtom()
    const [menus] = useHeaderMenusByHeaderAtom()
    const [menuIndex, setMenuIndex] = useMenuIndex()
    const [, setMenuIndexChangedByMenu] = useMenuIndexChangedByMenu()
    const [currentMenuType] = useCurrentMenuType()
    const [tappedTabbarButton, setTappedTabbarButton] =
        useTappedTabbarButtonAtom()
    const [searchInfo, setSearchInfo] = useSearchInfoAtom()

    const { setSideBarOpen } = props
    const { t } = useTranslation()
    const searchParams = useSearchParams()
    const [searchText, setSearchText] = useState<string>("")
    const [nextQueryParams] = useNextQueryParamsAtom()
    const isComposing = useRef(false)
    const [isRoot, setIsRoot] = useState<boolean>(true)
    //const [showSearchInput, setShowSearchInput] = useState<boolean>(false)

    const swiperRef = useRef<SwiperCore | null>(null)
    const prevMenuType = useRef<HeaderMenuType>("home")

    const { Header, top, bottom, HeaderInputArea } = viewHeader()

    useEffect(() => {
        console.log(props)
    }, [props])

    useEffect(() => {
        if (tappedTabbarButton == "search") {
            setSearchText("")

            setSearchInfo({
                target: "",
                searchWord: "",
            })

            const queryParams = new URLSearchParams(searchParams)
            queryParams.delete("target")
            queryParams.delete("word")

            setTappedTabbarButton(null)

            router.push(`/search?${queryParams.toString()}`)
        }
    }, [tappedTabbarButton])

    useEffect(() => {
        setSearchInfo((prevSearchInfo) => {
            const newSearchInfo = prevSearchInfo

            newSearchInfo.searchWord = searchText

            return newSearchInfo
        })
    }, [searchText])

    useEffect(() => {
        const search = searchParams.get("word")

        if (!search) {
            return
        }

        setSearchText(search)
    }, [searchParams])

    useEffect(() => {
        if (!isMobile) {
            setIsRoot(true)
            return
        }

        switch (pathname) {
            case "/":
            case "/home":
            case "/search":
            case "/u-tab":
            case "/inbox":
            case "/post":
                setIsRoot(true)
                break
            default:
                setIsRoot(false)
                break
        }
    }, [pathname])

    useEffect(() => {
        if (swiperRef.current && menuIndex !== swiperRef.current.activeIndex) {
            if (currentMenuType !== prevMenuType.current) {
                swiperRef.current.slideTo(menuIndex, 0)
            } else {
                swiperRef.current.slideTo(menuIndex)
            }
        }

        prevMenuType.current = currentMenuType
    }, [currentMenuType, menuIndex, swiperRef.current])

    const currentMenu = useMemo(() => {
        if (currentMenuType === "home") {
            if (feedGenerators === null) return
        }
        return menus[currentMenuType]
    }, [menus, currentMenuType, feedGenerators])

    const tl = useCallback((word: string) => {
        const translate = t(`components.ViewHeader.${word}`)
        let res
        if (translate === `components.ViewHeader.${word}`) {
            res = word
        } else {
            res = translate
        }
        return res
    }, [])

    return (
        <main className={Header({ isMatchingPath })}>
            <div className={top({ isMatchingPath })}>
                <Button
                    className={
                        "absolute left-[0px] p-[20px] text-white lg:hidden"
                    }
                    variant="light"
                    startContent={
                        <FontAwesomeIcon
                            className={"md:h-[20px] h-[18px]"}
                            icon={isRoot ? faBars : faChevronLeft}
                        />
                    }
                    onClick={() => {
                        if (isRoot && setSideBarOpen) {
                            setSideBarOpen(true)
                        } else {
                            if (pathname === "/login") {
                                router.push("/")
                            } else {
                                router.back()
                            }
                        }
                    }}
                />
                {pathname === "/search" && (
                    <div
                        className={
                            "h-[40px] w-[60%] rounded-[10px] overflow-hidden relative"
                        }
                    >
                        <input
                            id={"searchBar"}
                            className={HeaderInputArea()}
                            value={searchText}
                            autoFocus={true}
                            onChange={(e) => {
                                setSearchText(e.target.value)
                            }}
                            placeholder={t("components.ViewHeader.search")}
                            onKeyDown={(e) => {
                                if (e.key !== "Enter" || isComposing.current)
                                    return //1

                                // props.setSearchText(searchText)
                                document.getElementById("searchBar")?.blur()

                                const queryParams = new URLSearchParams(
                                    nextQueryParams
                                )

                                const searchTarget =
                                    searchInfo.target !== ""
                                        ? searchInfo.target
                                        : "posts"

                                setSearchInfo((prevSearchInfo) => {
                                    const newSearchInfo = prevSearchInfo

                                    if (prevSearchInfo.target === "") {
                                        newSearchInfo.target = "posts"
                                    }

                                    newSearchInfo.searchWord = searchText

                                    return newSearchInfo
                                })

                                queryParams.set("word", searchText)
                                queryParams.set("target", searchTarget)

                                router.push(`/search?${queryParams.toString()}`)
                            }}
                            onCompositionStart={() =>
                                (isComposing.current = true)
                            }
                            onCompositionEnd={() =>
                                (isComposing.current = false)
                            }
                        />
                        {searchText && searchText.length > 0 && (
                            <button
                                className={
                                    "absolute md:right-[8px] md:top-[8px] md:h-[25px] md:w-[25px] right-[10px] top-[10px] h-[18px] w-[18px] bg-black bg-opacity-30 rounded-full flex items-center justify-center"
                                }
                                onClick={() => {
                                    if (!props.setSearchText) return
                                    setSearchText("")
                                    props.setSearchText.current = ""
                                }}
                            >
                                <FontAwesomeIcon
                                    className={
                                        "md:h-[20px] md:w-[20px] h-[10px] w-[10px] text-white"
                                    }
                                    icon={faXmark}
                                />
                            </button>
                        )}
                    </div>
                )}
                {pathname !== "/search" && (
                    <Link href={`/?${nextQueryParams.toString()}`}>
                        <Image
                            className={"md:h-[24px] h-[20px] cursor-pointer"}
                            src={logoImage}
                            alt={"logo"}
                            loading={"eager"}
                        />
                    </Link>
                )}
            </div>
            {/* <ScrollShadow
                className={bottom({ page: page })}
                offset={100}
                // style={{ overflowX: "scroll", overflowY: "hidden" }}
                orientation="horizontal"
                hideScrollBar
            > */}
            <Swiper
                onSwiper={(swiper) => {
                    swiperRef.current = swiper
                }}
                cssMode={true}
                slidesPerView={"auto"}
                className={bottom({ isMatchingPath })}
                navigation={true}
            >
                {currentMenu &&
                    currentMenu.map((menu: HeaderMenu, index: number) => (
                        <SwiperSlide
                            key={`view-header-menu-${index}`}
                            onClick={() => {
                                setMenuIndexChangedByMenu(true)
                                setMenuIndex(index)
                            }}
                            className="pl-3 pr-3"
                            style={{
                                width:
                                    currentMenu.length <= 3
                                        ? `${100 / currentMenu.length}%`
                                        : "fit-content",
                            }}
                        >
                            <div
                                className={`${
                                    menuIndex === index
                                        ? "text-white"
                                        : "text-[#909090]"
                                } md:text-[15px] text-[13px] flex justify-center items-center ${
                                    isMatchingPath ? `lg:h-[27px]` : `lg:h-full`
                                } cursor-pointer`}
                            >
                                {tl(menu.displayText)}
                            </div>
                        </SwiperSlide>
                    ))}
            </Swiper>
        </main>
    )
})
