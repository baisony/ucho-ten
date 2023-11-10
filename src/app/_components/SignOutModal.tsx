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
import AccountsComponent from "./AccountComponent"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faAt, faLock } from "@fortawesome/free-solid-svg-icons"
import { UserAccount, UserAccountByDid, useAccounts } from "../_atoms/accounts"
import { useAgent } from "../_atoms/agent"
import { useRouter } from "next/navigation"

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
    handleSideBarOpen?: (isOpen: boolean) => void
}

const SignOutModal = (props: SignOutModalProps) => {
    const { isOpen, onOpenChange, handleSideBarOpen } = props

    const { t } = useTranslation()
    const router = useRouter()

    const { appearanceTextColor } = signInModal()

    const handleDeleteSession = () => {
        if (handleSideBarOpen !== undefined) {
            handleSideBarOpen(false)
        }

        localStorage.removeItem("session")
        router.push("/login")
    }

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
                                onPress={() => {
                                    onClose()

                                    if (handleSideBarOpen) {
                                        handleSideBarOpen(false)
                                    }
                                }}
                            >
                                {t("button.no")}
                            </Button>
                            <Button
                                color="primary"
                                onPress={() => {
                                    handleDeleteSession()
                                    onClose()
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
