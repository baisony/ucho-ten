import React, { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { viewHeader } from "./styles"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faBars,
    faChevronLeft,
    faXmark,
} from "@fortawesome/free-solid-svg-icons"
import "react-circular-progressbar/dist/styles.css"
import { Button } from "@nextui-org/react"
// import { Tabs, Tab, Chip } from "@nextui-org/react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
// import { useAgent } from "@/app/_atoms/agent"
// import { useFeedGeneratorsAtom } from "@/app/_atoms/feedGenerators"
// import { useUserPreferencesAtom } from "@/app/_atoms/preferences"
// import Slider, { Settings } from "react-slick"
import { Swiper, SwiperSlide } from "swiper/react"
import SwiperCore from "swiper/core"
import {
    HeaderMenu,
    useHeaderMenusAtom,
    useMenuIndexAtom,
    useMenuIndexChangedByMenu,
} from "@/app/_atoms/headerMenu"
import { useNextQueryParamsAtom } from "@/app/_atoms/nextQueryParams"

import { useTranslation } from "react-i18next"

import "swiper/css"
import "swiper/css/pagination"

import logoImage from "@/../public/images/logo/ucho-ten.svg"

interface Props {
    className?: string
    isMobile?: boolean
    open?: boolean
    //tab: string //"home" | "search" | "inbox" | "post"
    //page: string // "profile" | "home" | "post" | "search"
    isNextPage?: boolean
    setSideBarOpen?: any
    //selectedTab: string
    setSearchText?: any
}

