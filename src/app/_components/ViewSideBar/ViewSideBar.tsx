import React, { useEffect, useState } from "react"
import { viewSideBar } from "./styles"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faAt,
    faBookmark,
    faCircleCheck,
    faCircleQuestion,
    faFlag,
    faGear,
    faHand,
    faLock,
    faRightFromBracket,
    faRss,
    faUser,
    faUsers,
    faVolumeXmark,
} from "@fortawesome/free-solid-svg-icons"
import defaultIcon from "@/../public/images/icon/default_icon.svg"
import "react-circular-progressbar/dist/styles.css"
import {
    Button,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
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

interface Props {
    className?: string
    isMobile?: boolean
    isDragActive?: boolean
    open?: boolean
    isSideBarOpen: boolean
    setSideBarOpen: (isOpen: boolean) => void
}

const ViewSideBar = ({ isMobile, setSideBarOpen }: Props) => {
    const router = useRouter()

    const { t } = useTranslation()

    const [agent, setAgent] = useAgent()
    const [userProfileDetailed] = useUserProfileDetailedAtom()

    const [openModalReason, setOpenModalReason] = useState<
        "switching" | "logout" | "relogin" | ""
    >("")

    const { isOpen, onOpen, onOpenChange } = useDisclosure()

    const [authenticationRequired, setAuthenticationRequired] = useState<
        boolean | null
    >(null)
    const [selectedAccountInfo, setSelectedAccountInfo] = useState<any>(null)
    // const [agent, setAgent] = useAgent()
    const [nextQueryParams] = useNextQueryParamsAtom()
    const [server, setServer] = useState<string>("")
    const [identity, setIdentity] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [isLogging, setIsLogging] = useState<boolean>(false)
    const [loginError, setLoginError] = useState<boolean>(false)
    const [isSwitching, setIsSwitching] = useState<boolean>(false)

    const handleDeleteSession = () => {
        console.log("delete session")
        localStorage.removeItem("session")
        router.push("/login")
    }

    const {
        background,
        AuthorIconContainer,
        Content,
        Footer,
        AuthorDisplayName,
        AuthorHandle,
        NavBarIcon,
        NavBarItem,
        appearanceTextColor,
    } = viewSideBar()

    const handleRelogin = async () => {
        if (server === "" || identity === "" || password === "") {
            return
        }

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

    return (
        <div>
            <main
                className={background()}
                onClick={(e) => {
                    e.stopPropagation()
                }}
            >
                <Link
                    className={AuthorIconContainer()}
                    onClick={() => {
                        if (!agent?.session) return
                        setSideBarOpen(false)
                    }}
                    href={`/profile/${agent?.session
                        ?.did}?${nextQueryParams.toString()}`}
                >
                    <div
                        className={
                            "h-[64px] w-[64px] rounded-[10px] overflow-hidden"
                        }
                    >
                        <img
                            className={"h-[64px] w-[64px] rounded-full"}
                            src={userProfileDetailed?.avatar || defaultIcon.src}
                            alt={"avatar"}
                        />
                    </div>
                    <div className={"ml-[12px]"}>
                        <div className={AuthorDisplayName()}>
                            {userProfileDetailed?.displayName ||
                                userProfileDetailed?.handle}
                        </div>
                        <div className={AuthorHandle()}>
                            @{userProfileDetailed?.handle}
                        </div>
                    </div>
                </Link>
                <div className={Content()}>
                    <Link
                        className={NavBarItem()}
                        onClick={() => {
                            setSideBarOpen(false)
                        }}
                        href={`/bookmarks?${nextQueryParams.toString()}`}
                    >
                        <FontAwesomeIcon
                            icon={faBookmark}
                            className={NavBarIcon()}
                        ></FontAwesomeIcon>
                        <div>{t("components.ViewSideBar.bookmark")}</div>
                    </Link>
                    <Link
                        className={NavBarItem()}
                        onClick={() => {
                            setSideBarOpen(false)
                        }}
                        href={`/settings#mute?${nextQueryParams.toString()}`}
                    >
                        <FontAwesomeIcon
                            icon={faVolumeXmark}
                            className={NavBarIcon()}
                        ></FontAwesomeIcon>
                        <div>{t("components.ViewSideBar.mute")}</div>
                    </Link>
                    <Link
                        className={NavBarItem()}
                        onClick={() => {
                            setSideBarOpen(false)
                        }}
                        href={`/feeds?${nextQueryParams.toString()}`}
                    >
                        <FontAwesomeIcon
                            icon={faRss}
                            className={NavBarIcon()}
                        ></FontAwesomeIcon>
                        <div>{t("components.ViewSideBar.feeds")}</div>
                    </Link>
                    <Link
                        className={NavBarItem()}
                        onClick={() => {
                            if (!agent?.session) return
                            setSideBarOpen(false)
                        }}
                        href={`/profile/${agent?.session
                            ?.did}?${nextQueryParams.toString()}`}
                    >
                        <FontAwesomeIcon
                            icon={faUser}
                            className={NavBarIcon()}
                        ></FontAwesomeIcon>
                        <div>profile</div>
                    </Link>
                    <Link
                        className={NavBarItem()}
                        onClick={() => {
                            setSideBarOpen(false)
                        }}
                        href={`/settings#filtering?${nextQueryParams.toString()}`}
                    >
                        <FontAwesomeIcon
                            icon={faHand}
                            className={NavBarIcon()}
                        ></FontAwesomeIcon>
                        <div>Contents Filtering</div>
                    </Link>
                    <Link
                        className={NavBarItem()}
                        onClick={() => {
                            setSideBarOpen(false)
                        }}
                        href={`/settings?${nextQueryParams.toString()}`}
                    >
                        <FontAwesomeIcon
                            icon={faGear}
                            className={NavBarIcon()}
                        ></FontAwesomeIcon>
                        <div>{t("components.ViewSideBar.preferences")}</div>
                    </Link>
                    <a
                        className={NavBarItem()}
                        href={
                            process.env.NEXT_PUBLIC_BUG_REPORT_PAGE ||
                            "https://google.com"
                        }
                        target={"_blank"}
                        rel="noopener noreferrer"
                        onClick={() => {
                            setSideBarOpen(false)
                        }}
                    >
                        <FontAwesomeIcon
                            icon={faFlag}
                            className={NavBarIcon()}
                        ></FontAwesomeIcon>
                        <div>{t("components.ViewSideBar.bugReport")}</div>
                    </a>
                </div>
                <div className={Footer()}>
                    <Link
                        className={NavBarItem()}
                        onClick={() => {
                            setSideBarOpen(false)
                        }}
                        href={`/about?${nextQueryParams.toString()}`}
                    >
                        <FontAwesomeIcon
                            icon={faCircleQuestion}
                            className={NavBarIcon()}
                        />
                        <div>{t("components.ViewSideBar.about")}</div>
                    </Link>
                    <div
                        className={NavBarItem()}
                        onClick={() => {
                            setSideBarOpen(false)
                            setOpenModalReason("switching")
                            onOpen()
                        }}
                    >
                        <FontAwesomeIcon
                            icon={faUsers}
                            className={NavBarIcon()}
                        ></FontAwesomeIcon>
                        <div>{t("components.ViewSideBar.SwitchAccount")}</div>
                    </div>
                    <div
                        className={NavBarItem()}
                        onClick={() => {
                            if (isMobile) {
                                const res = window.confirm(
                                    t(
                                        "components.ViewSideBar.logoutModal.description"
                                    )
                                )
                                if (res) {
                                    setSideBarOpen(false)
                                    handleDeleteSession()
                                    router.push("/login")
                                }
                            } else {
                                setOpenModalReason("logout")
                                onOpen()
                            }
                        }}
                    >
                        <FontAwesomeIcon
                            icon={faRightFromBracket}
                            className={NavBarIcon()}
                        ></FontAwesomeIcon>
                        <div>{t("components.ViewSideBar.logout")}</div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default ViewSideBar