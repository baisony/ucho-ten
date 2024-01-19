import { Modal, ModalBody, ModalContent } from "@nextui-org/react"
import { AtUri } from "@atproto/api"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faArrowUpFromBracket,
    faFlag,
    faLanguage,
    faTrash,
    faVolumeXmark,
} from "@fortawesome/free-solid-svg-icons"

import { useTranslation } from "react-i18next"
import { useAgent } from "@/app/_atoms/agent"
import { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"

interface MobileOptionModalProps {
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
    placement?: "top" | "right" | "bottom" | "left"
    className?: string
    hideCloseButton?: boolean
    postView?: PostView | null
    postJson?: PostView
    handleMute: () => void
    handleDelete: () => void
    onOpenReport: () => void
    translateContentText: () => void
    isMuted?: boolean
}

export const MobileOptionModal = (props: MobileOptionModalProps) => {
    const {
        isOpen,
        onOpenChange,
        handleMute,
        handleDelete,
        onOpenReport,
        translateContentText,
        postView,
        postJson,
        isMuted,
    } = props
    const { t } = useTranslation()
    const [agent] = useAgent()
    return (
        <>
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                placement={"bottom"}
                className={"z-[100] max-w-[600px] text-black dark:text-white"}
                hideCloseButton
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalBody>
                                <span>
                                    <div
                                        className={"mt-[15px] mb-[15px] w-full"}
                                        onClick={async () => {
                                            if (!window.navigator.share) {
                                                alert(
                                                    t(
                                                        "alert.cannotShareInBrowser"
                                                    )
                                                )
                                                return
                                            }
                                            try {
                                                const url = new AtUri(
                                                    postView?.uri || ""
                                                )

                                                const bskyURL = `https://bsky.app/profile/${url.hostname}/post/${url.rkey}`
                                                console.log(url)
                                                await window.navigator.share({
                                                    url: bskyURL,
                                                })
                                            } catch (e) {}
                                        }}
                                    >
                                        <FontAwesomeIcon
                                            icon={faArrowUpFromBracket}
                                            className={"w-[40px]"}
                                        />
                                        {t("pages.postOnlyPage.share")}
                                    </div>
                                    <div
                                        className={"mt-[15px] mb-[15px] w-full"}
                                        onClick={async () => {
                                            await translateContentText()
                                            onClose()
                                        }}
                                    >
                                        <FontAwesomeIcon
                                            icon={faLanguage}
                                            className={"w-[40px]"}
                                        />
                                        {t("pages.postOnlyPage.translate")}
                                    </div>
                                    {postJson?.author?.did !==
                                        agent?.session?.did && (
                                        <div
                                            className={
                                                "mt-[15px] mb-[15px] w-full text-red-600"
                                            }
                                            onClick={() => {
                                                let confirm
                                                if (isMuted) {
                                                    confirm = window?.confirm(
                                                        t(
                                                            "components.ViewPostCard.unMuteThisUser?"
                                                        )
                                                    )
                                                } else {
                                                    confirm = window?.confirm(
                                                        t(
                                                            "components.ViewPostCard.muteThisUser?"
                                                        )
                                                    )
                                                }
                                                if (!confirm) return
                                                void handleMute()
                                            }}
                                        >
                                            <FontAwesomeIcon
                                                icon={faVolumeXmark}
                                                className={"w-[40px]"}
                                            />
                                            {!isMuted ? (
                                                <span>
                                                    {" "}
                                                    {t(
                                                        "components.ViewPostCard.mute"
                                                    )}
                                                </span>
                                            ) : (
                                                <span>
                                                    {" "}
                                                    {t(
                                                        "components.ViewPostCard.unmute"
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    {postJson?.author?.did ===
                                    agent?.session?.did ? (
                                        <div
                                            className={
                                                "mt-[15px] mb-[15px] w-full text-red-600"
                                            }
                                            onClick={() => {
                                                const confirm = window?.confirm(
                                                    t(
                                                        "components.ViewPostCard.deletePost?"
                                                    )
                                                )
                                                if (!confirm) return
                                                void handleDelete()
                                                onClose()
                                            }}
                                        >
                                            <FontAwesomeIcon
                                                icon={faTrash}
                                                className={"w-[40px]"}
                                            />
                                            {t(
                                                "components.ViewPostCard.delete"
                                            )}
                                        </div>
                                    ) : (
                                        <div
                                            className={
                                                "mt-[15px] mb-[15px] w-full text-red-600"
                                            }
                                            onClick={() => {
                                                onOpenReport()
                                            }}
                                        >
                                            <FontAwesomeIcon
                                                icon={faFlag}
                                                className={"w-[40px]"}
                                            />
                                            {t(
                                                "components.ViewPostCard.report"
                                            )}
                                        </div>
                                    )}
                                </span>
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}
