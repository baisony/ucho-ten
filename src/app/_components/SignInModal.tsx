import { useTranslation } from "react-i18next"
import { useState } from "react"
import {
    Button,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Spinner,
    useDisclosure,
} from "@nextui-org/react"

// TODO: Move these to style.ts --
import { tv } from "@nextui-org/react"
import AccountComponent from "./AccountComponent"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faAt } from "@fortawesome/free-solid-svg-icons"

export const signInModal = tv({
    slots: {
        appearanceTextColor: "text-black dark:text-white",
    },
})
// ---

interface SignInModalProps {
    openModalReason: string
    handleSideBarOpen: (isOpen: boolean) => void
    onClickSignIn: () => void
    handleDeleteSession: () => void
}

const SignInModal = ({
    openModalReason,
    handleSideBarOpen,
    handleDeleteSession,
    onClickSignIn,
}: SignInModalProps) => {
    const { t } = useTranslation()

    const { isOpen, onOpenChange } = useDisclosure()

    const [serverName, setServerName] = useState<string>("")

    const { appearanceTextColor } = signInModal()

    return (
        <>
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                className={appearanceTextColor()}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            {openModalReason === "switching" ? (
                                <>
                                    <ModalHeader>
                                        {t(
                                            "components.ViewSideBar.switchAccount"
                                        )}
                                    </ModalHeader>
                                    <ModalBody>
                                        <AccountComponent />
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button
                                            color="primary"
                                            onClick={() => {
                                                onClose()
                                                handleSideBarOpen(false)
                                            }}
                                        >
                                            {t("button.close")}
                                        </Button>
                                    </ModalFooter>
                                </>
                            ) : openModalReason === "logout" ? (
                                <>
                                    <ModalHeader>
                                        {t(
                                            "components.ViewSideBar.logoutModal.description"
                                        )}
                                    </ModalHeader>
                                    <ModalFooter>
                                        <Button
                                            color="danger"
                                            variant="light"
                                            onClick={onClose}
                                        >
                                            {t("button.no")}
                                        </Button>
                                        <Button
                                            color="primary"
                                            onClick={() => {
                                                handleDeleteSession()
                                                onClose()
                                                handleSideBarOpen(false)
                                            }}
                                        >
                                            {t("button.yes")}
                                        </Button>
                                    </ModalFooter>
                                </>
                            ) : (
                                openModalReason === "relogin" && (
                                    <>
                                        <ModalHeader className="flex flex-col gap-1">
                                            {t(
                                                "components.ViewSideBar.addAccountModal.title"
                                            )}
                                        </ModalHeader>
                                        <ModalBody>
                                            <Input
                                                defaultValue={
                                                    selectedAccountInfo?.service
                                                }
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
                                                defaultValue={
                                                    selectedAccountInfo?.session
                                                        ?.handle
                                                }
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
                                            <Button
                                                color="primary"
                                                onClick={onClickSignIn}
                                            >
                                                {!isLogging ? (
                                                    t("button.signin")
                                                ) : (
                                                    <Spinner size={"sm"} />
                                                )}
                                            </Button>
                                        </ModalFooter>
                                    </>
                                )
                            )}
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}

export default SignInModal
