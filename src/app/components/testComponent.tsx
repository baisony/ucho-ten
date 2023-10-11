import React from "react"
import { Virtuoso } from "react-virtuoso"
import { ViewPostCard } from "./ViewPostCard"
import { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs"

export default function TestComponent({ data }: { data: FeedViewPost[] }) {
    return (
        <Virtuoso
            overscan={100}
            increaseViewportBy={200}
            // useWindowScroll={true}
            // overscan={50}
            data={data}
            initialItemCount={Math.min(18, data.length)}
            atTopThreshold={100}
            atBottomThreshold={100}
            // @ts-ignore
            itemContent={(index, item) => (
                <ViewPostCard
                    {...{
                        color: "light",
                        isMobile: true,
                        isSkeleton: item.isSkeleton,
                        postJson: item.post,
                        json: item,
                    }}
                />
            )}
            // style={{ height: '100%' }}
        />
    )
}
