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
    useDisclosure,
} from "@nextui-org/react"
import { BskyAgent } from "@atproto/api"
import { tv } from "@nextui-org/react"
import AccountsComponent from "./AccountComponent"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faAt, faLock } from "@fortawesome/free-solid-svg-icons"
import { UserAccount, UserAccountByDid, useAccounts } from "../_atoms/accounts"
import { useAgent } from "../_atoms/agent"

// TODO: Move this to style.ts --
export const signInModal = tv({
    slots: {
        appearanceTextColor: "text-black dark:text-white",
    },
})
// ---

interface SignOutModalProps {
    isOpen: boolean
    onOpenChange: () => void
    openModalReason: string
    handleSideBarOpen: (isOpen: boolean) => void
    handleDeleteSession: () => void
}

const SignOutModal = (props: SignOutModalProps) => {
    const {
        isOpen,
        onOpenChange,
        handleSideBarOpen,
        handleDeleteSession,
    } = props

    const { t } = useTranslation()
    const { appearanceTextColor } = signInModal()

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
                )}
            </ModalContent>
        </Modal>
    )
}

export default SignOutModal