export const ViewHeader: React.FC<Props> = (props: Props) => {
    // const [agent] = useAgent()
    // const [userPreferences] = useUserPreferencesAtom()
    // const pathname = usePathname()
    const router = useRouter()
    const pathname = usePathname()
    const [menus] = useHeaderMenusAtom()
    const [menuIndex, setMenuIndex] = useMenuIndexAtom()
    const [, setMenuIndexChangedByMenu] = useMenuIndexChangedByMenu()

    const {
        className,
        isMobile,
        open,
        //tab,
        //page,
        //isNextPage,
        setSideBarOpen,
        //selectedTab,
    } = props
    const { t } = useTranslation()
    const searchParams = useSearchParams()
    const [searchText, setSearchText] = useState<string>("")
    const target = searchParams.get("target")
    const [nextQueryParams] = useNextQueryParamsAtom()
    // const [isSideBarOpen, setIsSideBarOpen] = useState<boolean>(false)
    const [isComposing, setComposing] = useState(false)
    const [isRoot, setIsRoot] = useState<boolean>(true)
    const [showSearchInput, setShowSearchInput] = useState<boolean>(false)

    const swiperRef = useRef<SwiperCore | null>(null)

    const {
        Header,
        HeaderContentTitleContainer,
        HeaderContentTitle,
        top,
        bottom,
        HeaderInputArea,
    } = viewHeader()

    useEffect(() => {
        const search = searchParams.get("word")

        if (!search) {
            return
        }

        setSearchText(search)
    }, [searchParams])

    useEffect(() => {
        console.log("test", isMobile, pathname)
        if (!isMobile) {
            setIsRoot(true)
            return
        }

        switch (pathname) {
            case "/":
            case "/search":
            case "/inbox":
            case "/post":
                setIsRoot(true)
                break
            default:
                setIsRoot(false)
                break
        }
    }, [pathname, isMobile])

    useEffect(() => {
        if (pathname === "/search") {
            setShowSearchInput(true)
        } else {
            setShowSearchInput(false)
        }
    }, [pathname])

    useEffect(() => {
        if (!swiperRef.current) {
            return
        }

        if (menuIndex !== swiperRef.current.activeIndex) {
            swiperRef.current.slideTo(menuIndex)
        }
    }, [menuIndex])

    return (
        <main className={Header()}>
            <div className={top()}>
                <Button
                    className={"absolute left-[0px] p-[20px] text-white"}
                    variant="light"
                    startContent={
                        <FontAwesomeIcon
                            className={"md:h-[20px] h-[18px]"}
                            icon={isRoot === true ? faBars : faChevronLeft}
                        />
                    }
                    onClick={() => {
                        //setIsSideBarOpen(!isSideBarOpen)
                        //console.log(setValue)
                        if (isRoot) {
                            setSideBarOpen(true)
                        } else {
                            router.back()
                        }
                    }}
                />
                {showSearchInput && (
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
                                if (e.key !== "Enter" || isComposing) return //1
                                props.setSearchText(searchText)
                                document.getElementById("searchBar")?.blur()
                                const queryParams = new URLSearchParams(
                                    nextQueryParams
                                )
                                queryParams.set(
                                    "word",
                                    encodeURIComponent(searchText)
                                )
                                queryParams.set("target", target || "posts")
                                router.push(
                                    `/search?${nextQueryParams.toString()}`
                                )
                            }}
                            onCompositionStart={() => setComposing(true)}
                            onCompositionEnd={() => setComposing(false)}
                        />
                        {searchText && searchText.length > 0 && (
                            <button
                                className={
                                    "absolute md:right-[8px] md:top-[8px] md:h-[25px] md:w-[25px] right-[10px] top-[10px] h-[18px] w-[18px] bg-black bg-opacity-30 rounded-full flex items-center justify-center"
                                }
                                onClick={() => {
                                    setSearchText("")
                                    props.setSearchText("")
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
                {!showSearchInput && (
                    <Image
                        className={"md:h-[24px] h-[20px] cursor-pointer"}
                        src={logoImage}
                        alt={"logo"}
                        onClick={() => {
                            router.push(`/?${nextQueryParams.toString()}`)
                        }}
                    />
                )}
                {/*selectedTab === "single" && (
                    <Button
                        variant="light"
                        className={"absolute right-[0px] p-[20px] text-white"}
                        startContent={
                            <FontAwesomeIcon
                                className={"h-[20px]"}
                                icon={faPlus}
                            />
                        }
                    />
                )*/}
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
                slidesPerView={"auto"}
                //modules={[Pagination]}
                className={bottom()}
                navigation={true}
            >
                {menus.map((menu: HeaderMenu, index) => (
                    <SwiperSlide
                        key={`view-header-menu-${index}`}
                        className="pl-3 pr-3"
                        onClick={() => {
                            setMenuIndexChangedByMenu(true)
                            setMenuIndex(index)
                        }}
                        style={{ width: "fit-content" }}
                    >
                        <div
                            className={`${
                                menuIndex === index
                                    ? "text-white"
                                    : "text-[#909090]"
                            } md:text-[15px] text-[13px] md:block flex items-center h-full`}
                        >
                            {menu.displayText}
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
            {/* {selectedTab === "home" && pinnedFeeds && (
                    <Tabs
                        aria-label="Options"
                        color="primary"
                        variant="underlined"
                        // items={["following", ...pinnedFeeds]}
                        selectedKey={selectedFeed}
                        onSelectionChange={handleHomeTopTabSelectionChange}
                        classNames={{
                            tabList:
                                "w-full relative rounded-none p-0 border-b border-divider",
                            cursor: "w-full bg-[#6A52FF]",
                            tab: "max-w-fit px-0 h-[100%]",
                            tabContent: "group-data-[selected=true]:text-white",
                        }}
                        style={{ marginLeft: "40px" }}
                    >
                        <Tab
                            key="following"
                            title={
                                <div className="flex items-center pl-[15px] pr-[15px]">
                                    <span>Following</span>
                                </div>
                            }
                        />
                        {pinnedFeeds.map((feed: any, index: number) => (
                            <Tab
                                key={feed.uri}
                                title={
                                    <div className="flex items-center pl-[15px] pr-[15px]">
                                        <span>{feed.displayName}</span>
                                    </div>
                                }
                            />
                        ))}
                    </Tabs>
                )}
                {selectedTab === "inbox" && (
                    <div className={HeaderContentTitle({ page: page })}>
                        Inbox
                    </div>
                )}
                {selectedTab === "post" && (
                    <Tabs
                        aria-label="Options"
                        color="primary"
                        variant="underlined"
                        classNames={{
                            tabList:
                                "w-full relative rounded-none p-0 border-b border-divider",
                            cursor: "w-full bg-[#6A52FF]",
                            tab: "max-w-fit px-0 h-[100%]",
                            tabContent: "group-data-[selected=true]:text-white",
                        }}
                    >
                        <Tab
                            key="1"
                            title={
                                <div className="flex items-center pl-[15px] pr-[15px] w-[50%]">
                                    <span>Author's</span>
                                </div>
                            }
                        />
                        <Tab
                            key="2"
                            title={
                                <div className="flex items-center pl-[15px] pr-[15px] w-[50%]">
                                    <span>Other's</span>
                                </div>
                            }
                        />
                    </Tabs>
                )}
                {selectedTab === "search" &&
                    (target ? (
                        <Tabs
                            aria-label="Options"
                            color="primary"
                            variant="underlined"
                            classNames={{
                                tabList:
                                    "w-full relative rounded-none p-0 border-b border-divider",
                                cursor: "w-full bg-[#6A52FF]",
                                tab: "max-w-fit px-0 h-[100%]",
                                tabContent:
                                    "group-data-[selected=true]:text-white",
                            }}
                            onSelectionChange={(e) => {
                                router.push(
                                    `/search?word=${encodeURIComponent(
                                        searchText
                                    )}&target=${e}`
                                )
                            }}
                            selectedKey={searchParams.get("target") || "posts"}
                        >
                            <Tab
                                key="posts"
                                title={
                                    <div className="flex items-center pl-[15px] pr-[15px] w-[50%]">
                                        <span>Posts</span>
                                    </div>
                                }
                            />
                            <Tab
                                key="feeds"
                                title={
                                    <div className="flex items-center pl-[15px] pr-[15px] w-[50%]">
                                        <span>Feeds</span>
                                    </div>
                                }
                            />
                            <Tab
                                key="users"
                                title={
                                    <div className="flex items-center pl-[15px] pr-[15px] w-[50%]">
                                        <span>Users</span>
                                    </div>
                                }
                            />
                        </Tabs>
                    ) : (
                        <div>Search</div>
                    ))}
                {selectedTab === "profile" && (
                    <Tabs
                        aria-label="Options"
                        color="primary"
                        variant="underlined"
                        classNames={{
                            tabList:
                                "w-full relative rounded-none p-0 border-b border-divider",
                            cursor: "w-full bg-[#6A52FF]",
                            tab: "max-w-fit px-0 h-[100%]",
                            tabContent: "group-data-[selected=true]:text-white",
                        }}
                    >
                        <Tab
                            key="1"
                            title={
                                <div className="flex items-center pl-[15px] pr-[15px] w-[50%]">
                                    <span>Posts</span>
                                </div>
                            }
                        />
                        <Tab
                            key="2"
                            title={
                                <div className="flex items-center pl-[15px] pr-[15px] w-[50%]">
                                    <span>Replies</span>
                                </div>
                            }
                        />
                        <Tab
                            key="3"
                            title={
                                <div className="flex items-center pl-[15px] pr-[15px] w-[50%]">
                                    <span>Media</span>
                                </div>
                            }
                        />
                        <Tab
                            key="4"
                            title={
                                <div className="flex items-center pl-[15px] pr-[15px] w-[50%]">
                                    <span>Feeds</span>
                                </div>
                            }
                        />
                    </Tabs>
                )} */}
            {/* </ScrollShadow> */}
        </main>
    )
}

export default ViewHeader
