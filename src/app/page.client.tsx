"use client"
import { useLayoutEffect, useState } from "react"
import { BskyAgent } from "@atproto/api"
import { Button, Spinner } from "@nextui-org/react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import logoImage from "@/../public/images/logo/ucho-ten.svg"

export default function CreateLoginPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const toRedirect = searchParams.get("toRedirect")
    const [isSetAccount, setIsSetAccount] = useState<boolean | null>(null)

    useLayoutEffect(() => {
        const resumesession = async () => {
            try {
                const storedData = localStorage.getItem("session")
                if (storedData) {
                    const { session } = JSON.parse(storedData)
                    const { server } = JSON.parse(storedData)
                    const agent = new BskyAgent({
                        service: `https://${server}`,
                    })
                    await agent.resumeSession(session)

                    if (toRedirect) {
                        const url = `/${toRedirect}${
                            searchParams ? `&${searchParams}` : ``
                        }`
                        const paramName = "toRedirect"
                        router.push(
                            url.replace(
                                new RegExp(`[?&]${paramName}=[^&]*(&|$)`, "g"), // パラメータを正確に一致させる正規表現
                                "?"
                            )
                        )
                    } else {
                        router.push("/home")
                    }
                } else {
                    setIsSetAccount(false)
                }
            } catch (e) {
                router.push("/login")
            }
        }
        void resumesession()
    }, [])

    return (
        <>
            <div className={"h-full w-full bg-black"}>
                <div
                    className={
                        "h-full w-full bg-black pl-[30px] pr-[30px] pt-[100px] pb-[100px] flex flex-col justify-center items-center"
                    }
                >
                    {isSetAccount === false && (
                        <>
                            <Image
                                src={logoImage}
                                className="h-[40px] md:h-[50px] w-full mb-[250px]"
                                alt="Logo"
                                height={50}
                                width={320}
                                loading={"eager"}
                                decoding={"async"}
                            />
                            <div
                                className={
                                    "w-full flex items-center justify-center"
                                }
                            >
                                <Button
                                    className={
                                        "w-80 h-14 bg-neutral-700 bg-opacity-50 rounded-2xl flex items-center justify-center mb-4"
                                    }
                                    isDisabled={true}
                                >
                                    <div className="text-zinc-400 text-xl font-bold">
                                        Create a new account
                                    </div>
                                </Button>
                            </div>
                            <div
                                className={
                                    "w-full flex items-center justify-center"
                                }
                            >
                                <Button
                                    className={
                                        "w-80 h-14 bg-neutral-700 bg-opacity-50 rounded-2xl flex items-center justify-center"
                                    }
                                    onClick={() => {
                                        router.push("/login")
                                    }}
                                >
                                    <div className="text-zinc-400 text-xl font-bold">
                                        Sign In
                                    </div>
                                </Button>
                            </div>
                        </>
                    )}
                    {isSetAccount === null && <Spinner />}
                </div>
            </div>
        </>
    )
}
