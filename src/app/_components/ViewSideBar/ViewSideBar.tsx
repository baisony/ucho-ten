import { useState } from "react"
import { viewSideBar } from "./styles"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faBookmark,
    faCircleQuestion,
    faFlag,
    faGear,
    faRightFromBracket,
    faRss,
    faUser,
    faUsers,
    faVolumeXmark,
} from "@fortawesome/free-solid-svg-icons"
import defaultIcon from "@/../public/images/icon/default_icon.svg"
import { useDisclosure } from "@nextui-org/react"
import { useRouter } from "next/navigation"
import { useAgent } from "@/app/_atoms/agent"
import { useUserProfileDetailedAtom } from "@/app/_atoms/userProfileDetail"
import {
    useAccounts,
    UserAccount,
    UserAccountByDid,
} from "@/app/_atoms/accounts"
import { useNextQueryParamsAtom } from "@/app/_atoms/nextQueryParams"
import { useTranslation } from "react-i18next"
import Link from "next/link"
import SignInModal from "../SignInModal"
import SignOutModal from "../SignOutModal"
import AccountSwitchModal from "../AccountSwitchModal"
import { useZenMode } from "@/app/_atoms/zenMode"

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
    const [accounts, setAccounts] = useAccounts()

    const [selectedAccount, setSelectedAccount] = useState<UserAccount | null>(
        null
    )

    const signInModalDisclosure = useDisclosure({ id: "sign_in" })
    const accountSwitchModalDisclosure = useDisclosure({ id: "account_switch" })
    const signOutModalDisclosure = useDisclosure({ id: "sign_out" })

    const [nextQueryParams] = useNextQueryParamsAtom()
    const [zenMode] = useZenMode()

    const handleDeleteSession = () => {
        console.log("delete session")
        localStorage.removeItem("session")

        const existingAccountsData: UserAccountByDid = accounts

        if (!agent?.session?.did) {
            return
        }

        existingAccountsData[agent.session.did] = {
            ...(existingAccountsData[agent.session.did] || {}),
            session: undefined,
        }

        setAccounts(existingAccountsData)

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
        NavBarContainer,
        // appearanceTextColor,
    } = viewSideBar()

    return (
        <>
            <main
                className={background()}
                onClick={(e) => {
                    e.stopPropagation()
                }}
            >
                <div className={"w-full h-[env(safe-area-inset-top)]"} />
                <Link
                    className={AuthorIconContainer()}
                    onClick={() => {
                        if (!agent?.session) return
                        openSideBar(false)
                    }}
                    href={`/profile/${
                        agent?.session?.did
                    }?${nextQueryParams.toString()}`}
                >
                    <div
                        className={
                            "h-[64px] w-[64px] rounded-full overflow-hidden ml-[35px] mt-[15px]"
                        }
                    >
                        <img
                            className={"h-[64px] w-[64px] rounded-full"}
                            src={userProfileDetailed?.avatar || defaultIcon.src}
                            alt={"avatar"}
                            decoding={"async"}
                            loading={"eager"}
                            fetchPriority={"high"}
                        />
                    </div>
                    <div className={"ml-[35px]"}>
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
                        className={`${NavBarItem()} ${zenMode && `hidden`}`}
                        onClick={() => {
                            openSideBar(false)
                        }}
                        href={`/bookmarks?${nextQueryParams.toString()}`}
                    >
                        <div className={NavBarContainer()}>
                            <FontAwesomeIcon
                                icon={faBookmark}
                                className={NavBarIcon()}
                            />
                        </div>
                        <div>{t("components.ViewSideBar.bookmark")}</div>
                    </Link>
                    <Link
                        className={NavBarItem()}
                        onClick={() => {
                            openSideBar(false)
                        }}
                        href={`/settings#mute?${nextQueryParams.toString()}`}
                    >
                        <div className={NavBarContainer()}>
                            <FontAwesomeIcon
                                icon={faVolumeXmark}
                                className={NavBarIcon()}
                            />
                        </div>
                        <div>{t("components.ViewSideBar.mute")}</div>
                    </Link>
                    <Link
                        className={NavBarItem()}
                        onClick={() => {
                            openSideBar(false)
                        }}
                        href={`/feeds?${nextQueryParams.toString()}`}
                    >
                        <div className={NavBarContainer()}>
                            <FontAwesomeIcon
                                icon={faRss}
                                className={NavBarIcon()}
                            />
                        </div>
                        <div>{t("components.ViewSideBar.feeds")}</div>
                    </Link>
                    <Link
                        className={NavBarItem()}
                        onClick={() => {
                            if (!agent?.session) return
                            openSideBar(false)
                        }}
                        href={`/profile/${
                            agent?.session?.did
                        }?${nextQueryParams.toString()}`}
                    >
                        <div className={NavBarContainer()}>
                            <FontAwesomeIcon
                                icon={faUser}
                                className={NavBarIcon()}
                            />
                        </div>
                        <div>{t("components.ViewSideMenu.profile")}</div>
                    </Link>
                    <Link
                        className={NavBarItem()}
                        onClick={() => {
                            openSideBar(false)
                        }}
                        href={`/settings?${nextQueryParams.toString()}`}
                    >
                        <div className={NavBarContainer()}>
                            <FontAwesomeIcon
                                icon={faGear}
                                className={NavBarIcon()}
                            />
                        </div>
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
                        <div className={NavBarContainer()}>
                            <FontAwesomeIcon
                                icon={faFlag}
                                className={NavBarIcon()}
                            />
                        </div>
                        <div>{t("components.ViewSideBar.bugReport")}</div>
                    </a>
                </div>
                <div
                    className={
                        "ml-[35px] mr-[35px] border-t-[1px] border-[#E3E3E3]"
                    }
                />
                <div className={Footer()}>
                    <a
                        className={`${NavBarItem()} font-medium`}
                        onClick={() => {
                            openSideBar(false)
                        }}
                        href={`https://docs.ucho-ten.net/docs/%E6%A6%82%E8%A6%81/`}
                        target={"_blank"}
                        rel={"noopener noreferrer"}
                    >
                        <div className={NavBarContainer()}>
                            <FontAwesomeIcon
                                icon={faCircleQuestion}
                                className={NavBarIcon()}
                            />
                        </div>
                        <div>{t("components.ViewSideBar.about")}</div>
                    </a>
                    <div
                        className={`${NavBarItem()} font-medium`}
                        onClick={() => {
                            openSideBar(false)
                            accountSwitchModalDisclosure.onOpen()
                        }}
                    >
                        <div className={NavBarContainer()}>
                            <FontAwesomeIcon
                                icon={faUsers}
                                className={NavBarIcon()}
                            />
                        </div>
                        <div>{t("components.ViewSideBar.SwitchAccount")}</div>
                    </div>
                    <div
                        className={`${NavBarItem()} font-medium`}
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
                                openSideBar(false)
                                signOutModalDisclosure.onOpen()
                            }
                        }}
                    >
                        <div className={NavBarContainer()}>
                            <FontAwesomeIcon
                                icon={faRightFromBracket}
                                className={NavBarIcon()}
                            />
                        </div>
                        <div>{t("components.ViewSideBar.logout")}</div>
                    </div>
                </div>
                <div
                    className={
                        "ml-[35px] absolute bottom-[calc(20px+env(safe-area-inset-bottom))] text-[#f2f2f2] dark:text-[#D7D7D7] text-xs"
                    }
                >
                    <div className={"versionNumber"}>version: 1.0.4</div>
                    <div className={"codeName"}>code name: Nirvana</div>
                </div>
            </main>

            <SignInModal
                isOpen={signInModalDisclosure.isOpen}
                onOpenChange={signInModalDisclosure.onOpenChange}
                selectedAccount={selectedAccount}
                // handleSideBarOpen={openSideBar}
                //handleDeleteSession={handleDeleteSession}
            />
            <SignOutModal
                isOpen={signOutModalDisclosure.isOpen}
                onOpenChange={signOutModalDisclosure.onOpenChange}
                handleSideBarOpen={openSideBar}
            />
            <AccountSwitchModal
                isOpen={accountSwitchModalDisclosure.isOpen}
                onOpenChange={accountSwitchModalDisclosure.onOpenChange}
                handleClickAddAccount={() => {
                    setSelectedAccount(null)
                    signInModalDisclosure.onOpen()
                }}
                handleClickNeedLogin={(account: UserAccount) => {
                    setSelectedAccount(account)
                    signInModalDisclosure.onOpen()
                }}
            />
        </>
    )
}

export default ViewSideBar
