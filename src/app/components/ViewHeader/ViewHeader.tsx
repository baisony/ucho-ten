import React, { useState, useEffect, Key, useRef } from "react"
import Image from "next/image"
import { viewHeader } from "./styles"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faPlus,
    faChevronLeft,
    faBars,
    faXmark,
} from "@fortawesome/free-solid-svg-icons"
import "react-circular-progressbar/dist/styles.css"
import { Button, ScrollShadow, menu } from "@nextui-org/react"
// import { Tabs, Tab, Chip } from "@nextui-org/react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
// import { useAgent } from "@/app/_atoms/agent"
// import { useFeedGeneratorsAtom } from "@/app/_atoms/feedGenerators"
// import { useUserPreferencesAtom } from "@/app/_atoms/preferences"
import Slider, { Settings } from "react-slick"

import logoImage from "@/../public/images/logo/ucho-ten.svg"

import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import { HeaderMenu } from "@/app/_atoms/headerMenu"

interface Props {
    className?: string
    color: "light" | "dark"
    isMobile?: boolean
    open?: boolean
    tab: string //"home" | "search" | "inbox" | "post"
    page: string // "profile" | "home" | "post" | "search"
    isNextPage?: boolean
    setSideBarOpen?: any
    selectedTab: string
    setSearchText?: any
    menuIndex: number
    menus: HeaderMenu[]
    onChangeMenuIndex: (index: number) => void
}

export const ViewHeader: React.FC<Props> = (props: Props) => {
    // const [agent] = useAgent()
    // const [userPreferences] = useUserPreferencesAtom()
    // const pathname = usePathname()
    const router = useRouter()
    // const [menus] = useHeaderMenusAtom()

    const {
        className,
        color,
        isMobile,
        open,
        tab,
        page,
        isNextPage,
        setSideBarOpen,
        selectedTab,
        menuIndex,
        onChangeMenuIndex,
        menus,
    } = props

    // const reg =
    //     /^[\u0009-\u000d\u001c-\u0020\u11a3-\u11a7\u1680\u180e\u2000-\u200f\u202f\u205f\u2060\u3000\u3164\ufeff\u034f\u2028\u2029\u202a-\u202e\u2061-\u2063\ufeff]*$/
    const searchParams = useSearchParams()
    const [searchText, setSearchText] = useState("")
    const target = searchParams.get("target")
    const [isSideBarOpen, setIsSideBarOpen] = useState<boolean>(false)
    const [isComposing, setComposing] = useState(false)

    const sliderRef = useRef<Slider>(null)

    const {
        Header,
        HeaderContentTitleContainer,
        HeaderContentTitle,
        top,
        bottom,
        HeaderInputArea,
    } = viewHeader()

    // const AppearanceColor = color

    const sliderSettings: Settings = {
        // centerMode: true,
        infinite: false,
        centerPadding: "0",
        // slidesToShow: 5,
        // speed: 500,
        // focusOnSelect: true,
        slidesToScroll: 1,
        variableWidth: true,
        arrows: false,
        focusOnSelect: true,
    }

    useEffect(() => {
        const search = searchParams.get("word")

        if (!search) {
            return
        }

        setSearchText(search)
    }, [])

    useEffect(() => {
        if (!sliderRef.current) {
            return
        }

        sliderRef.current.slickGoTo(menuIndex)
    }, [menuIndex])

    return (
        <main className={Header()}>
            <div className={top()}>
                <Button
                    className={"absolute left-[0px] p-[20px] text-white"}
                    variant="light"
                    startContent={
                        <FontAwesomeIcon
                            className={"h-[20px]"}
                            icon={isNextPage ? faChevronLeft : faBars}
                        />
                    }
                    onClick={() => {
                        setIsSideBarOpen(!isSideBarOpen)
                        //console.log(setValue)
                        props.setSideBarOpen(true)
                    }}
                />
                {selectedTab === "search" && (
                    <div
                        className={
                            "h-[40px] w-[60%] rounded-[10px] overflow-hidden relative"
                        }
                    >
                        <input
                            id={"searchBar"}
                            className={HeaderInputArea({ color: color })}
                            value={searchText}
                            autoFocus={true}
                            onChange={(e) => {
                                setSearchText(e.target.value)
                            }}
                            placeholder={"search word"}
                            onKeyDown={(e) => {
                                if (e.key !== "Enter" || isComposing) return //1
                                props.setSearchText(searchText)
                                document.getElementById("searchBar")?.blur()
                                router.push(
                                    `/search?word=${encodeURIComponent(
                                        searchText
                                    )}&target=${target}`
                                )
                            }}
                            onCompositionStart={() => setComposing(true)}
                            onCompositionEnd={() => setComposing(false)}
                        />
                        {searchText && searchText.length > 0 && (
                            <button
                                className={
                                    "absolute right-[8px] top-[8px] bg-black bg-opacity-30 rounded-full h-[25px] w-[25px] flex items-center justify-center"
                                }
                                onClick={() => {
                                    setSearchText("")
                                    props.setSearchText("")
                                }}
                            >
                                <FontAwesomeIcon
                                    className={"h-[20px]"}
                                    icon={faXmark}
                                />
                            </button>
                        )}
                    </div>
                )}
                {selectedTab !== "search" && (
                    <Image
                        className={"w-[145px] cursor-pointer"}
                        src={logoImage}
                        alt={"logo"}
                        onClick={() => {
                            router.push("/")
                        }}
                    />
                )}
                {selectedTab === "single" && (
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
                )}
            </div>
            {/* <ScrollShadow
                className={bottom({ page: page })}
                offset={100}
                // style={{ overflowX: "scroll", overflowY: "hidden" }}
                orientation="horizontal"
                hideScrollBar
            > */}
                <Slider ref={sliderRef} {...sliderSettings} className={bottom({ page: page })}>
                    {menus.map(
                            (menu: HeaderMenu, index) => (
                                <div
                                    key={`view-header-menu-${index}`}
                                    onClick={() => {
                                        onChangeMenuIndex(index)
                                    }}
                                >
                                    <div
                                        className={`flex items-center pl-[15px] pr-[15px] ${
                                            menuIndex === index
                                                ? "text-white"
                                                : "text-[#909090]"
                                        }`}
                                    >
                                        {menu.displayText}
                                    </div>
                                </div>
                            )
                        )}
                </Slider>
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
