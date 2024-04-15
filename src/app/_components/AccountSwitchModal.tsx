import { useTranslation } from "react-i18next"
import { memo, useEffect, useState } from "react"
import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    tv,
} from "@nextui-org/react"
import { BskyAgent } from "@atproto/api"
import { useAccounts, UserAccount, UserAccountByDid } from "../_atoms/accounts"
import { useAgent } from "../_atoms/agent"
import AccountComponent from "./AccountComponent"
import OneSignal from "react-onesignal"
import { useOneSignalLogin } from "@/app/_atoms/onesignalLoggined"

// TODO: Move this to style.ts --
export const signInModal = tv({
    slots: {
        appearanceTextColor: "text-black dark:text-white",
    },
})

interface AccountSwitchModalProps {
    isOpen: boolean
    onOpenChange: () => void
    handleClickAddAccount: () => void
    handleClickNeedLogin: (account: UserAccount) => void
    // handleSideBarOpen: (isOpen: boolean) => void
}

const AccountSwitchModal = (props: AccountSwitchModalProps) => {
    const {
        isOpen,
        onOpenChange,
        handleClickAddAccount,
        handleClickNeedLogin,
        // handleSideBarOpen,
    } = props

    const { t } = useTranslation()

    const [agent, setAgent] = useAgent()
    const [accounts, setAccounts] = useAccounts()

    const [accountsByServices, setAccountsByServices] = useState<{
        [key: string]: UserAccount[]
    }>({})
    const [isAccountSwitching, setIsAccountSwitching] = useState(false)
    const [authenticationRequired, setAuthenticationRequired] = useState<
        boolean | null
    >(null)
    const [selectedAccount, setSelectedAccount] = useState<UserAccount | null>(
        null
    )
    const [, setOneSignalLogin] = useOneSignalLogin()

    const { appearanceTextColor } = signInModal()

    const handleClickUserAccount = async (account: UserAccount) => {
        if (
            agent?.session?.did &&
            account.session &&
            account.session.did === agent.session.did
        ) {
            return
        }

        try {
            setIsAccountSwitching(true)
            setAuthenticationRequired(false)
            setSelectedAccount(account)

            if (!account?.session) {
                throw new Error("Authentication error")
            }

            const { session } = account

            const agent = new BskyAgent({
                service: `https://${account.service}`,
            })

            await agent.resumeSession(session)

            /*if (await OneSignal?.User.PushSubscription.optedIn) {
                await OneSignal.User.PushSubscription.optOut()
                optedInRef.current =
                    await OneSignal?.User.PushSubscription.optedIn
            }*/

            setAgent(agent)

            const json = {
                server: account.service,
                session: agent.session,
            }

            localStorage.setItem("session", JSON.stringify(json))

            const existingAccountsData: UserAccountByDid = accounts

            if (!agent.session?.did) {
                throw new Error("Authentication error")
            }

            existingAccountsData[agent.session.did] = {
                service: account.service,
                session: agent.session,
                profile: account.profile,
            }

            setAccounts(existingAccountsData)

            setIsAccountSwitching(false)

            await OneSignal?.logout()
            setOneSignalLogin(false)

            window.location.reload()
        } catch (e: unknown) {
            if (e instanceof Error) {
                if (e.message.includes("Authentication")) {
                    setIsAccountSwitching(false)
                    setAuthenticationRequired(true)
                }
            }
        }
    }

    useEffect(() => {
        const tempAccountsByServices: { [key: string]: UserAccount[] } = {}

        Object.entries(accounts).forEach(([, account]) => {
            if (!tempAccountsByServices[account.service]) {
                tempAccountsByServices[account.service] = []
            }

            tempAccountsByServices[account.service].push(account)
        })

        setAccountsByServices(tempAccountsByServices)
    }, [accounts])

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            className={appearanceTextColor()}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>
                            {t("components.ViewSideBar.switchAccount")}
                        </ModalHeader>
                        <ModalBody>
                            {Object.entries(accountsByServices).map(
                                ([serverNameKey, userAccounts]) => (
                                    <div
                                        key={serverNameKey}
                                        className={"select-none"}
                                    >
                                        {serverNameKey}
                                        {userAccounts.map(
                                            (account: UserAccount) => (
                                                <AccountComponent
                                                    // serverName={serverNameKey}
                                                    account={account}
                                                    status={
                                                        agent?.session?.did &&
                                                        agent.session.did ===
                                                            account.profile.did
                                                            ? "current"
                                                            : authenticationRequired &&
                                                                selectedAccount !==
                                                                    null &&
                                                                account.profile
                                                                    .did ===
                                                                    selectedAccount
                                                                        .profile
                                                                        .did
                                                              ? "loginRequired"
                                                              : isAccountSwitching
                                                                ? "switching"
                                                                : null
                                                    }
                                                    onClickNeedLogin={
                                                        handleClickNeedLogin
                                                    }
                                                    onClickUserAccount={
                                                        handleClickUserAccount
                                                    }
                                                />
                                            )
                                        )}
                                    </div>
                                )
                            )}
                            <div
                                className={
                                    "h-[50px] w-full select-none flex justify-center items-center cursor-pointer"
                                }
                                onClick={() => {
                                    handleClickAddAccount()

                                    // setSelectedAccountInfo(null)
                                    // setOpenModalReason("relogin")
                                }}
                            >
                                {t("components.ViewSideBar.addAccount")}
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                color="primary"
                                onPress={() => {
                                    onClose()
                                    // handleSideBarOpen(false)
                                }}
                            >
                                {t("button.close")}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}

export default memo(AccountSwitchModal)
