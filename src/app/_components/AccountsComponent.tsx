"use client"

import { AppBskyActorDefs, BskyAgent } from "@atproto/api"
import { UserAccount, useAccounts } from "../_atoms/accounts"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useAgent } from "../_atoms/agent"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons"

import defaultIcon from "../../../../public/images/icon/default_icon.svg"
import { Button, Spinner } from "@nextui-org/react"

interface AccountsComponentProps {
    currentDID: string | null
    selectedAccountInfo: any // FIXME: Do not use any!
    accountsByServices: { [key: string]: UserAccount[] }
    isSwitching: boolean
    authenticationRequired: boolean
    onClickUserAccount: (item: UserAccount, serverName: string) => Promise<void>
    onClickNeedLogin: (handle: string, serverName: string) => void
    onClickAddAcount: () => void
}

const AccountsComponent = (props: AccountComponentProps) => {
    const {
        currentDID,
        selectedAccountInfo,
        isSwitching,
        authenticationRequired,
        accountsByServices,
        onClickUserAccount,
        onClickNeedLogin,
        onClickAddAcount,
    } = props

    const { t } = useTranslation()

    // const userList = Object.entries(accounts).map(([key, value]) => ({
    //     key,
    //     value,
    // }))

    // const [accounts] = useAccounts()

    // useEffect(() => {
    //     const serviceData: { [key: string]: UserAccount[] } = {}

    //     // userList.forEach((item) => {
    //     //     const service: string = item.value.service as any

    //     //     if (service !== undefined) {
    //     //         if (!serviceData[service]) {
    //     //             serviceData[service] = []
    //     //         }

    //     //         serviceData[service].push(item.value)
    //     //     }
    //     // })

    //     setCategorization(serviceData)

    //     Object.entries(serviceData).forEach(([key, value]) => {
    //         console.log(key, value)
    //     })
    // }, [accounts])

    // const [categorization, setCategorization] = useState<{
    //     [key: string]: UserAccount[]
    // }>({})
    // const [isSwitching, setIsSwitching] = useState(false)
    // const [authenticationRequired, setAuthenticationRequired] = useState<
    //     boolean | null
    // >(null)
    // const [selectedAccountInfo, setSelectedAccountInfo] = useState<any>(null)

    // const handleClickUserAccount = async (item: UserAccount, serverName: string) => {
    //     if (item.session.did === agent?.session?.did) return
    //     try {
    //         setIsSwitching(true)
    //         setAuthenticationRequired(false)
    //         setSelectedAccountInfo(item)

    //         const { session } = item

    //         const agent = new BskyAgent({
    //             service: `https://${serverName}`,
    //         })

    //         await agent.resumeSession(session)

    //         setAgent(agent)

    //         const json = {
    //             server: serverName,
    //             session: session,
    //         }

    //         localStorage.setItem("session", JSON.stringify(json))
    //         setIsSwitching(false)
    //         window.location.reload()
    //     } catch (e: unknown) {
    //         if (e instanceof Error) {
    //             if (e.message.includes("Authentication")) {
    //                 setIsSwitching(false)
    //                 setAuthenticationRequired(true)
    //             }
    //         }
    //     }
    // }

    return (
        <>
            {Object.entries(accountsByServices).map(
                ([serverNameKey, userAccounts]) => (
                    <div key={serverNameKey} className={"select-none"}>
                        {serverNameKey}
                        {userAccounts.map((item: UserAccount) => (
                            <div
                                key={item.profile.did}
                                className={
                                    "justify-between flex items-center w-full cursor-pointer"
                                }
                                onClick={() => {
                                    onClickUserAccount(item, serverNameKey)
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
                                    {currentDID === item.profile.did ? (
                                        <div>
                                            <FontAwesomeIcon
                                                icon={faCircleCheck}
                                                className={"text-[#00D315]"}
                                            />
                                        </div>
                                    ) : isSwitching &&
                                      item.profile.did ===
                                          selectedAccountInfo?.profile.did ? (
                                        <Spinner />
                                    ) : (
                                        authenticationRequired &&
                                        item.profile.did ===
                                            selectedAccountInfo?.profile.did && (
                                            <span className={"text-[#FF0000]"}>
                                                <Button
                                                    onClick={() => {
                                                        onClickNeedLogin(
                                                            item.profile.handle,
                                                            serverNameKey
                                                        )
                                                        // setServerName(serverNameKey)
                                                        // setIdentity(
                                                        //     item.profile.handle
                                                        // )
                                                        // setOpenModalReason(
                                                        //     "relogin"
                                                        // )
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
                )
            )}
            <div
                className={
                    "h-[50px] w-full select-none flex justify-center items-center cursor-pointer"
                }
                onClick={() => {
                    onClickAddAcount()
                    // setSelectedAccountInfo(null)
                    // setOpenModalReason("relogin")
                }}
            >
                {t("components.ViewSideBar.addAccount")}
            </div>
        </>
    )
}

export default AccountComponent
