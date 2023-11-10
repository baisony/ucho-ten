"use client"

import React, { useState } from "react"
import { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { useNextQueryParamsAtom } from "./_atoms/nextQueryParams"
import { Button, Spinner } from "@nextui-org/react"
import Link from "next/link"
import { useTranslation } from "react-i18next"
import { useBookmarks } from "@/app/_atoms/bookmarks"
import { useAgent } from "@/app/_atoms/agent"
import { useCurrentMenuType } from "@/app/_atoms/headerMenu"

export default function Root() {
    const { t } = useTranslation()

    const [agent] = useAgent()
    const [nextQueryParams] = useNextQueryParamsAtom()
    const [bookmarks, setBookmarks] = useBookmarks()
    const [timeline, setTimeline] = useState<PostView[]>([])

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
