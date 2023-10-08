"use client"
import { useAgent } from "@/app/_atoms/agent"
import { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUser } from "@fortawesome/free-solid-svg-icons"
import {
    faPlus,
    faThumbTack,
    faBars,
    faGear,
} from "@fortawesome/free-solid-svg-icons"
import { GeneratorView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"

export default function Root() {
    const [agent] = useAgent()
    const [userPreferences, setUserPreferences] = useState<any>(undefined)
    const [savedFeeds, setSavedFeeds] = useState<string[]>([])
    const [pinnedFeeds, setPinnedFeeds] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const fetchFeeds = async () => {
        if (!agent) return
        try {
            const { feeds } = await agent.getPreferences()
            setUserPreferences(feeds)
            const saved = await agent.app.bsky.feed.getFeedGenerators({
                feeds: feeds.saved as string[],
            })
            const pinned = await agent.app.bsky.feed.getFeedGenerators({
                feeds: feeds.pinned as string[],
            })
            setSavedFeeds((saved.data as any).feeds || [])
            setPinnedFeeds((pinned.data as any).feeds || [])
        } catch (e) {
            console.log(e)
        }
    }

    useEffect(() => {
        fetchFeeds()
    }, [agent])

    return (
        <>
            {/*@ts-ignore*/}
            {savedFeeds.map((feed: GeneratorView, index) => {
                return (
                    <div
                        className={
                            "flex items-center bg-[#2C2C2C] text-white w-full h-[80px] justify-between select-none"
                        }
                        key={index}
                    >
                        <div className={"flex items-center ml-[12px]"}>
                            <div>
                                <FontAwesomeIcon
                                    icon={faBars}
                                    className={"text-gray-400"}
                                />
                            </div>
                            <div
                                className={
                                    "h-[50px] w-[50px] overflow-hidden rounded-[10px] ml-[12px]"
                                }
                            >
                                <img src={feed?.avatar} />
                            </div>
                            <div className={"ml-[12px]"}>
                                <div>{feed?.displayName}</div>
                                <div className={"text-[12px]"}>
                                    by @{feed?.creator?.handle}
                                </div>
                            </div>
                        </div>
                        <div className={"mr-[28px] flex items-center"}>
                            <div className={"mr-[28px] cursor-pointer"}>
                                <FontAwesomeIcon
                                    icon={faThumbTack}
                                    size={"lg"}
                                    className={` ${
                                        userPreferences.pinned.includes(
                                            feed.uri
                                        )
                                            ? `text-[#016EFF]`
                                            : `text-white`
                                    }`}
                                    onClick={async () => {
                                        if (
                                            userPreferences.pinned.includes(
                                                feed.uri
                                            )
                                        ) {
                                            if (isLoading) return
                                            setIsLoading(true)
                                            const res =
                                                await agent?.removePinnedFeed(
                                                    feed.uri
                                                )
                                            fetchFeeds()
                                            setIsLoading(false)
                                            console.log(res)
                                        } else {
                                            if (isLoading) return
                                            setIsLoading(true)
                                            const res =
                                                await agent?.addPinnedFeed(
                                                    feed.uri
                                                )
                                            fetchFeeds()
                                            setIsLoading(false)
                                            console.log(res)
                                        }
                                    }}
                                />
                            </div>
                            <div className={"cursor-pointer"}>
                                <FontAwesomeIcon icon={faGear} size={"lg"} />
                            </div>
                        </div>
                    </div>
                )
            })}
        </>
    )
}
