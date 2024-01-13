"use client"

import { useEffect } from "react"
import OneSignal from "react-onesignal"
import { useAgent } from "@/app/_atoms/agent"

export const OneSignalInitial = () => {
    const [agent] = useAgent()
    useEffect(() => {
        if (!agent) return
        const oneSignalInit = async () => {
            console.log()
            await OneSignal.init({
                appId: process.env.NEXT_PUBLIC_ONE_SIGNAL_APP_ID || "",
                allowLocalhostAsSecureOrigin: true,
                promptOptions: {
                    customlink: {
                        enabled: true /* Required to use the Custom Link */,
                        style: "button" /* Has value of 'button' or 'link' */,
                        size: "medium" /* One of 'small', 'medium', or 'large' */,
                        color: {
                            button: "#E12D30" /* Color of the button background if style = "button" */,
                            text: "#FFFFFF" /* Color of the prompt's text */,
                        },
                        text: {
                            subscribe: "Enable",
                            /* Prompt's text when not subscribed */ unsubscribe:
                                "Disable",
                            /* Prompt's text when subscribed */
                        },
                        unsubscribeEnabled: true,
                    },
                },
            }).then(async () => {
                await OneSignal.Slidedown.promptPush()
            })
            console.log(await OneSignal.login(agent?.session?.did ?? ""))
        }
        oneSignalInit()
    }, [agent])
    return null
}
