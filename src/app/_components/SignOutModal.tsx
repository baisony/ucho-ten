import { useTranslation } from "react-i18next"
import {
    Button,
    Modal,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from "@nextui-org/react"
import { tv } from "@nextui-org/react"
import { useRouter } from "next/navigation"
import { UserAccountByDid, useAccounts } from "../_atoms/accounts"
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
    handleSideBarOpen?: (isOpen: boolean) => void
}

const SignOutModal = (props: SignOutModalProps) => {
    const { isOpen, onOpenChange, handleSideBarOpen } = props

    const { t } = useTranslation()
    const router = useRouter()

    const [agent] = useAgent()
    const [accounts, setAccounts] = useAccounts()
    
    const { appearanceTextColor } = signInModal()

    const handleDeleteSession = () => {
        if (handleSideBarOpen !== undefined) {
            handleSideBarOpen(false)
        }

        localStorage.removeItem("session")

        const existingAccountsData: UserAccountByDid = accounts

        if (!agent?.session?.did) {
            return
        }

        let updatedAccountData = existingAccountsData[agent.session.did] || {}
        updatedAccountData.session = undefined

        existingAccountsData[agent.session.did] = updatedAccountData

        setAccounts(existingAccountsData)

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
