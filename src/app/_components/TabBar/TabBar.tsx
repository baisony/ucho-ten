import { useLayoutEffect } from "react"
import { tabBar } from "./styles"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faHome,
    faRss,
    faInbox,
    faPenToSquare,
    faSearch,
} from "@fortawesome/free-solid-svg-icons"
import { Badge } from "@nextui-org/react"
import { usePathname, useRouter } from "next/navigation"
import { useNextQueryParamsAtom } from "@/app/_atoms/nextQueryParams"
import { isTabQueryParamValue } from "@/app/_types/types"
import { useTappedTabbarButtonAtom } from "@/app/_atoms/tabbarButtonTapped"
import Image from "next/image"
import { useUnreadNotificationAtom } from "@/app/_atoms/unreadNotifications"
import { useHighlightedTab } from "@/app/_atoms/hightlightedTab"
import { useZenMode } from "@/app/_atoms/zenMode"

interface Props {
    className?: string
}

export const TabBar: React.FC<Props> = () => {
    const router = useRouter()
    const pathname = usePathname()

    const [nextQueryParams] = useNextQueryParamsAtom()
    const [tappedTabbarButton, setTappedTabbarButton] =
        useTappedTabbarButtonAtom()

    const [unreadNotification] = useUnreadNotificationAtom()
    const { TabBar, Container, Icon } = tabBar()
    const [highlightedTab, setHighLightedTab] = useHighlightedTab()
    const [zenMode] = useZenMode()

    useLayoutEffect(() => {
        switch (pathname) {
            case "/":
                setHighLightedTab("h")
                return
            case "/search":
                setHighLightedTab("s")
                return
            case "/u-tab":
                setHighLightedTab("u")
                return
            case "/inbox":
                setHighLightedTab("i")
                return
            case "/post":
                setHighLightedTab("p")
                return
        }

        const tabQueryParam = nextQueryParams.get("f")

        if (isTabQueryParamValue(tabQueryParam)) {
            setHighLightedTab(tabQueryParam)
            return
        }

        setHighLightedTab("h")
    }, [pathname, nextQueryParams])

    return (
        <main
            className={TabBar()}
            style={{
                paddingBottom: "env(safe-area-inset-bottom)",
            }}
        >
            <div
                className={Container({ selected: highlightedTab === "h" })}
                onClick={() => {
                    if (highlightedTab === "h" && tappedTabbarButton === null) {
                        setTappedTabbarButton("home")
                    } else {
                        setHighLightedTab("h")
                        router.push("/home")
                    }
                }}
            >
                <FontAwesomeIcon
                    icon={!zenMode || zenMode === undefined ? faHome : faRss}
                    className={Icon()}
                    style={{
                        color: highlightedTab === "h" ? "#62A8DC" : undefined,
                    }}
                />
            </div>
            <div
                className={Container({ selected: highlightedTab === "s" })}
                onClick={() => {
                    if (highlightedTab === "s" && tappedTabbarButton === null) {
                        setTappedTabbarButton("search")
                    } else {
                        setHighLightedTab("s")
                        router.push("/search")
                    }
                }}
            >
                <FontAwesomeIcon
                    icon={faSearch}
                    className={Icon()}
                    style={{
                        color: highlightedTab === "s" ? "#62A8DC" : undefined,
                    }}
                />
            </div>
            <div
                className={Container({ selected: highlightedTab === "u" })}
                onClick={() => {
                    if (highlightedTab === "u" && tappedTabbarButton === null) {
                        setTappedTabbarButton("utab")
                    } else {
                        setHighLightedTab("u")
                        router.push("/u-tab")
                    }
                }}
            >
                <div className={`w-[25px] h-[25px] hidden dark:inline-block`}>
                    <Image
                        src={
                            highlightedTab !== "u"
                                ? "/images/logo/ucho-ten_logo_white.svg"
                                : "/images/logo/ucho-ten_logo_blue-white.svg"
                        }
                        alt={"tab"}
                        height={25}
                        width={25}
                    />
                </div>
                <div className={`w-[25px] h-[25px] dark:hidden`}>
                    <Image
                        src={
                            highlightedTab !== "u"
                                ? "/images/logo/ucho-ten_logo_black.svg"
                                : "/images/logo/ucho-ten_logo_orange-black.svg"
                        }
                        alt={"tab"}
                        height={25}
                        width={25}
                    />
                </div>
            </div>
            <div
                className={`${Container({
                    selected: highlightedTab === "i",
                })} ${zenMode && `hidden`}`}
                onClick={() => {
                    if (highlightedTab === "i" && tappedTabbarButton === null) {
                        setTappedTabbarButton("inbox")
                    } else {
                        setHighLightedTab("i")
                        router.push("/inbox")
                    }
                    //setSelectedTab("inbox")
                    //props.setValue("inbox")
                }}
            >
                <Badge
                    content={""}
                    color={"primary"}
                    isInvisible={unreadNotification == 0}
                >
                    <FontAwesomeIcon
                        icon={faInbox}
                        className={Icon({
                            selected: highlightedTab === "i",
                        })}
                        style={{
                            color:
                                highlightedTab === "i" ? "#62A8DC" : undefined,
                        }}
                    />
                </Badge>
            </div>
            <div
                className={`${Container({
                    selected: highlightedTab === "p",
                })} ${zenMode && `hidden`}`}
                onClick={() => {
                    setHighLightedTab("p")
                    router.push("/post")
                    //setSelectedTab("post")
                    //props.setValue("post")
                }}
            >
                <FontAwesomeIcon
                    icon={faPenToSquare}
                    className={Icon({
                        selected: highlightedTab === "p",
                    })}
                />
            </div>
        </main>
    )
}

export default TabBar
