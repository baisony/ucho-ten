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
import { isMobile } from "react-device-detect"
import { ListFooterSpinner } from "@/app/_components/ListFooterSpinner"
import { ListFooterNoContent } from "@/app/_components/ListFooterNoContent"
import { Virtuoso } from "react-virtuoso"
import { tabBarSpaceStyles } from "@/app/_components/TabBar/tabBarSpaceStyles"

export default function Root() {
    const [, setCurrentMenuType] = useCurrentMenuType()
    setCurrentMenuType("bookmarks")

    const { t } = useTranslation()
    const { nullTimeline, notNulltimeline } = tabBarSpaceStyles()
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
        console.log(bookmarks)
        for (let i = 0; i < bookmarks.length; i += maxBatchSize) {
            const batch = bookmarks
                .slice(i, i + maxBatchSize)
                .map((bookmark) => bookmark.uri)
            batches.push(batch)
        }
        //console.log(batches)
        const results = []
        for (const batch of batches) {
            //@ts-ignore
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
            <div className={"h-full w-full z-[100]"}>
                {timeline.length !== 0 && (
                    <Virtuoso
                        scrollerRef={(ref) => {
                            if (ref instanceof HTMLElement) {
                                //scrollRef.current = ref
                            }
                        }}
                        //context={{ hasMore }}
                        overscan={200}
                        increaseViewportBy={200}
                        data={timeline}
                        atTopThreshold={100}
                        atBottomThreshold={100}
                        itemContent={(index, data) => (
                            <ViewPostCard
                                key={`bookmark-${data.uri}`}
                                {...{
                                    isTop: index === 0,
                                    isMobile,
                                    isSkeleton: false,
                                    bodyText: processPostBodyText(
                                        nextQueryParams,
                                        data || null
                                    ),
                                    postJson: data || null,
                                    nextQueryParams,
                                    t,
                                    handleValueChange: handleValueChange,
                                }}
                            />
                        )}
                        //endReached={loadMore}
                        className={nullTimeline()}
                    />
                )}
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
