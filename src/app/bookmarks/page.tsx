"use client"
import { useBookmarks } from "@/app/_atoms/bookmarks"
import { useAgent } from "@/app/_atoms/agent"
import React, { useEffect, useState } from "react"
import { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { ViewPostCard } from "@/app/_components/ViewPostCard"
import { useNextQueryParamsAtom } from "../_atoms/nextQueryParams"
import { useTranslation } from "react-i18next"

export default function Root() {
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
        for (let i = 0; i < bookmarks.length; i += maxBatchSize) {
            const batch = bookmarks
                .slice(i, i + maxBatchSize)
                .map((bookmark) => bookmark.uri)
            batches.push(batch)
        }
        const results = []
        for (const batch of batches) {
            const { data } = await agent?.getPosts({ uris: batch })
            const { posts } = data
            results.push(...posts)
        }
        setTimeline(results)
    }

    useEffect(() => {
        fetchBookmarks()
    }, [agent])

    return (
        <>
            <div className={"md:h-[100px] h-[85px]"} />
            <div className={"md:h-full w-full"}>
                {timeline.map((post, index) => {
                    return (
                        <ViewPostCard
                            key={index}
                            postJson={post}
                            nextQueryParams={nextQueryParams}
                            t={t}
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
