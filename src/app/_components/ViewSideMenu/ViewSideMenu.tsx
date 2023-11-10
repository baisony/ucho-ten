import React, { useEffect, useState } from "react"
import { viewSideMenu } from "./styles"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faBookmark,
    faCircleCheck,
    faGear,
    faHome,
    faInbox,
    faMagnifyingGlass,
    faPenToSquare,
} from "@fortawesome/free-solid-svg-icons"
import defaultIcon from "@/../public/images/icon/default_icon.svg"
import "react-circular-progressbar/dist/styles.css"
import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Spinner,
    useDisclosure,
} from "@nextui-org/react"
import { useRouter } from "next/navigation"
import { useAgent } from "@/app/_atoms/agent"
import { useUserProfileDetailedAtom } from "@/app/_atoms/userProfileDetail"
import {
    useAccounts,
    UserAccount,
    UserAccountByDid,
} from "@/app/_atoms/accounts"
import { BskyAgent } from "@atproto/api"
import { useNextQueryParamsAtom } from "@/app/_atoms/nextQueryParams"
import { useTranslation } from "react-i18next"
import Link from "next/link"
import logoImage from "../../../../public/images/logo/ucho-ten.svg"

interface Props {
    className?: string
}

export const ViewSideMenu: React.FC<Props> = (props: Props) => {
    const router = useRouter()
    const [accounts] = useAccounts()
    const userList = Object.entries(accounts).map(([key, value]) => ({
        key,
        value,
    }))
    const [userProfileDetailed] = useUserProfileDetailedAtom()
    const [openModalReason, setOpenModalReason] = useState<
        "switching" | "logout" | "relogin" | ""
    >("")
    const [categorization, setCategorization] = useState<{
        [key: string]: UserAccount[]
    }>({})
    const [isSwitching, setIsSwitching] = useState(false)
    const [authenticationRequired, setAuthenticationRequired] = useState<
        boolean | null
    >(null)
    const [selectedAccountInfo, setSelectedAccountInfo] = useState<any>(null)
    const { t } = useTranslation()
    const [agent, setAgent] = useAgent()
    const [nextQueryParams] = useNextQueryParamsAtom()
    const [server, setServer] = useState<string>("")
    const [identity, setIdentity] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [isLogging, setIsLogging] = useState<boolean>(false)
    const [loginError, setLoginError] = useState<boolean>(false)

    const { isOpen, onOpen, onOpenChange } = useDisclosure()

    const handleDeleteSession = () => {
        console.log("delete session")
        localStorage.removeItem("session")
        router.push("/login")
    }
    useEffect(() => {
        console.log(userList)
        const serviceData: { [key: string]: any[] } = {}

        userList.forEach((item) => {
            const service: string = item.value.service as any

            if (service !== undefined) {
                if (!serviceData[service]) {
                    serviceData[service] = []
                }

                serviceData[service].push(item.value)
            }
        })

        console.log(serviceData)
        setCategorization(serviceData)
        Object.entries(serviceData).forEach(([key, value]) => {
            console.log(key, value)
        })
    }, [accounts])

    const handleRelogin = async () => {
        if (server === "" || identity === "" || password === "") return
        try {
            setIsSwitching(true)
            setLoginError(false)
            setAuthenticationRequired(false)
            setIsLogging(true)
            let result = server.replace(/(http:\/\/|https:\/\/)/g, "")
            result = result.replace(/\/$/, "")
            const agent = new BskyAgent({
                service: `https://${result}`,
            })
            await agent.login({
                identifier: identity,
                password: password,
            })
            if (agent.session) {
                const json = {
                    server: server,
                    session: agent.session,
                }
                localStorage.setItem("session", JSON.stringify(json))
                const storedData = localStorage.getItem("Accounts")
                const existingAccountsData: UserAccountByDid = storedData
                    ? JSON.parse(storedData)
                    : {}

                const { data } = await agent.getProfile({
                    actor: agent.session.did,
                })
                existingAccountsData[agent.session.did] = {
                    service: server,
                    session: agent.session,
                    profile: {
                        did: agent.session.did,
                        displayName: data?.displayName || agent.session.handle,
                        handle: agent.session.handle,
                        avatar: data?.avatar || "",
                    },
                }

                localStorage.setItem(
                    "Accounts",
                    JSON.stringify(existingAccountsData)
                )
            }
            setIsLogging(false)
            setIsSwitching(false)
            window.location.reload()
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.log(e.message)
                setIsLogging(false)
                setIsSwitching(false)
                setLoginError(true)
            }
        }
    }

    const AccountComponent = () => {
        return (
            <>
                {Object.entries(categorization).map(([key, value]) => (
                    <div key={key} className={"select-none"}>
                        {key}
                        {value.map((item: UserAccount) => (
                            <div
                                key={item.profile.did}
                                className={
                                    "justify-between flex items-center w-full cursor-pointer"
                                }
                                onClick={async () => {
                                    if (
                                        item.session.did === agent?.session?.did
                                    )
                                        return
                                    try {
                                        setIsSwitching(true)
                                        setAuthenticationRequired(false)
                                        setSelectedAccountInfo(item)
                                        const { session } = item
                                        const agent = new BskyAgent({
                                            service: `https://${key}`,
                                        })
                                        await agent.resumeSession(session)
                                        setAgent(agent)
                                        const json = {
                                            server: key,
                                            session: session,
                                        }
                                        localStorage.setItem(
                                            "session",
                                            JSON.stringify(json)
                                        )
                                        setIsSwitching(false)
                                        window.location.reload()
                                    } catch (e: unknown) {
                                        if (e instanceof Error) {
                                            if (
                                                e.message.includes(
                                                    "Authentication"
                                                )
                                            ) {
                                                setIsSwitching(false)
                                                setAuthenticationRequired(true)
                                            }
                                        }
                                    }
                                }}
                            >
                                <div className={"flex items-center mb-[10px]"}>
                                    <div
                                        className={
                                            "w-[50px] h-[50px] rounded-full overflow-hidden"
                                        }
                                    >
                                        <img
                                            src={
                                                item?.profile?.avatar ||
                                                defaultIcon.src
                                            }
                                            className={"h-full w-full"}
                                            alt={"avatar"}
                                        />
                                    </div>
                                    <div className={"ml-[15px]"}>
                                        <div>{item.profile.displayName}</div>
                                        <div
                                            className={
                                                "text-default-400 text-sm"
                                            }
                                        >
                                            @{item.profile.handle}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    {agent?.session?.did ===
                                    item.profile.did ? (
                                        <div>
                                            <FontAwesomeIcon
                                                icon={faCircleCheck}
                                                className={"text-[#00D315]"}
                                            />
                                        </div>
                                    ) : isSwitching &&
                                      item.profile.did ===
                                          selectedAccountInfo.profile.did ? (
                                        <Spinner />
                                    ) : (
                                        authenticationRequired &&
                                        item.profile.did ===
                                            selectedAccountInfo.profile.did && (
                                            <span className={"text-[#FF0000]"}>
                                                <Button
                                                    onClick={() => {
                                                        setServer(key)
                                                        setIdentity(
                                                            item.profile.handle
                                                        )
                                                        setOpenModalReason(
                                                            "relogin"
                                                        )
                                                    }}
                                                >
                                                    {t(
                                                        "components.ViewSideBar.needLogin"
                                                    )}
                                                </Button>
                                            </span>
                                        )
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
                <div
                    className={
                        "h-[50px] w-full select-none flex justify-center items-center cursor-pointer"
                    }
                    onClick={() => {
                        setSelectedAccountInfo(null)
                        setOpenModalReason("relogin")
                    }}
                >
                    {t("components.ViewSideBar.addAccount")}
                </div>
            </>
        )
    }
    return (
        <div className={"flex justify-end items-end"}>
            <div
                className={
                    "mr-[30px] mt-[25px] text-[16px] text-[#BABABA] dark:text-[#787878]"
                }
            >
                <div className={"mb-[50px] cursor-pointer"}>
                    <Link href={"/"}>
                        <img
                            className={"h-[24px]"}
                            src={logoImage.src}
                            alt={"logo"}
                        />
                    </Link>
                </div>
                <Link
                    className={
                        "mb-[15px] cursor-pointer flex hover:text-[#FFFFFF] dark:hover:text-[#FFFFFF]"
                    }
                    href={"/"}
                >
                    <div className={"mr-[10px]"}>
                        <FontAwesomeIcon icon={faHome} />
                    </div>
                    Home
                </Link>
                <Link
                    className={
                        "mb-[15px] cursor-pointer flex hover:text-[#FFFFFF] dark:hover:text-[#FFFFFF]"
                    }
                    href={"/bookmarks"}
                >
                    <div className={"mr-[10px]"}>
                        <FontAwesomeIcon icon={faBookmark} />
                    </div>
                    Bookmark
                </Link>
                <Link
                    className={
                        "mb-[15px] cursor-pointer flex hover:text-[#FFFFFF] dark:hover:text-[#FFFFFF]"
                    }
                    href={"/inbox"}
                >
                    <div className={"mr-[10px]"}>
                        <FontAwesomeIcon icon={faInbox} />
                    </div>
                    Inbox
                </Link>
                <Link
                    className={
                        "mb-[15px] cursor-pointer flex hover:text-[#FFFFFF] dark:hover:text-[#FFFFFF]"
                    }
                    href={"/search"}
                >
                    <div className={"mr-[10px]"}>
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                    </div>
                    Search
                </Link>
                <Link
                    className={
                        "mb-[15px] cursor-pointer flex hover:text-[#FFFFFF] dark:hover:text-[#FFFFFF]"
                    }
                    href={"/post"}
                >
                    <div className={"mr-[10px]"}>
                        <FontAwesomeIcon icon={faPenToSquare} />
                    </div>
                    Post
                </Link>
                <Link
                    href={"/settings"}
                    className={
                        "mb-[15px] cursor-pointer flex hover:text-[#FFFFFF] dark:hover:text-[#FFFFFF]"
                    }
                >
                    <div className={"mr-[10px]"}>
                        <FontAwesomeIcon icon={faGear} />
                    </div>
                    Settings
                </Link>
                <Dropdown>
                    <DropdownTrigger>
                        <div
                            className={
                                "w-full flex cursor-pointer hover:text-[#FFFFFF] dark:hover:text-[#FFFFFF]"
                            }
                        >
                            <img
                                src={userProfileDetailed?.avatar}
                                className={
                                    "h-[20px] w-[20px] rounded-full overflow-hidden mr-[10px]"
                                }
                            />
                            <div className={"text-[14px]"}>
                                {userProfileDetailed?.displayName}
                            </div>
                        </div>
                    </DropdownTrigger>
                    <DropdownMenu
                        className={"text-black dark:text-white"}
                        aria-label={"dropdown-menu"}
                        onAction={(key) => {
                            switch (key) {
                                case "about":
                                    console.log("hoge")
                                    break
                                case "bugreport":
                                    console.log("hoge")
                                    break
                                case "switchaccount":
                                    console.log("hoge")
                                    break
                            }
                        }}
                    >
                        <DropdownItem key="new">
                            <a
                                href={"https://github.com/baisony/ucho-ten"}
                                target={"_blank"}
                                rel={"noreferrer"}
                            >
                                About Ucho-ten
                            </a>
                        </DropdownItem>
                        <DropdownItem key="copy">
                            <a
                                href={
                                    process.env.NEXT_PUBLIC_BUG_REPORT_PAGE ||
                                    "https://google.com"
                                }
                                target={"_blank"}
                                rel={"noreferrer"}
                            >
                                Bug Report
                            </a>
                        </DropdownItem>
                        <DropdownItem key="edit">Switch Account</DropdownItem>
                        <DropdownItem
                            key="delete"
                            className="text-danger"
                            color="danger"
                        >
                            Logout
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>
        </div>
    )
}
