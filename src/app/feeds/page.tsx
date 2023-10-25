"use client"
import { useAgent } from "@/app/_atoms/agent"
import React, { useEffect, useState } from "react"
import { layout } from "./styles"
import { useRouter } from "next/navigation"
import {
    Button,
    Modal,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Spinner,
    useDisclosure,
} from "@nextui-org/react"
import { AtUri } from "@atproto/api"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faBars,
    faGear,
    faRss,
    faThumbTack,
} from "@fortawesome/free-solid-svg-icons"
import { GeneratorView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { useNextQueryParamsAtom } from "../_atoms/nextQueryParams"

export default function Root() {
    const [agent] = useAgent()
    const router = useRouter()
    const [nextQueryParams] = useNextQueryParamsAtom()
    const { background, FeedCard } = layout()
    const [userPreferences, setUserPreferences] = useState<any>(undefined)
    const [isFetching, setIsFetching] = useState<boolean>(false)
    const [savedFeeds, setSavedFeeds] = useState<string[]>([])
    const [, setPinnedFeeds] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState<boolean | null>(null)
    const [selectedFeed, setSelectedFeed] = useState<GeneratorView | null>(null)
    const { isOpen, onOpen, onOpenChange } = useDisclosure()

    const fetchFeeds = async () => {
        if (!agent) return
        try {
            setIsFetching(true)
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
            setIsFetching(false)
        } catch (e) {
            console.log(e)
        }
    }
    const handleFeedDelete = async () => {
        if (!agent) return
        if (!selectedFeed) return
        try {
            setIsLoading(true)
            const res = await agent.removeSavedFeed(selectedFeed.uri)
            fetchFeeds()
            setIsLoading(false)
            console.log(res)
        } catch (e) {
            console.log(e)
        }
    }

    useEffect(() => {
        fetchFeeds()
    }, [agent])

    return (
        <>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>
                                Would you like to delete{" "}
                                {selectedFeed?.displayName}
                                {" ?"}
                            </ModalHeader>
                            <ModalFooter>
                                <Button
                                    color="danger"
                                    variant="light"
                                    onClick={onClose}
                                >
                                    No
                                </Button>
                                <Button
                                    color="primary"
                                    onClick={() => {
                                        handleFeedDelete()
                                        onClose()
                                    }}
                                >
                                    Yes
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
            {savedFeeds.length === 0 && (
                <div
                    className={`${background()} w-full h-full flex items-center justify-center`}
                >
                    {isFetching ? (
                        <div>
                            <Spinner />
                        </div>
                    ) : (
                        !isFetching ?? (
                            <div className={`text-white dark:text-black`}>
                                ないよー
                            </div>
                        )
                    )}
                </div>
            )}
            {savedFeeds.length !== 0 && (
                <div className={`${background()} w-full h-full`}>
                    {/*@ts-ignore*/}
                    {savedFeeds.map((feed: GeneratorView, index) => {
                        return (
                            <div
                                className={FeedCard()}
                                key={index}
                                onClick={() => {
                                    const uri = new AtUri(feed.uri)
                                    router.push(
                                        `/profile/${uri.hostname}/feed/${
                                            uri.rkey
                                        }?${nextQueryParams.toString()}`
                                    )
                                }}
                            >
                                <div className={"flex items-center ml-[12px]"}>
                                    <div className={"hidden"}>
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
                                        {feed?.avatar ? (
                                            <img src={feed?.avatar} />
                                        ) : (
                                            <FontAwesomeIcon
                                                icon={faRss}
                                                className={"h-full w-full"}
                                            />
                                        )}
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
                                                    : `text-[#929292]`
                                            }`}
                                            onClick={async (e) => {
                                                e.stopPropagation()
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
                                    <div
                                        className={"cursor-pointer"}
                                        onClick={async (e) => {
                                            e.stopPropagation()
                                            setSelectedFeed(feed)
                                            onOpen()
                                        }}
                                    >
                                        <FontAwesomeIcon
                                            icon={faGear}
                                            size={"lg"}
                                            className={"text-[#929292]"}
                                        />
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </>
    )
}
