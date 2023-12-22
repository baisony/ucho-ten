import { GeneratorView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { Image, Skeleton } from "@nextui-org/react"
import defaultIcon from "../../../../public/images/icon/default_icon.svg"
import React from "react"
import { layout } from "@/app/search/styles"
import Link from "next/link"
import { AtUri } from "@atproto/api"
import { DummyHeader } from "@/app/_components/DummyHeader"

export interface ViewFeedCardCellProps {
    isTop: boolean
    className?: string
    isSkeleton?: boolean
    now?: Date
    feed: GeneratorView
    nextQueryParams: URLSearchParams
    t: any
    isSearchScreen?: boolean
}

export const ViewFeedCardCell = (props: ViewFeedCardCellProps) => {
    const { userCard } = layout()
    const { isTop, isSkeleton, feed, nextQueryParams } = props
    const feedURI = new AtUri(feed.uri)
    return (
        <>
            {isTop && <DummyHeader isSearchScreen={props.isSearchScreen} />}

            <Link
                className={`${userCard()}`}
                style={{ cursor: isSkeleton ? "default" : "pointer" }}
                href={`/profile/${feedURI.hostname}/feed/${
                    feedURI.rkey
                }?${nextQueryParams.toString()}`}
            >
                <div className={"h-[35px] w-[35px] rounded-[10px] ml-[10px]"}>
                    {isSkeleton && (
                        <Skeleton
                            className={`h-full w-full`}
                            style={{ borderRadius: "10px" }}
                        />
                    )}
                    {!isSkeleton && (
                        <Image
                            className={`h-[35px] w-[35px] z-[0]`}
                            src={feed?.avatar || defaultIcon.src}
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
