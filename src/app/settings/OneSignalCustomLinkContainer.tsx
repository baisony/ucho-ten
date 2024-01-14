import { useEffect, useState } from "react"
import { Spinner } from "@nextui-org/react"

export const OneSignalCustomLinkContainer = () => {
    const [loading, setLoading] = useState(false)
    useEffect(() => {
        if (!window) return
        //@ts-ignore
        window?.OneSignal?.eventHelper?.onSubscriptionChanged_updateCustomLink()
    }, [window?.OneSignal])
    return (
        <>
            <div
                className={`onesignal-customlink-container ${
                    loading && `hidden`
                }`}
                onClick={async (e) => {
                    try {
                        setLoading(true)
                        const session = localStorage.getItem("session")
                        const res = await fetch(
                            `/api/getNotifySubscribed/${session}`,
                            {
                                method: "GET",
                            }
                        )
                        if (res.status !== 200) return
                        const json = await res.json()
                        if (
                            //@ts-ignore
                            e?.target?.className.includes("state-subscribed")
                        ) {
                            console.log("un subscribed")
                        } else {
                            if (!(Object.keys(json.res).length >= 1)) {
                                console.log("subscribed")
                                const res = await fetch(
                                    `/api/setNotifySubscribed/set`,
                                    {
                                        method: "POST",
                                        body: session,
                                    }
                                )
                            }
                        }
                    } catch (e) {
                        console.log(e)
                    } finally {
                        setLoading(false)
                    }
                }}
            />
            <Spinner className={`${!loading && `hidden`}`} />
        </>
    )
}

export default OneSignalCustomLinkContainer
