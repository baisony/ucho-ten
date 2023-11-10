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
import { UserAccount, useAccounts } from "../_atoms/accounts"
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
    // handleSideBarOpen: (isOpen: boolean) => void
    // handleDeleteSession: () => void
}

const AccountSwitchModal = (props: AccountSwitchModalProps) => {
    const {
        isOpen,
        onOpenChange,
        handleClickAddAccount,
        // handleSideBarOpen,
    } = props

    const { t } = useTranslation()

    const [agent] = useAgent()
    const [accounts, setAccounts] = useAccounts()

    // const { isOpen, onOpenChange } = useDisclosure()

    const [serverName, setServerName] = useState<string>("")
    const [accountsByServices, setAccountsByServices] = useState<{
        [key: string]: UserAccount[]
    }>({})
    const [identity, setIdentity] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [isLogging, setIsLogging] = useState<boolean>(false)
    const [loginError, setLoginError] = useState<boolean>(false)
    const [isAccountSwitching, setIsAccountSwitching] = useState(false)
    const [authenticationRequired, setAuthenticationRequired] = useState<
        boolean | null
    >(null)
    const [selectedAccountInfo, setSelectedAccountInfo] = useState<any>(null)

    const { appearanceTextColor } = signInModal()

    const handleClickSignIn = async () => {
        if (serverName === "" || identity === "" || password === "") {
            return
        }

        try {
            setIsAccountSwitching(true)
            setLoginError(false)
            setAuthenticationRequired(false)
            setIsLogging(true)
            let result = serverName.replace(/(http:\/\/|https:\/\/)/g, "")
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
                    server: serverName,
                    session: agent.session,
                }

                localStorage.setItem("session", JSON.stringify(json))

                const existingAccountsData = accounts

                const { data } = await agent.getProfile({
                    actor: agent.session.did,
                })

                existingAccountsData[agent.session.did] = {
                    service: serverName,
                    session: agent.session,
                    profile: {
                        did: agent.session.did,
                        displayName: data?.displayName || agent.session.handle,
                        handle: agent.session.handle,
                        avatar: data?.avatar || "",
                    },
                }

                setAccounts(existingAccountsData)
            }
            setIsLogging(false)
            setIsAccountSwitching(false)
            window.location.reload()
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.log(e.message)
                setIsLogging(false)
                setIsAccountSwitching(false)
                setLoginError(true)
            }
        }
    }

    const handleClickUserAccount = async (
        item: UserAccount,
        serverName: string
    ) => {}

    const handleClickNeedLogin = (handle: string, serverName: string) => {}

    // const handleClickAddAcount = () => {
    //     setSelectedAccountInfo(null)
    //     // setOpenModalReason("relogin")
    // }

    useEffect(() => {
        let tempAccountsByServices: { [key: string]: UserAccount[] } = {}

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
                            {/* <AccountsComponent
                                currentDID={agent?.session?.did}
                                selectedAccountInfo={selectedAccountInfo}
                                accountsByServices={accountsByServices}
                                isSwitching={isAccountSwitching}
                                authenticationRequired={false}
                                onClickUserAccount={handleClickUserAccount}
                                onClickNeedLogin={handleClickNeedLogin}
                                onClickAddAcount={handleClickAddAcount}
                            /> */}
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
                                                status={"loginRequired"}
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
                                onClick={() => {
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
