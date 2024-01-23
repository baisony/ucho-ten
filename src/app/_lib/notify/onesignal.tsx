"use client"

import { useEffect } from "react"
import OneSignal from "react-onesignal"
import { useAgent } from "@/app/_atoms/agent"
import { useOneSignalLogin } from "@/app/_atoms/onesignalLoggined"

export const OneSignalInitial = () => {
    const [agent] = useAgent()
    const [, setOneSignalLogin] = useOneSignalLogin()
    useEffect(() => {
        if (!agent) return
        const oneSignalInit = async () => {
            await OneSignal.init({
                appId: process.env.NEXT_PUBLIC_ONE_SIGNAL_APP_ID || "",
                allowLocalhostAsSecureOrigin: true,
            }).then(async () => {
                await OneSignal.Slidedown.promptPush()
            })
            console.log(await OneSignal.login(agent?.session?.did ?? ""))
            setOneSignalLogin(true)
        }
        oneSignalInit()
    }, [agent])
    return null
}
