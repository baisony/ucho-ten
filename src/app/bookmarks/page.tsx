"use client"
import { useBookmarks } from "@/app/_atoms/bookmarks"
import { useAgent } from "@/app/_atoms/agent"
import { useAppearanceColor } from "@/app/_atoms/appearanceColor"
import { useEffect, useState } from "react"
import { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { ViewPostCard } from "@/app/components/ViewPostCard"

export default function Root() {
    const [agent] = useAgent()
    const [appearanceColor] = useAppearanceColor()
    const [bookmarks, setBookmarks] = useBookmarks()
    const [timeline, setTimeline] = useState<PostView[]>([])
    const [darkMode, setDarkMode] = useState(false)
    const color = darkMode ? "dark" : "light"

    const modeMe = (e: any) => {
        setDarkMode(!!e.matches)
    }
    useEffect(() => {
        if (appearanceColor === "system") {
            const matchMedia = window.matchMedia("(prefers-color-scheme: dark)")

            setDarkMode(matchMedia.matches)
            matchMedia.addEventListener("change", modeMe)

            return () => matchMedia.removeEventListener("change", modeMe)
        } else if (appearanceColor === "dark") {
            setDarkMode(true)
        } else if (appearanceColor === "light") {
            setDarkMode(false)
        }
    }, [appearanceColor])

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
            <div className={"h-full w-full"}>
                {timeline.map((post, index) => {
                    return (
                        <ViewPostCard
                            key={index}
                            postJson={post}
                            color={color}
                        />
                    )
                })}
            </div>
        </>
    )
}
