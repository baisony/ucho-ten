import { useTranslation } from "react-i18next"
import { useEffect, useState } from "react"
import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from "@nextui-org/react"
import { BskyAgent } from "@atproto/api"
import { tv } from "@nextui-org/react"
import { UserAccount, UserAccountByDid, useAccounts } from "../_atoms/accounts"
import { useAgent } from "../_atoms/agent"
import AccountComponent from "./AccountComponent"

// TODO: Move this to style.ts --
export const signInModal = tv({
    slots: {
        appearanceTextColor: "text-black dark:text-white",
    },
})
// ---

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

    // const { isOpen, onOpenChange } = useDisclosure()

    // const [serverName, setServerName] = useState<string>("")
    const [accountsByServices, setAccountsByServices] = useState<{
        [key: string]: UserAccount[]
    }>({})
    // const [identity, setIdentity] = useState<string>("")
    // const [password, setPassword] = useState<string>("")
    // const [isLogging, setIsLogging] = useState<boolean>(false)
    // const [loginError, setLoginError] = useState<boolean>(false)
    const [isAccountSwitching, setIsAccountSwitching] = useState(false)
    const [authenticationRequired, setAuthenticationRequired] = useState<
        boolean | null
    >(null)
    const [selectedAccount, setSelectedAccount] = useState<UserAccount | null>(
        null
    )

    const { appearanceTextColor } = signInModal()

    const handleClickUserAccount = async (account: UserAccount) => {
        if (
            agent?.session?.did &&
            account.session.did === agent?.session?.did
        ) {
            return
        }

        try {
            setIsAccountSwitching(true)
            setAuthenticationRequired(false)
            setSelectedAccount(account)

            const { session } = account

            const agent = new BskyAgent({
                service: `https://${account.service}`,
            })

            await agent.resumeSession(session)

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

            const updatedAccountData: UserAccount = {
                service: account.service,
                session: agent.session,
                profile: account.profile,
            }

            existingAccountsData[agent.session.did] = updatedAccountData

            setAccounts(existingAccountsData)

            setIsAccountSwitching(false)

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

        Object.entries(accounts).forEach(([did, account]) => {
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

export default AccountSwitchModal
