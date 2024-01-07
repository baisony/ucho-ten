import defaultFeedIcon from "@/../public/images/icon/default_feed_icon.svg"
import { Skeleton } from "@nextui-org/react"
import "react-swipeable-list/dist/styles.css"
import { viewFeedCard } from "@/app/_components/ViewFeedCard/styles"
import { ListView } from "@atproto/api/dist/client/types/app/bsky/graph/defs"
import { AtUri } from "@atproto/api"
import { useNextQueryParamsAtom } from "@/app/_atoms/nextQueryParams"
import Link from "next/link"

interface Props {
    className?: string
    isSkeleton?: boolean
    now?: Date
    list: ListView
}

export const ViewMuteListCard: React.FC<Props> = (props: Props) => {
    const [nextQueryParams] = useNextQueryParamsAtom()
    const { isSkeleton, list } = props
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
        return `/profile/${url.hostname}/lists/${
            url.rkey
        }?${nextQueryParams.toString()}` as string
    }

    return (
        <main className={`${PostCard()} cursor-pointer`}>
            <Link
                onClick={(e) => {
                    e.stopPropagation()
                }}
                href={uriToURL(list.uri)}
            >
                <div className={`${PostCardContainer()}`}>
                    <div className={`${PostAuthor()}`}>
                        <span className={PostAuthorIcon()}>
                            {isSkeleton ? (
                                <Skeleton className={skeletonIcon()} />
                            ) : (
                                <img
                                    src={list?.avatar || defaultFeedIcon.src}
                                    className={` z-[0] rounded-[7px]`}
                                    alt={list?.uri}
                                    loading={"eager"}
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
                                list?.purpose ===
                                    "app.bsky.graph.defs#modlist" && (
                                    <span>{list?.name}</span>
                                )
                            )}
                        </span>
                        <div className={"text-[#BABABA]"}>&nbsp;-&nbsp;</div>
                        <span className={PostAuthorHandle()}>
                            {isSkeleton ? (
                                <Skeleton className={skeletonHandle()} />
                            ) : (
                                <span>
                                    Mute list made by @{list?.creator?.handle}
                                </span>
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
                                    {list.description}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </Link>
        </main>
    )
}

export default ViewMuteListCard
