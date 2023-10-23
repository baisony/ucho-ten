import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faRss } from "@fortawesome/free-solid-svg-icons"
import "react-circular-progressbar/dist/styles.css"
import { Image, Skeleton } from "@nextui-org/react"
import "react-swipeable-list/dist/styles.css"
import { useRouter } from "next/navigation"
import { viewFeedCard } from "@/app/_components/ViewFeedCard/styles"
import { GeneratorView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { AtUri } from "@atproto/api"
import { useNextQueryParamsAtom } from "@/app/_atoms/nextQueryParams"

interface Props {
    className?: string
    color: "light" | "dark"
    isMobile?: boolean
    isSkeleton?: boolean
    now?: Date
    feed: GeneratorView
}

export const ViewFeedCard: React.FC<Props> = (props: Props) => {
    const router = useRouter()
    const [nextQueryParams] = useNextQueryParamsAtom()
    const { className, color, isMobile, isSkeleton, feed } = props
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

    return (
        <>
            <main
                className={`${PostCard({ color: color })} cursor-pointer`}
                onClick={(e) => {
                    e.stopPropagation()
                    const uri = new AtUri(feed.uri)
                    router.push(
                        `/profile/${uri.hostname}/feed/${
                            uri.rkey
                        }?${nextQueryParams.toString()}`
                    )
                }}
            >
                <>
                    <>
                        <div
                            className={`${PostCardContainer({
                                isMobile: isMobile,
                            })}`}
                        >
                            <div className={`${PostAuthor()}`}>
                                <span className={PostAuthorIcon()}>
                                    {isSkeleton ? (
                                        <Skeleton
                                            className={skeletonIcon({
                                                color: color,
                                            })}
                                        />
                                    ) : (
                                        <>
                                            {feed?.avatar ? (
                                                <Image
                                                    src={feed.avatar}
                                                    //radius={"lg"}
                                                    className={` z-[0] rounded-[7px]`}
                                                    alt={feed.did}
                                                />
                                            ) : (
                                                <FontAwesomeIcon
                                                    className={`z-[0] h-full w-full`}
                                                    icon={faRss}
                                                />
                                            )}
                                        </>
                                    )}
                                </span>
                                <span
                                    className={PostAuthorDisplayName({
                                        color: color,
                                    })}
                                    style={{ fontSize: "13px" }}
                                >
                                    {isSkeleton ? (
                                        <Skeleton
                                            className={skeletonName({
                                                color: color,
                                            })}
                                        />
                                    ) : (
                                        <span>{feed?.displayName}</span>
                                    )}
                                </span>
                                <div className={"text-[#BABABA]"}>
                                    &nbsp;-&nbsp;
                                </div>
                                <span
                                    className={PostAuthorHandle({
                                        color: color,
                                    })}
                                >
                                    {isSkeleton ? (
                                        <Skeleton
                                            className={skeletonHandle({
                                                color: color,
                                            })}
                                        />
                                    ) : (
                                        <span>
                                            made by @{feed?.creator?.handle}
                                        </span>
                                    )}
                                </span>
                            </div>
                            <div
                                className={PostContent({ isMobile: isMobile })}
                            >
                                {isSkeleton ? (
                                    <div className="w-full flex flex-col gap-2">
                                        <Skeleton
                                            className={skeletonText1line({
                                                color: color,
                                            })}
                                        />
                                        <Skeleton
                                            className={skeletonText2line({
                                                color: color,
                                            })}
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <div
                                            style={{ wordBreak: "break-word" }}
                                            className={`${
                                                isMobile
                                                    ? `text-[14px]`
                                                    : `text-[15px]`
                                            }`}
                                        >
                                            {feed.description}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </>
                </>
            </main>
        </>
    )
}

export default ViewFeedCard
