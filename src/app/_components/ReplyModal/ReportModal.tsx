import { Modal, ModalContent } from "@nextui-org/react"

import { isMobile } from "react-device-detect"
import { PostModal } from "../PostModal/PostModal"
import { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { memo } from "react"

/**
 * SetttingsModal props.
 */
export type ReportModalProps = {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    placement?: "top" | "center"
    className?: string
    //type?: "Reply"
    post: PostView | undefined
    //nextQueryParams: URLSearchParams
}

/**
 * SetttingsModal component.
 */
export const ReplyModal = memo((props: ReportModalProps) => {
    const { isOpen, onOpenChange, post } = props

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            placement={isMobile ? "top" : "center"}
            className={`z-[100] max-w-[600px] bg-transparent`}
        >
            <ModalContent>
                {(onClose) => (
                    <PostModal
                        type={"Reply"}
                        postData={post}
                        onClose={onClose}
                    />
                )}
            </ModalContent>
        </Modal>
    )
})
