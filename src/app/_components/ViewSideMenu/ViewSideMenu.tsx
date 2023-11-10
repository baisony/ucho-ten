import React, { useState } from "react"
// import { viewSideMenu } from "./styles"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faBookmark,
    faGear,
    faHome,
    faInbox,
    faMagnifyingGlass,
    faPenToSquare,
} from "@fortawesome/free-solid-svg-icons"
import defaultIcon from "@/../public/images/icon/default_icon.svg"
import "react-circular-progressbar/dist/styles.css"
import {
    Dropdown,
    DropdownItem,
    DropdownMenu,
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

interface Props {
    className?: string
}

export const ViewSideMenu: React.FC<Props> = (props: Props) => {
    // const { t } = useTranslation()
    // const router = useRouter()

    const [userProfileDetailed] = useUserProfileDetailedAtom()

    const signInModalDisclosure = useDisclosure({ id: "sign_in" })
    const accountSwitchModalDisclosure = useDisclosure({ id: "account_switch" })
    const signOutModalDisclosure = useDisclosure({ id: "sign_out" })

    const [selectedAccount, setSelectedAccount] = useState<UserAccount | null>(
        null
    )

    return (
        <div className={"flex justify-end items-end"}>
            <div
                className={
                    "mr-[30px] mt-[25px] text-[16px] text-[#BABABA] dark:text-[#787878]"
                }
            >
                <div className={"mb-[50px] cursor-pointer"}>
                    <Link href={"/home"}>
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
                    href={"/home"}
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
                                case "bug_report":
                                    console.log("hoge")
                                    break
                                case "switch_account":
                                    accountSwitchModalDisclosure.onOpen()
                                    break
                                case "log_out":
                                    signOutModalDisclosure.onOpen()
                                    break
                            }
                        }}
                    >
                        <DropdownItem key="about">
                            <a
                                href={"https://github.com/baisony/ucho-ten"}
                                target={"_blank"}
                                rel={"noreferrer"}
                            >
                                About Ucho-ten
                            </a>
                        </DropdownItem>
                        <DropdownItem key="bug_report">
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
                        <DropdownItem key="switch_account">
                            Switch Account
                        </DropdownItem>
                        <DropdownItem
                            key="log_out"
                            className="text-danger"
                            color="danger"
                        >
                            Logout
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
