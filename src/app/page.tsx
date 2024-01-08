"use client"
import { useEffect, useState } from "react"
import { BskyAgent } from "@atproto/api"
import { Button, Spinner } from "@nextui-org/react"
import { useRouter, useSearchParams } from "next/navigation"
import { isMobile } from "react-device-detect"
import { useAccounts, UserAccountByDid } from "@/app/_atoms/accounts"
import { useIsSessionExpired } from "@/app/_atoms/sessionExpired"
import Image from "next/image"
import logoImage from "@/../public/images/logo/ucho-ten.svg"

export default function CreateLoginPage() {
    const router = useRouter()
    const [accounts, setAccounts] = useAccounts()
    const [, setLoading] = useState(false)
    const [server] = useState<string>("bsky.social")
    const [user] = useState<string>("")
    const [password] = useState<string>("")
    const searchParams = useSearchParams()
    const toRedirect = searchParams.get("toRedirect")
    const [identifierIsByAutocomplete] = useState<boolean>(false)
    const [passwordIsByAutocomplete] = useState<boolean>(false)
    const [, setIsUserInfoIncorrect] = useState<boolean>(false)
    const [, setIsServerError] = useState<boolean>(false)
    const [isSetAccount, setIsSetAccount] = useState<boolean | null>(null)
    const [isSessionExpired, setIsSessionExpired] = useIsSessionExpired()

    const agent = new BskyAgent({ service: `https://${server}` })

    const handleLogin = async () => {
        if (user.trim() == "" || password.trim() == "") {
            return
        }

        setLoading(true)

        try {
            const res = await agent.login({
                identifier: user,
                password: password,
            })
            const { data } = res
            console.log(data)
            console.log(process.env.NEXT_PUBLIC_PRODUCTION_ENV)
            if (process.env.NEXT_PUBLIC_PRODUCTION_ENV === "true") {
                const tester = process.env.NEXT_PUBLIC_TESTER_DID?.split(",")
                const isMatchingPath = tester?.includes(data?.did)
                console.log(isMatchingPath)
                if (!isMatchingPath) {
                    setIsUserInfoIncorrect(true)
                    setLoading(false)
                    return
                }
            }

            setLoading(false)
            console.log(agent)

            if (agent.session !== undefined) {
                const json = {
                    server: server,
                    session: agent.session,
                }

                localStorage.setItem("session", JSON.stringify(json))

                const existingAccountsData: UserAccountByDid = accounts

                const { data } = await agent.getProfile({
                    actor: agent.session.did,
                })

                existingAccountsData[agent.session.did] = {
                    service: server,
                    session: agent.session,
                    profile: {
                        did: agent.session.did,
                        displayName: data?.displayName || agent.session.handle,
                        handle: agent.session.handle,
                        avatar: data?.avatar || "",
                    },
                }

                setAccounts(existingAccountsData)
            }

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
        } catch (e) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            switch (e?.status as number) {
                case 401:
                    setIsUserInfoIncorrect(true)
                    break
                case 500:
                    setIsServerError(true)
                    break
            }
            setLoading(false)
        }
    }

    useEffect(() => {
        const resumesession = async () => {
            try {
                const storedData = localStorage.getItem("session")
                if (storedData) {
                    const { session } = JSON.parse(storedData)
                    await agent.resumeSession(session)
                    setIsSessionExpired(false)

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
                if (isSessionExpired) {
                    setIsSetAccount(false)
                } else {
                    setIsSessionExpired(true)
                    console.log(e)
                    router.push("/login")
                }
            }
        }
        void resumesession()
    }, [])

    useEffect(() => {
        if (!isMobile) return
        if (
            (identifierIsByAutocomplete || passwordIsByAutocomplete) &&
            user.trim() !== "" &&
            password.trim() !== ""
        ) {
            void handleLogin()
        }
    }, [identifierIsByAutocomplete, passwordIsByAutocomplete, user, password])

    return (
        <>
            <div className={"h-full w-full bg-black"}>
                <div
                    className={
                        "h-full w-full bg-black pl-[30px] pr-[30px] pt-[100px] pb-[100px] flex flex-col justify-center items-center"
                    }
                >
                    {isSetAccount === false && (
                        <div className="">
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
                        </div>
                    )}
                    {isSetAccount === null && <Spinner />}
                </div>
            </div>
        </>
    )
}
