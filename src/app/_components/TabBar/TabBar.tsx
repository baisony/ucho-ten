import React, { useState, useRef, useCallback, useEffect } from "react"
import { tabBar } from "./styles"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faImage, faTrashCan } from "@fortawesome/free-regular-svg-icons"
import {
    faHome,
    faSearch,
    faInbox,
    faPenToSquare,
} from "@fortawesome/free-solid-svg-icons"
import { Badge } from "@nextui-org/react"
import { usePathname, useRouter } from "next/navigation"
import { useAgent } from "@/app/_atoms/agent"
import { useNextQueryParamsAtom } from "@/app/_atoms/nextQueryParams"
import { TabQueryParamValue, isTabQueryParamValue } from "@/app/_types/types"
import Link from "next/link"

interface Props {
    className?: string
}

export const TabBar: React.FC<Props> = (props: Props) => {
    const [agent, setAgent] = useAgent()
    const router = useRouter()
    const pathname = usePathname()
    const [nextQueryParamsAtom] = useNextQueryParamsAtom()

    const { className } = props
    const reg =
        /^[\u0009-\u000d\u001c-\u0020\u11a3-\u11a7\u1680\u180e\u2000-\u200f\u202f\u205f\u2060\u3000\u3164\ufeff\u034f\u2028\u2029\u202a-\u202e\u2061-\u2063\ufeff]*$/
    const [unreadNotification, setUnreadNotification] = useState<number>(0)
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

        const tabQueryParam = nextQueryParamsAtom.get("f")

        if (isTabQueryParamValue(tabQueryParam)) {
            setHilightedTab(tabQueryParam)
            return
        }

        setHilightedTab("h")
    }, [pathname, nextQueryParamsAtom])

    const checkNewNotification = async () => {
        if (!agent) {
            return
        }
        try {
            const { data } = await agent.countUnreadNotifications()
            const notifications = await agent.listNotifications()
            const { count } = data
            const reason = ["mention", "reply"]
            let notify_num = 0
            for (let i = 0; i < data.count; i++) {
                const notificationReason =
                    notifications.data.notifications[i].reason
                if (reason.some((item) => notificationReason.includes(item))) {
                    notify_num++
                }
            }
            if (notify_num !== unreadNotification && unreadNotification === 0) {
                setUnreadNotification(count)
            }
        } catch (e) {
            console.log(e)
        }
    }
    const handleUpdateSeen = async () => {
        if (!agent) return
        try {
            const res = await agent.updateSeenNotifications()
            //console.log(res)
        } catch (e) {
            console.log(e)
        }
    }

    useEffect(() => {
        const interval = setInterval(() => {
            checkNewNotification()
        }, 10000)
        // クリーンアップ関数
        return () => {
            clearInterval(interval) // インターバルをクリーンアップ
        }
    }, [agent])

    return (
        <main className={TabBar()}>
            <Link
                className={Container({ selected: hilightedTab === "h" })}
                href={"/"}
            >
                <FontAwesomeIcon
                    icon={faHome}
                    className={Icon()}
                    style={{
                        color: hilightedTab === "h" ? "#62A8DC" : undefined,
                    }}
                />
            </Link>
            <Link
                className={Container({ selected: hilightedTab === "s" })}
                href={"/search"}
            >
                <FontAwesomeIcon
                    icon={faSearch}
                    className={Icon()}
                    style={{
                        color: hilightedTab === "s" ? "#62A8DC" : undefined,
                    }}
                />
            </Link>
            <Link
                className={Container({ selected: hilightedTab === "i" })}
                onClick={() => {
                    //setSelectedTab("inbox")
                    //props.setValue("inbox")
                    handleUpdateSeen()
                    setUnreadNotification(0)
                }}
                href={"/inbox"}
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
            </Link>
            <Link
                className={Container({ selected: hilightedTab === "p" })}
                href={"/post"}
            >
                <FontAwesomeIcon
                    icon={faPenToSquare}
                    className={Icon({
                        selected: hilightedTab === "p",
                    })}
                />
            </Link>
        </main>
    )
}

export default TabBar
