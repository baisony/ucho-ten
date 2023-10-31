import React from "react"
import defaultFeedIcon from "@/../public/images/icon/default_feed_icon.svg"
import "react-circular-progressbar/dist/styles.css"
import { Image, Skeleton } from "@nextui-org/react"
import "react-swipeable-list/dist/styles.css"
import { viewNotFoundCard } from "@/app/_components/ViewNotFoundCard/styles"
import { GeneratorView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { AtUri } from "@atproto/api"
import { useNextQueryParamsAtom } from "@/app/_atoms/nextQueryParams"
import Link from "next/link"

interface Props {
    className?: string
}

export const ViewNotFoundCard: React.FC<Props> = (props: Props) => {
    const [nextQueryParams] = useNextQueryParamsAtom()
    const { PostCard } = viewNotFoundCard()

    return (
        <main className={`${PostCard()} cursor-pointer`}>
            <div className={"w-full h-[50px] flex items-center ml-[20px]"}>
                Content not found
            </div>
        </main>
    )
}

export default ViewNotFoundCard
