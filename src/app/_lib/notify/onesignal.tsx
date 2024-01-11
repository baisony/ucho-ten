"use client"

import { useEffect } from "react"
import OneSignal from "react-onesignal"

export const OneSignalInitial = () => {
    useEffect(() => {
        const oneSignalInit = async () => {
            await OneSignal.init({
                appId: process.env.NEXT_PUBLIC_ONE_SIGNAL_APP_ID || "",
            }).then(() => {
                OneSignal.Slidedown.promptPush()
            })
        }
        oneSignalInit()
    }, [])
    return null
}
