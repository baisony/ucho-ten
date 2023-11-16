"use client"
import React, { useEffect, useState } from "react"
import { BskyAgent } from "@atproto/api"
//import { CircularProgressbar } from 'react-circular-progressbar';
//import 'react-circular-progressbar/dist/styles.css';
import { Button } from "@nextui-org/react"
import { useSearchParams } from "next/navigation"
import { isMobile } from "react-device-detect"
//import { useUserProfileDetailedAtom } from "../_atoms/userProfileDetail"
import {
    useAccounts,
    UserAccount,
    UserAccountByDid,
} from "@/app/_atoms/accounts"
import Link from "next/link"

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
                location.href = "/home"
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
                        location.href = "/home"
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
        <>
            <div className={"md:h-[100px] h-[85px]"} />
            <div
                className={
                    "h-full w-full bg-black flex justify-center items-end bottom-[100px] relative"
                }
            >
                <div className={"bottom-[100px] absolute"}>
                    <Button
                        className={
                            "w-80 h-14 bottom-[0px] bg-neutral-700 bg-opacity-50 rounded-2xl flex items-center justify-center mb-4"
                        }
                        isDisabled={true}
                    >
                        <div className="text-zinc-400 text-xl font-bold">
                            Create a new account
                        </div>
                    </Button>
                    <Link href={"/login"}>
                        <Button
                            className={
                                "w-80 h-14 bottom-[0px] bg-neutral-700 bg-opacity-50 rounded-2xl flex items-center justify-center"
                            }
                        >
                            <div className="text-zinc-400 text-xl font-bold">
                                Sign In
                            </div>
                        </Button>
                    </Link>
                </div>
            </div>
        </>
    )
}
