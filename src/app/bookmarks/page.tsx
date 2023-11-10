"use client"
import { useBookmarks } from "@/app/_atoms/bookmarks"
import { useAgent } from "@/app/_atoms/agent"
import React, { useEffect, useState } from "react"
import { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { ViewPostCard } from "@/app/_components/ViewPostCard"
import { useNextQueryParamsAtom } from "../_atoms/nextQueryParams"
import { useTranslation } from "react-i18next"
import { useCurrentMenuType } from "../_atoms/headerMenu"
import { processPostBodyText } from "../_lib/post/processPostBodyText"
import { DummyHeader } from "@/app/_components/DummyHeader"

export default function Root() {
    const [, setCurrentMenuType] = useCurrentMenuType()
    setCurrentMenuType("bookmarks")

    const { t } = useTranslation()

    const [agent] = useAgent()
    const [nextQueryParams] = useNextQueryParamsAtom()
    const [bookmarks, setBookmarks] = useBookmarks()
    const [timeline, setTimeline] = useState<PostView[]>([])

    const fetchBookmarks = async () => {
        if (!agent) {
            return
        }
        const maxBatchSize = 25 // 1つのリクエストに許容される最大数
        const batches = []
        //console.log(bookmarks[0][agent?.session?.did])
        for (
            let i = 0;
            i < bookmarks[0][agent?.session?.did as string].length;
            i += maxBatchSize
        ) {
            const batch = bookmarks[0][agent?.session?.did as string]
                .slice(i, i + maxBatchSize)
                .map((bookmark) => bookmark.uri)
            batches.push(batch)
        }
        //console.log(batches)
        const results = []
        for (const batch of batches) {
            const { data } = await agent?.getPosts({ uris: batch })
            const { posts } = data
            results.push(...posts)
        }
        setTimeline(results)
    }

    const handleValueChange = (newValue: any) => {
        //setText(newValue);
        console.log(newValue)
        console.log(timeline)
        if (!timeline) return
        const foundObject = timeline.findIndex(
            (item) => item.uri === newValue.postUri
        )

        if (foundObject !== -1) {
            console.log(timeline[foundObject])
            switch (newValue.reaction) {
                case "like":
                    setTimeline((prevData) => {
                        //@ts-ignore
                        const updatedData = [...prevData]
                        if (
                            updatedData[foundObject] &&
                            updatedData[foundObject]?.viewer
                        ) {
                            updatedData[foundObject].viewer!.like =
                                newValue.reactionUri
                        }
                        return updatedData
                    })
                    break
                case "unlike":
                    setTimeline((prevData) => {
                        const updatedData = [...prevData]
                        if (
                            updatedData[foundObject] &&
                            updatedData[foundObject]?.viewer
                        ) {
                            updatedData[foundObject].viewer!.like = undefined
                        }
                        return updatedData
                    })
                    break
                case "repost":
                    setTimeline((prevData) => {
                        const updatedData = [...prevData]
                        if (
                            updatedData[foundObject] &&
                            updatedData[foundObject]?.viewer
                        ) {
                            updatedData[foundObject].viewer!.repost =
                                newValue.reactionUri
                        }
                        return updatedData
                    })
                    break
                case "unrepost":
                    setTimeline((prevData) => {
                        const updatedData = [...prevData]
                        if (
                            updatedData[foundObject] &&
                            updatedData[foundObject]?.viewer
                        ) {
                            updatedData[foundObject].viewer!.repost = undefined
                        }
                        return updatedData
                    })
                    break
                case "delete":
                    setTimeline((prevData) => {
                        const updatedData = [...prevData]
                        const removedItem = updatedData.splice(foundObject, 1)
                        return updatedData
                    })
                //timeline.splice(foundObject, 1)
            }
            console.log(timeline)
        } else {
            console.log(
                "指定されたURIを持つオブジェクトは見つかりませんでした。"
            )
        }
    }

    useEffect(() => {
        fetchBookmarks()
    }, [agent])

    return (
        <>
            <DummyHeader />
            <div className={"md:h-full w-full z-[100]"}>
                {timeline.map((post, index) => {
                    return (
                        <ViewPostCard
                            isTop={false}
                            key={index}
                            postJson={post}
                            bodyText={processPostBodyText(
                                nextQueryParams,
                                post
                            )}
                            nextQueryParams={nextQueryParams}
                            t={t}
                            handleValueChange={handleValueChange}
                        />
                    )
                })}
                {timeline.length === 0 && (
                    <div
                        className={
                            "w-full h-full flex items-center justify-center text-black dark:text-white"
                        }
                    >
                        {t("pages.bookmarks.noContent")}
                    </div>
                )}
            </div>
        </>
    )
}
