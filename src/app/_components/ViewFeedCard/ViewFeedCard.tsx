import defaultFeedIcon from "@/../public/images/icon/default_feed_icon.svg"
import { Skeleton } from "@nextui-org/react"
import { viewFeedCard } from "@/app/_components/ViewFeedCard/styles"
import { GeneratorView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { AtUri } from "@atproto/api"
import { useNextQueryParamsAtom } from "@/app/_atoms/nextQueryParams"
import Link from "next/link"
import { memo } from "react"

interface Props {
    className?: string
    isSkeleton?: boolean
    now?: Date
    feed: GeneratorView
}

export const ViewFeedCard: React.FC<Props> = memo((props: Props) => {
    const [nextQueryParams] = useNextQueryParamsAtom()
    const { isSkeleton, feed } = props
    const {
        PostCard,
        PostAuthor,
        PostContent,
        PostCardContainer,
        PostAuthorIcon,
        PostAuthorDisplayName,
        PostAuthorHandle,
        skeletonIcon,
        skeletonName,
        skeletonHandle,
        skeletonText1line,
        skeletonText2line,
    } = viewFeedCard()

    const uriToURL = (uri: string) => {
        const url = new AtUri(uri)
        return `/profile/${url.hostname}/feed/${
            url.rkey
        }?${nextQueryParams.toString()}` as string
    }

    return (
        <main className={`${PostCard()} cursor-pointer`}>
            <Link
                onClick={(e) => {
                    e.stopPropagation()
                }}
                href={uriToURL(feed.uri)}
            >
                <div className={`${PostCardContainer()}`}>
                    <div className={`${PostAuthor()}`}>
                        <span className={PostAuthorIcon()}>
                            {isSkeleton ? (
                                <Skeleton className={skeletonIcon()} />
                            ) : (
                                <img
                                    src={feed?.avatar || defaultFeedIcon.src}
                                    //radius={"lg"}
                                    className={` z-[0] rounded-[7px]`}
                                    alt={feed.did}
                                />
                            )}
                        </span>
                        <span
                            className={PostAuthorDisplayName()}
                            style={{ fontSize: "13px" }}
                        >
                            {isSkeleton ? (
                                <Skeleton className={skeletonName()} />
                            ) : (
                                <span>{feed?.displayName}</span>
                            )}
                        </span>
                        <div className={"text-[#BABABA]"}>&nbsp;-&nbsp;</div>
                        <span className={PostAuthorHandle()}>
                            {isSkeleton ? (
                                <Skeleton className={skeletonHandle()} />
                            ) : (
                                <span>made by @{feed?.creator?.handle}</span>
                            )}
                        </span>
                    </div>
                    <div className={PostContent()}>
                        {isSkeleton ? (
                            <div className="w-full flex flex-col gap-2">
                                <Skeleton className={skeletonText1line()} />
                                <Skeleton className={skeletonText2line()} />
                            </div>
                        ) : (
                            <>
                                <div
                                    style={{ wordBreak: "break-word" }}
                                    className={`text-[14px] md:text-[15px]`}
                                >
                                    {feed.description}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </Link>
        </main>
    )
})

export default ViewFeedCard
