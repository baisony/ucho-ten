import React, { useState, useRef, useCallback, useEffect } from "react"
import { verticalTabBar } from "./styles"
import { BrowserView, MobileView, isMobile } from "react-device-detect"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
// import { faImage, faTrashCan } from "@fortawesome/free-regular-svg-icons"
import {
    faHome,
    faSearch,
    faInbox,
    faPenToSquare,
    faCircle,
} from "@fortawesome/free-solid-svg-icons"
import { Badge } from "@nextui-org/react"
import { useRouter } from "next/navigation"
import { useAgent } from "@/app/_atoms/agent"

interface Props {
    color: "light" | "dark"
    isMobile?: boolean
    selected: string
}

export const VerticalTabBar: React.FC<Props> = (props: Props) => {
    const { color, isMobile, selected } = props

    const route = useRouter()

    const [agent] = useAgent()

    // const reg =
    //     /^[\u0009-\u000d\u001c-\u0020\u11a3-\u11a7\u1680\u180e\u2000-\u200f\u202f\u205f\u2060\u3000\u3164\ufeff\u034f\u2028\u2029\u202a-\u202e\u2061-\u2063\ufeff]*$/

    const [selectedTab, setSelectedTab] = useState<string>(selected)
    const [unreadNotification, setUnreadNotification] = useState<number>(0)

    const { TabBar, Container, Icon, IconBackground } = verticalTabBar()

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

        return () => {
            clearInterval(interval)
        }
    }, [agent])

    return (
        <main className="">
            <div
                className={Container({ selected: selectedTab === "home" })}
                onClick={() => {
                    route.push("/")
                    setSelectedTab("home")
                }}
            >
                <FontAwesomeIcon
                    icon={faHome}
                    mask={faCircle}
                    size="6x"
                    className={Icon({ color: color, selected: selectedTab })}
                    style={{
                        color: selectedTab === "home" ? "#62A8DC" : undefined,
                    }}
                />
            </div>
            <div
                className={Container({ selected: selectedTab === "search" })}
                onClick={() => {
                    route.push("/search")
                    setSelectedTab("search")
                }}
            >
                <FontAwesomeIcon
                    icon={faSearch}
                    mask={faCircle}
                    size="6x"
                    className={Icon({ color: color, selected: selectedTab })}
                    style={{
                        color: selectedTab === "search" ? "#62A8DC" : undefined,
                    }}
                />
            </div>
            <div
                className={Container({ selected: selectedTab === "inbox" })}
                onClick={() => {
                    route.push("/inbox")
                    setSelectedTab("inbox")
                    handleUpdateSeen()
                    setUnreadNotification(0)
                }}
            >
                <Badge
                    content={""}
                    color={"primary"}
                    isInvisible={unreadNotification == 0}
                >
                    <FontAwesomeIcon
                        icon={faInbox}
                        mask={faCircle}
                        size="6x"
                        className={Icon({
                            color: color,
                            selected: selectedTab,
                        })}
                        style={{
                            color:
                                selectedTab === "inbox" ? "#62A8DC" : undefined,
                        }}
                    />
                </Badge>
            </div>
            <div
                className={Container({ selected: selectedTab === "post" })}
                onClick={() => {
                    route.push("/post")
                    setSelectedTab("post")
                }}
            >
                <span className="fa-layers fa-fw">
                    <FontAwesomeIcon
                        icon={faPenToSquare}
                        className={Icon({
                            color: color,
                            selected: selectedTab,
                        })}
                    />
                    <FontAwesomeIcon
                        icon={faCircle}
                        className={IconBackground({
                            color: color,
                            selected: selectedTab,
                        })}
                    />
                    <FontAwesomeIcon
                        icon={faPenToSquare}
                        className={Icon({
                            color: color,
                            selected: selectedTab,
                        })}
                    />
                </span>
            </div>
        </main>
    )
}

export default VerticalTabBar
