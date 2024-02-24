"use client"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { createLoginPage } from "./styles"
import { BskyAgent } from "@atproto/api"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faLink,
    faList,
    faLock,
    faUser,
} from "@fortawesome/free-solid-svg-icons"
import { Button, Spinner } from "@nextui-org/react"
import { useRouter, useSearchParams } from "next/navigation"
import { isMobile } from "react-device-detect"
import "./shakeButton.css"
import { useAccounts, UserAccountByDid } from "../_atoms/accounts"
import { useCurrentMenuType } from "@/app/_atoms/headerMenu"
import { useAgent } from "@/app/_atoms/agent"

export default function CreateLoginPage() {
    const [, setCurrentMenuType] = useCurrentMenuType()
    const router = useRouter()
    const [accounts, setAccounts] = useAccounts()
    const [agent, setAgent] = useAgent()
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [isLoginFailed, setIsLoginFailed] = useState<boolean>(false)
    const searchParams = useSearchParams()
    const toRedirect = searchParams.get("toRedirect")
    const [identifierIsByAutocomplete, setIdentifierByAutocomplete] =
        useState<boolean>(false)
    const [passwordIsByAutocomplete, setPasswordByAutocomplete] =
        useState<boolean>(false)
    const [, setIsUserInfoIncorrect] = useState<boolean>(false)
    const [, setIsServerError] = useState<boolean>(false)
    const [defaultService, setDefaultService] = useState<string>()
    const [defaultIdentity, setDefaultIdentity] = useState<string>()
    const {
        background,
        LoginForm,
        LoginFormConnectServer,
        LoginFormHandle,
        LoginFormLoginButton,
    } = createLoginPage()

    function addTldIfMissing(handle: string, pds: string): string {
        if (!handle.includes(".")) {
            return `${handle}.${pds}`
        } else {
            return handle
        }
    }

    const pds = useRef<string>("bsky.social")
    const headerAndSlash = (url: string) => {
        return url.replace(/https?:\/\//, "").replace(/\/$/, "")
    }

    const handleLogin = async () => {
        if (user.trim() == "" || password.trim() == "") {
            return
        }

        setIsLoginFailed(false)
        setLoading(true)

        try {
            const server = headerAndSlash(pds.current)
            const agent = new BskyAgent({ service: `https://${server}` })
            await agent.login({
                identifier: addTldIfMissing(user, server),
                password: password,
            })

            setLoading(false)

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
                setAgent(agent)
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
            setIsLoginFailed(true)
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
            setIsLoginFailed(true)
        }
    }

    useLayoutEffect(() => {
        setCurrentMenuType("login")
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

    useLayoutEffect(() => {
        if (!agent) return
        pds.current = agent?.service.host
        setDefaultService(agent?.service.host)
        setDefaultIdentity(agent?.session?.handle)
    }, [agent])

    return (
        <main className={background()}>
            <div className={LoginForm()}>
                <div className={LoginFormConnectServer()}>
                    <FontAwesomeIcon
                        className={"ml-[4px] text-xl"}
                        icon={faLink}
                    />
                    <input
                        type={"url"}
                        onChange={(e) => {
                            if (isLoginFailed) setIsLoginFailed(false)
                            const isKeyboardInput =
                                e.nativeEvent instanceof InputEvent
                            if (!isKeyboardInput) {
                                setIdentifierByAutocomplete(true)
                                console.log("input by autocomplete")
                            }
                            if (e.target.value !== "") {
                                pds.current = e.target.value
                            } else {
                                pds.current = "bsky.social"
                            }
                        }}
                        className={
                            "h-full w-full bg-transparent ml-[12.5px] text-base font-bold outline-none"
                        }
                        placeholder={"bsky.social"}
                        defaultValue={defaultService}
                    />
                </div>
                <div className={LoginFormHandle({ error: isLoginFailed })}>
                    <FontAwesomeIcon
                        className={`ml-[8px] text-xl ${
                            isLoginFailed && `text-red-600`
                        }`}
                        icon={faUser}
                    />
                    <input
                        type={"text"}
                        value={user}
                        autoComplete={"username"}
                        onChange={(e) => {
                            if (isLoginFailed) setIsLoginFailed(false)
                            const isKeyboardInput =
                                e.nativeEvent instanceof InputEvent
                            if (!isKeyboardInput) {
                                setPasswordByAutocomplete(true)
                                console.log("input by autocomplete")
                            }
                            setUser(e.target.value)
                        }}
                        className={
                            "h-full w-full bg-transparent ml-[16.5px] text-base font-bold outline-none"
                        }
                        placeholder={"handle  did  Email"}
                        defaultValue={defaultIdentity}
                        //autocompleteをした時に背景色を設定されないようにする
                        //style={{WebkitTextFillColor:'white !important', WebkitBoxShadow:'0 0 0px 1000px inset #000000',caretColor: 'white !important' }}
                    />
                </div>
                <div className={LoginFormHandle({ error: isLoginFailed })}>
                    <FontAwesomeIcon
                        className={`ml-[8px] text-xl ${
                            isLoginFailed && `text-red-600`
                        }`}
                        icon={faLock}
                    />
                    <input
                        type={"password"}
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value)
                        }}
                        autoComplete={"current-password"}
                        className={
                            "h-full w-full bg-transparent ml-[16.5px] text-base font-bold outline-none"
                        }
                        placeholder={"password"}
                        //style={{WebkitTextFillColor:'white !important', WebkitBoxShadow:'0 0 0px 1000px inset #000000',caretColor: 'white !important'}}
                        onKeyDown={(e) => {
                            if (
                                e.key === "Enter" &&
                                user.trim() !== "" &&
                                password.trim() !== ""
                            ) {
                                void handleLogin()
                            }
                        }}
                    />
                </div>
                <Button
                    className={`${LoginFormLoginButton()} ${
                        isLoginFailed && `shakeButton`
                    }`}
                    onClick={handleLogin}
                    isDisabled={
                        loading || user.trim() === "" || password.trim() === ""
                    }
                >
                    <div className="text-zinc-400 text-xl font-bold">
                        {loading ? (
                            <Spinner size={"md"} className={"text-white"} />
                        ) : (
                            "Sign In"
                        )}
                    </div>
                </Button>
            </div>
        </main>
    )
}
