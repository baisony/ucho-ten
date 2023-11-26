import { useTranslation } from "react-i18next"
import { useEffect, useState } from "react"
import {
    Button,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Spinner,
    tv,
} from "@nextui-org/react"
import { BskyAgent } from "@atproto/api"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faAt, faLock } from "@fortawesome/free-solid-svg-icons"
import { useAccounts, UserAccount } from "../_atoms/accounts"
import { useAgent } from "../_atoms/agent"

// TODO: Move this to style.ts --
export const signInModal = tv({
    slots: {
        appearanceTextColor: "text-black dark:text-white",
    },
})
// ---

const DEFAULT_SERVER_NAME = "bsky.social"

interface SignInModalProps {
    isOpen: boolean
    onOpenChange: () => void
    selectedAccount: UserAccount | null
}

const SignInModal = (props: SignInModalProps) => {
    const {
        isOpen,
        onOpenChange,
        selectedAccount,
        //onClickSignIn,
    } = props

    const { t } = useTranslation()

    const [, setAgent] = useAgent()
    const [accounts, setAccounts] = useAccounts()

    // const { isOpen, onOpenChange } = useDisclosure()

    const [serverName, setServerName] = useState<string>("")
    /*const [accountsByServices, setAccountsByServices] = useState<{
        [key: string]: UserAccount[]
    }>({})*/
    const [identity, setIdentity] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [isLogging, setIsLogging] = useState<boolean>(false)
    const [loginError, setLoginError] = useState<boolean>(false)
    const [, setIsAccountSwitching] = useState(false)
    const [, setAuthenticationRequired] = useState<boolean | null>(null)
    // const [selectedAccountInfo, setSelectedAccountInfo] = useState<any>(null)

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

                setAgent(agent)

                setAccounts(existingAccountsData)
            } else {
                throw new Error("Session error")
            }

            setIsLogging(false)
            setIsAccountSwitching(false)

            window.location.reload()
            // router.push("/")
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.log(e.message)
            }

            setIsLogging(false)
            setIsAccountSwitching(false)
            setLoginError(true)
        }
    }

    useEffect(() => {
        if (selectedAccount === null) {
            setIdentity("")
            setServerName(DEFAULT_SERVER_NAME)

            return
        }

        setIdentity(selectedAccount.profile.handle)
        setServerName(selectedAccount.service)
    }, [selectedAccount])

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    setServerName("")
                    setIdentity("")
                    setPassword("")
                }

                onOpenChange()
            }}
            className={appearanceTextColor()}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            {t("components.ViewSideBar.addAccountModal.title")}
                        </ModalHeader>
                        <ModalBody>
                            <Input
                                // defaultValue={
                                //     selectedAccount?.service ||
                                //     DEFAULT_SERVER_NAME
                                // }
                                value={serverName}
                                onValueChange={(e) => {
                                    setServerName(e)
                                }}
                                label={t(
                                    "components.ViewSideBar.addAccountModal.service"
                                )}
                                placeholder={t(
                                    "components.ViewSideBar.addAccountModal.servicePlaceholder"
                                )}
                                variant="bordered"
                                isInvalid={loginError}
                            />
                            <Input
                                autoFocus
                                endContent={
                                    <FontAwesomeIcon
                                        icon={faAt}
                                        className="text-2xl text-default-400 pointer-events-none flex-shrink-0"
                                    />
                                }
                                // defaultValue={
                                //     selectedAccount?.profile.handle || ""
                                // }
                                value={identity}
                                onValueChange={(e) => {
                                    setIdentity(e)
                                }}
                                label={t(
                                    "components.ViewSideBar.addAccountModal.identifier"
                                )}
                                placeholder={t(
                                    "components.ViewSideBar.addAccountModal.identifierPlaceholder"
                                )}
                                variant="bordered"
                                isInvalid={loginError}
                            />
                            <Input
                                endContent={
                                    <FontAwesomeIcon
                                        icon={faLock}
                                        className="text-2xl text-default-400 pointer-events-none flex-shrink-0"
                                    />
                                }
                                onValueChange={(e) => {
                                    setPassword(e)
                                }}
                                label={t(
                                    "components.ViewSideBar.addAccountModal.password"
                                )}
                                placeholder={t(
                                    "components.ViewSideBar.addAccountModal.passwordPlaceholder"
                                )}
                                type="password"
                                variant="bordered"
                                isInvalid={loginError}
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                color="danger"
                                variant="flat"
                                onPress={onClose}
                            >
                                {t("button.close")}
                            </Button>
                            <Button color="primary" onPress={handleClickSignIn}>
                                {!isLogging ? (
                                    t("button.signin")
                                ) : (
                                    <Spinner size={"sm"} />
                                )}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}

export default SignInModal
