import { atom, useAtom } from "jotai"
import { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"

interface NotificationInfo {
    notification: PostView[] | null
    cursor: string
}

const notificationInfoAtom = atom<NotificationInfo>({
    notification: null,
    cursor: "",
})

export const useNotificationInfoAtom = () => useAtom(notificationInfoAtom)
