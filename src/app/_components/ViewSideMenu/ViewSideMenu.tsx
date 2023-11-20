import React, { useState } from "react"
// import { viewSideMenu } from "./styles"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faBookmark,
    faCircleInfo,
    faFlag,
    faGear,
    faHome,
    faInbox,
    faMagnifyingGlass,
    faPenToSquare,
    faRightFromBracket,
    faRss,
    faUser,
    faUsers,
} from "@fortawesome/free-solid-svg-icons"
import "react-circular-progressbar/dist/styles.css"
import {
    Badge,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
    useDisclosure,
} from "@nextui-org/react"
// import { useRouter } from "next/navigation"
import { useUserProfileDetailedAtom } from "@/app/_atoms/userProfileDetail"
import { UserAccount } from "@/app/_atoms/accounts"
// import { useNextQueryParamsAtom } from "@/app/_atoms/nextQueryParams"
// import { useTranslation } from "react-i18next"
import Link from "next/link"
import logoImage from "../../../../public/images/logo/ucho-ten.svg"
import SignInModal from "../SignInModal"
import SignOutModal from "../SignOutModal"
import AccountSwitchModal from "../AccountSwitchModal"
import { useTranslation } from "react-i18next"
import { useRouter } from "next/navigation"
import { useUnreadNotificationAtom } from "@/app/_atoms/unreadNotifications"
import { useAgent } from "@/app/_atoms/agent"

interface Props {
    className?: string
}

export const ViewSideMenu: React.FC<Props> = (props: Props) => {
    const [userProfileDetailed] = useUserProfileDetailedAtom()
    const router = useRouter()
    const [agent] = useAgent()
    const { t } = useTranslation()
    const signInModalDisclosure = useDisclosure({ id: "sign_in" })
    const accountSwitchModalDisclosure = useDisclosure({ id: "account_switch" })
    const signOutModalDisclosure = useDisclosure({ id: "sign_out" })

    const [selectedAccount, setSelectedAccount] = useState<UserAccount | null>(
        null
    )

    const [unreadNotification, setUnreadNotification] =
        useUnreadNotificationAtom()

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
                    {t("components.ViewSideMenu.home")}
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
                    {t("components.ViewSideMenu.bookmark")}
                </Link>
                <Link
                    className={
                        "mb-[15px] cursor-pointer flex hover:text-[#FFFFFF] dark:hover:text-[#FFFFFF]"
                    }
                    href={"/inbox"}
                >
                    <div className={"mr-[10px]"}>
                        <Badge
                            content={""}
                            color={"primary"}
                            size={"sm"}
                            isInvisible={unreadNotification == 0}
                        >
                            <FontAwesomeIcon icon={faInbox} />
                        </Badge>
                    </div>
                    {t("components.ViewSideMenu.inbox")}
                </Link>
                <Link
                    className={
                        "mb-[15px] cursor-pointer flex hover:text-[#FFFFFF] dark:hover:text-[#FFFFFF]"
                    }
                    href={"/feeds"}
                >
                    <div className={"mr-[10px]"}>
                        <FontAwesomeIcon icon={faRss} />
                    </div>
                    {t("components.ViewSideMenu.feed")}
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
                    {t("components.ViewSideMenu.search")}
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
                    {t("components.ViewSideMenu.post")}
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
                    {t("components.ViewSideMenu.settings")}
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
                                    break
                                case "bug_report":
                                    break
                                case "switch_account":
                                    accountSwitchModalDisclosure.onOpen()
                                    break
                                case "log_out":
                                    signOutModalDisclosure.onOpen()
                                    break
                                case "profile":
                                    router.push(
                                        `/profile/${userProfileDetailed?.did}`
                                    )
                            }
                        }}
                    >
                        <DropdownSection showDivider>
                            <DropdownItem
                                key="profile"
                                startContent={<FontAwesomeIcon icon={faUser} />}
                            >
                                {t("components.ViewSideMenu.profile")}
                            </DropdownItem>
                            <DropdownItem
                                key="switch_account"
                                startContent={
                                    <FontAwesomeIcon icon={faUsers} />
                                }
                            >
                                {t("components.ViewSideMenu.switchAccount")}
                            </DropdownItem>
                        </DropdownSection>
                        <DropdownSection showDivider>
                            <DropdownItem
                                key="about"
                                startContent={
                                    <FontAwesomeIcon icon={faCircleInfo} />
                                }
                            >
                                <a
                                    href={"https://github.com/baisony/ucho-ten"}
                                    target={"_blank"}
                                    rel={"noreferrer"}
                                >
                                    {t("components.ViewSideMenu.about")}
                                </a>
                            </DropdownItem>
                            <DropdownItem
                                key="bug_report"
                                startContent={<FontAwesomeIcon icon={faFlag} />}
                            >
                                <a
                                    href={
                                        process.env
                                            .NEXT_PUBLIC_BUG_REPORT_PAGE ||
                                        "https://google.com"
                                    }
                                    target={"_blank"}
                                    rel={"noreferrer"}
                                >
                                    {t("components.ViewSideMenu.bugreport")}
                                </a>
                            </DropdownItem>
                        </DropdownSection>
                        <DropdownItem
                            key="log_out"
                            className="text-danger"
                            color="danger"
                            startContent={
                                <FontAwesomeIcon icon={faRightFromBracket} />
                            }
                        >
                            {t("components.ViewSideMenu.logout")}
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>

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
        </div>
    )
}
