"use client"
import { useEffect, useState } from "react"
import { createLoginPage } from "./styles"
import { AtpSessionData, BskyAgent } from "@atproto/api"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faLink,
    faList,
    faLock,
    faUser,
} from "@fortawesome/free-solid-svg-icons"
//import { CircularProgressbar } from 'react-circular-progressbar';
//import 'react-circular-progressbar/dist/styles.css';
import { Button, Spinner } from "@nextui-org/react"
import { useSearchParams } from "next/navigation"
import { isMobile } from "react-device-detect"
//import { useUserProfileDetailedAtom } from "../_atoms/userProfileDetail"
import "./shakeButton.css"
import { useAccounts, UserAccount, UserAccountByDid } from "../_atoms/accounts"

export default function CreateLoginPage() {
    //const [userProfileDetailed, setUserProfileDetailed] =
    //        useUserProfileDetailedAtom()
    const [accounts, setAccounts] = useAccounts()
    const [loading, setLoading] = useState(false)
    const [server, setServer] = useState<string>("bsky.social")
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
    const {
        background,
        LoginForm,
        LoginFormConnectServer,
        LoginFormHandle,
        LoginFormLoginButton,
    } = createLoginPage()

    const agent = new BskyAgent({ service: `https://${server}` })

    const handleLogin = async () => {
        if (user.trim() == "" || password.trim() == "") {
            return
        }

        setIsLoginFailed(false)
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
                    setIsLoginFailed(true)
                    return
                }
            } else {
                return
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

                const accountData: UserAccount = {
                    service: server,
                    session: agent.session,
                    profile: {
                        did: agent.session.did,
                        displayName: data?.displayName || agent.session.handle,
                        handle: agent.session.handle,
                        avatar: data?.avatar || "",
                    },
                }

                existingAccountsData[agent.session.did] = accountData

                setAccounts(existingAccountsData)
            }

            if (toRedirect) {
                const url = `/${toRedirect}${
                    searchParams ? `&${searchParams}` : ``
                }`
                const paramName = "toRedirect"
                location.href = url.replace(
                    new RegExp(`[?&]${paramName}=[^&]*(&|$)`, "g"), // パラメータを正確に一致させる正規表現
                    "?"
                )
            } else {
                location.href = "/"
            }
        } catch (e) {
            setIsLoginFailed(true)
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

    useEffect(() => {
        const resumesession = async () => {
            try {
                const storedData = localStorage.getItem("session")
                if (storedData) {
                    const { session } = JSON.parse(storedData)
                    console.log(await agent.resumeSession(session))

                    if (toRedirect) {
                        const url = `/${toRedirect}${
                            searchParams ? `&${searchParams}` : ``
                        }`
                        const paramName = "toRedirect"
                        location.href = url.replace(
                            new RegExp(`[?&]${paramName}=[^&]*(&|$)`, "g"), // パラメータを正確に一致させる正規表現
                            "?"
                        )
                    } else {
                        location.href = "/"
                    }
                }
            } catch (e) {
                console.log(e)
            }
        }
        resumesession()
    }, [])

    useEffect(() => {
        if (!isMobile) return
        if (
            (identifierIsByAutocomplete || passwordIsByAutocomplete) &&
            user.trim() !== "" &&
            password.trim() !== ""
        ) {
            handleLogin()
        }
    }, [identifierIsByAutocomplete, passwordIsByAutocomplete, user, password])

    return (
        <main className={background()}>
            <div className={LoginForm()}>
                <div className={LoginFormConnectServer()}>
                    <FontAwesomeIcon
                        className={"ml-[4px] text-xl"}
                        icon={faLink}
                    />
                    <FontAwesomeIcon
                        className={"absolute right-[10px] text-xl"}
                        icon={faList}
                    />
                    <input
                        onChange={(e) => {
                            if (isLoginFailed) setIsLoginFailed(false)
                            const isKeyboardInput =
                                e.nativeEvent instanceof InputEvent
                            if (!isKeyboardInput) {
                                setIdentifierByAutocomplete(true)
                                console.log("input by autocomplete")
                            }
                            setServer(e.target.value)
                        }}
                        className={
                            "h-full w-full bg-transparent ml-[12.5px] text-base font-bold outline-none"
                        }
                        placeholder={"bsky.social (default)"}
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
                        placeholder={"handle, did, e-mail"}
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
                                handleLogin()
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
