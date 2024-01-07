import { GeneratorView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { Skeleton } from "@nextui-org/react"
import defaultFeedIcon from "@/../public/images/icon/default_feed_icon.svg"

import { layout } from "@/app/search/styles"
import Link from "next/link"
import { AtUri } from "@atproto/api"

export interface ViewFeedCardCellProps {
    className?: string
    isSkeleton?: boolean
    now?: Date
    feed: GeneratorView
    nextQueryParams: URLSearchParams
    t: any
    isSearchScreen?: boolean
    handleSaveScrollPosition?: () => void
}

export const ViewFeedCardCell = (props: ViewFeedCardCellProps) => {
    const { userCard } = layout()
    const { isSkeleton, feed, nextQueryParams } = props
    const feedURI = new AtUri(feed.uri)
    return (
        <>
            <Link
                className={`${userCard()}`}
                style={{ cursor: isSkeleton ? "default" : "pointer" }}
                href={`/profile/${feedURI.hostname}/feed/${
                    feedURI.rkey
                }?${nextQueryParams.toString()}`}
                onClick={() => {
                    if (props.handleSaveScrollPosition) {
                        props.handleSaveScrollPosition()
                    }
                }}
            >
                <div className={"h-[35px] w-[35px] rounded-[10px] ml-[10px]"}>
                    {isSkeleton && (
                        <Skeleton
                            className={`h-full w-full`}
                            style={{ borderRadius: "10px" }}
                        />
                    )}
                    {!isSkeleton && (
                        <img
                            className={`h-[35px] w-[35px] z-[0]`}
                            src={feed?.avatar || defaultFeedIcon.src}
                            alt={"avatar image"}
                        />
                    )}
                </div>
                <div className={"h-[50px] w-[calc(100%-50px)] pl-[10px]"}>
                    <div className={"w-full"}>
                        <div className={"text-[15px]"}>
                            {isSkeleton && (
                                <Skeleton
                                    className={`h-[15px] w-[100px]`}
                                    style={{ borderRadius: "10px" }}
                                />
                            )}
                            {!isSkeleton && feed?.displayName}
                        </div>
                        <div className={" text-[13px] text-gray-500"}>
                            {isSkeleton && (
                                <Skeleton
                                    className={`h-[13px] w-[200px] mt-[10px] mb-[10px]`}
                                    style={{ borderRadius: "10px" }}
                                />
                            )}
                            {!isSkeleton && `by @${feed.creator?.handle}`}
                        </div>
                    </div>
                    <div
                        className={"w-full text-[13px]"}
                        style={{
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                        }}
                    >
                        {isSkeleton && (
                            <Skeleton
                                className={`h-[13px] w-full mt-[10px] mb-[10px]`}
                                style={{ borderRadius: "10px" }}
                            />
                        )}
                        {!isSkeleton && feed?.description}
                    </div>
                </div>
            </Link>
        </>
    )
}
