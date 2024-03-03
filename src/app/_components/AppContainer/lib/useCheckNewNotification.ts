// useCheckNewNotification.ts
import { useCallback } from "react"
import { BskyAgent } from "@atproto/api"

const useCheckNewNotification = (
    agent: BskyAgent | null,
    setUnreadNotification: (num: number) => void,
    autoRefetch: () => Promise<void>
) => {
    return useCallback(async () => {
        if (!agent) {
            return
        }
        try {
            const { data } = await agent.countUnreadNotifications()
            const notifications = await agent.listNotifications()
            const { count } = data
            const reason = ["mention", "reply"]
            let notify_num = 0
            for (let i = 0; i < count; i++) {
                const notificationReason =
                    notifications.data.notifications[i].reason
                if (reason.some((item) => notificationReason.includes(item))) {
                    notify_num++
                }
            }
            setUnreadNotification(notify_num)
            void autoRefetch()
        } catch (e) {
            console.log(e)
        }
    }, [agent, setUnreadNotification, autoRefetch])
}

export default useCheckNewNotification
