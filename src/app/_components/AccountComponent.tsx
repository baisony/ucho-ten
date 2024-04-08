"use client"

import { UserAccount } from "../_atoms/accounts"
import { useTranslation } from "react-i18next"
import { Button, Spinner } from "@nextui-org/react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons/faCircleCheck"

import defaultIcon from "../../../public/images/icon/default_icon.svg"

interface AccountComponentProps {
    // serverName: string
    account: UserAccount
    status: "current" | "switching" | "loginRequired" | null
    onClickUserAccount: (account: UserAccount) => Promise<void>
    onClickNeedLogin: (account: UserAccount) => void
}

const AccountComponent = (props: AccountComponentProps) => {
    const { account, status, onClickUserAccount, onClickNeedLogin } = props

    const { t } = useTranslation()

    return (
        <>
            <div
                key={account.profile.did}
                className={
                    "justify-between flex items-center w-full cursor-pointer"
                }
                onClick={() => {
                    void onClickUserAccount(account)
                }}
            >
                <div className={"flex items-center mb-[10px]"}>
                    <div
                        className={
                            "w-[50px] h-[50px] rounded-full overflow-hidden"
                        }
                    >
                        <img
                            src={account.profile?.avatar || defaultIcon.src}
                            className={"h-full w-full"}
                            alt={"avatar"}
                        />
                    </div>
                    <div className={"ml-[15px]"}>
                        <div>{account.profile.displayName}</div>
                        <div className={"text-default-400 text-sm"}>
                            @{account.profile.handle}
                        </div>
                    </div>
                </div>
                <div>
                    {status === "current" ? (
                        <div>
                            <FontAwesomeIcon
                                icon={faCircleCheck}
                                className={"text-[#00D315]"}
                            />
                        </div>
                    ) : status === "switching" ? (
                        <Spinner />
                    ) : (
                        status === "loginRequired" && (
                            <span className={"text-[#FF0000]"}>
                                <Button
                                    onClick={() => {
                                        onClickNeedLogin(account)
                                    }}
                                >
                                    {t("components.ViewSideBar.needLogin")}
                                </Button>
                            </span>
                        )
                    )}
                </div>
            </div>
        </>
    )
}

export default AccountComponent
