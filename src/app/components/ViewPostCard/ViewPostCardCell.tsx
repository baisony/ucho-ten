import {
    FeedViewPost,
    PostView,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { ViewPostCard } from "."

interface Props {
    className?: string
    color: "light" | "dark"
    isMobile?: boolean
    uploadImageAvailable?: boolean
    isDragActive?: boolean
    open?: boolean
    numbersOfImage?: 0 | 1 | 2 | 3 | 4
    postJson?: PostView
    isSkeleton?: boolean
    json?: FeedViewPost
    isEmbedToModal?: boolean
    now?: Date
    isDummyHeader?: boolean
    nextQueryParams: URLSearchParams
}

export const ViewPostCardCell = (props: Props) => {
    const { isDummyHeader } = props

    return isDummyHeader ? (
        <div style={{ height: "100px" }} />
    ) : (
        <ViewPostCard {...props} />
    )
}
