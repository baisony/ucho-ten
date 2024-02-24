// useCheckNewNotification.ts
import { useCallback } from "react"

const useCheckNewNotification = (
    agent: any, // agent の型を適切に指定してください
    setUnreadNotification: (num: number) => void,
    autoRefetch: () => Promise<void>
) => {
    const checkNewNotification = useCallback(async () => {
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
            if (notify_num === 0) return
            setUnreadNotification(notify_num)
            void autoRefetch()
        } catch (e) {
            console.log(e)
        }
    }, [agent, setUnreadNotification, autoRefetch])

    return checkNewNotification
}

export default useCheckNewNotification
