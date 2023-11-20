import React, { useEffect, useState } from "react"
import { tabBar } from "./styles"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faHome,
    faInbox,
    faPenToSquare,
    faSearch,
} from "@fortawesome/free-solid-svg-icons"
import { Badge } from "@nextui-org/react"
import { usePathname, useRouter } from "next/navigation"
import { useAgent } from "@/app/_atoms/agent"
import { useNextQueryParamsAtom } from "@/app/_atoms/nextQueryParams"
import { isTabQueryParamValue, TabQueryParamValue } from "@/app/_types/types"
import { useTappedTabbarButtonAtom } from "@/app/_atoms/tabbarButtonTapped"
import { useUnreadNotificationAtom } from "@/app/_atoms/unreadNotifications"

interface Props {
    className?: string
}

export const TabBar: React.FC<Props> = (props: Props) => {
    const router = useRouter()
    const pathname = usePathname()

    const [agent] = useAgent()
    const [nextQueryParams] = useNextQueryParamsAtom()
    const [tappedTabbarButton, setTappedTabbarButton] =
        useTappedTabbarButtonAtom()

    const { className } = props
    const [unreadNotification, setUnreadNotification] =
        useUnreadNotificationAtom()
    const { TabBar, Container, Icon } = tabBar()
    const [hilightedTab, setHilightedTab] = useState<TabQueryParamValue | "">(
        ""
    )

    useEffect(() => {
        switch (pathname) {
            case "/":
                setHilightedTab("h")
                return
            case "/search":
                setHilightedTab("s")
                return
            case "/inbox":
                setHilightedTab("i")
                return
            case "/post":
                setHilightedTab("p")
                return
        }

        const tabQueryParam = nextQueryParams.get("f")

        if (isTabQueryParamValue(tabQueryParam)) {
            setHilightedTab(tabQueryParam)
            return
        }

        setHilightedTab("h")
    }, [pathname, nextQueryParams])

    return (
        <main
            className={TabBar()}
            style={{
                paddingBottom: "env(safe-area-inset-bottom)",
            }}
        >
            <div
                className={Container({ selected: hilightedTab === "h" })}
                onClick={() => {
                    if (hilightedTab === "h" && tappedTabbarButton === null) {
                        setTappedTabbarButton("home")
                    } else {
                        setHilightedTab("h")
                        router.push("/")
                    }
                }}
            >
                <FontAwesomeIcon
                    icon={faHome}
                    className={Icon()}
                    style={{
                        color: hilightedTab === "h" ? "#62A8DC" : undefined,
                    }}
                />
            </div>
            <div
                className={Container({ selected: hilightedTab === "s" })}
                onClick={() => {
                    if (hilightedTab === "s" && tappedTabbarButton === null) {
                        setTappedTabbarButton("search")
                    } else {
                        setHilightedTab("s")
                        router.push("/search")
                    }
                }}
            >
                <FontAwesomeIcon
                    icon={faSearch}
                    className={Icon()}
                    style={{
                        color: hilightedTab === "s" ? "#62A8DC" : undefined,
                    }}
                />
            </div>
            <div
                className={Container({ selected: hilightedTab === "i" })}
                onClick={() => {
                    if (hilightedTab === "i" && tappedTabbarButton === null) {
                        setTappedTabbarButton("inbox")
                    } else {
                        setHilightedTab("i")
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
                            selected: hilightedTab === "i",
                        })}
                        style={{
                            color: hilightedTab === "i" ? "#62A8DC" : undefined,
                        }}
                    />
                </Badge>
            </div>
            <div
                className={Container({ selected: hilightedTab === "p" })}
                onClick={() => {
                    setHilightedTab("p")
                    router.push("/post")
                    //setSelectedTab("post")
                    //props.setValue("post")
                }}
            >
                <FontAwesomeIcon
                    icon={faPenToSquare}
                    className={Icon({
                        selected: hilightedTab === "p",
                    })}
                />
            </div>
        </main>
    )
}

export default TabBar
