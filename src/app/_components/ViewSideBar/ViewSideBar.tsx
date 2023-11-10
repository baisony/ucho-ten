import React, { useEffect, useState } from "react"
import { viewSideBar } from "./styles"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faBookmark,
    faCircleQuestion,
    faFlag,
    faGear,
    faHand,
    faRightFromBracket,
    faRss,
    faUser,
    faUsers,
    faVolumeXmark,
} from "@fortawesome/free-solid-svg-icons"
import defaultIcon from "@/../public/images/icon/default_icon.svg"
import "react-circular-progressbar/dist/styles.css"
import { useDisclosure } from "@nextui-org/react"
import { useRouter } from "next/navigation"
import { useAgent } from "@/app/_atoms/agent"
import { useUserProfileDetailedAtom } from "@/app/_atoms/userProfileDetail"
import { UserAccountByDid, useAccounts } from "@/app/_atoms/accounts"
import { BskyAgent } from "@atproto/api"
import { useNextQueryParamsAtom } from "@/app/_atoms/nextQueryParams"
import { useTranslation } from "react-i18next"
import Link from "next/link"
import SignInModal from "../SignInModal"
import SignOutModal from "../SignOutModal"
import AccountSwitchModal from "../AccountSwitchModal"

interface Props {
    className?: string
    isMobile?: boolean
    isDragActive?: boolean
    open?: boolean
    isSideBarOpen: boolean
    openSideBar: (isOpen: boolean) => void
}

const ViewSideBar = ({ isMobile, openSideBar }: Props) => {
    const router = useRouter()

    const { t } = useTranslation()

    const [agent] = useAgent()
    const [userProfileDetailed] = useUserProfileDetailedAtom()

    // const [openModalReason, setOpenModalReason] = useState<
    //     "switching" | "logout" | "relogin" | ""
    // >("")

    const signInModalDisclosure = useDisclosure({ id: "sign_in" })
    const accountSwitchModalDisclosure = useDisclosure({ id: "account_switch" })
    const signOutModalDisclosure = useDisclosure({ id: "sign_out" })

    // const [authenticationRequired, setAuthenticationRequired] = useState<
    //     boolean | null
    // >(null)
    // const [selectedAccountInfo, setSelectedAccountInfo] = useState<any>(null)
    // const [agent, setAgent] = useAgent()
    const [nextQueryParams] = useNextQueryParamsAtom()

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

    return (
        <div>
            <SignInModal
                isOpen={signInModalDisclosure.isOpen}
                onOpenChange={signInModalDisclosure.onOpenChange}
                //handleSideBarOpen={openSideBar}
                //handleDeleteSession={handleDeleteSession}
            />
            {/* <SignOutModal /> */}
            <AccountSwitchModal
                isOpen={accountSwitchModalDisclosure.isOpen}
                onOpenChange={accountSwitchModalDisclosure.onOpenChange}
                handleClickAddAccount={() => {
                    signInModalDisclosure.onOpen()
                }}
            />
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
                        openSideBar(false)
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
                            openSideBar(false)
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
                            openSideBar(false)
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
                            openSideBar(false)
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
                            openSideBar(false)
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
                            openSideBar(false)
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
                            openSideBar(false)
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
                            openSideBar(false)
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
                            openSideBar(false)
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
                            openSideBar(false)
                            // setOpenModalReason("switching")
                            accountSwitchModalDisclosure.onOpen()
                            // onOpen()
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
                                    openSideBar(false)
                                    handleDeleteSession()
                                    router.push("/login")
                                }
                            } else {
                                // setOpenModalReason("logout")
                                // onOpen()
                                signOutModalDisclosure.onOpen()
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
