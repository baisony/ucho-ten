import { memo, useMemo } from "react"
import defaultIcon from "@/../public/images/icon/default_icon.svg"
import { Linkcard } from "../Linkcard"
import { ScrollShadow, Skeleton } from "@nextui-org/react"
import { formattedSimpleDate } from "@/app/_lib/strings/datetime"
import { useImageGalleryAtom } from "@/app/_atoms/imageGallery"
import { viewQuoteCard } from "@/app/_components/ViewQuoteCard/styles"
import Link from "next/link"
import { useRouter } from "next/navigation"
import useHandleImageClick from "@/app/_components/ViewPostCard/lib/handleDisplayImage"
import {
    FeedViewPost,
    PostView,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs"
import { ViewImage } from "@atproto/api/dist/client/types/app/bsky/embed/images"
import { ViewRecord } from "@atproto/api/dist/client/types/app/bsky/embed/record"
import { Record } from "@atproto/api/dist/client/types/app/bsky/feed/post"
import {
    AppBskyEmbedExternal,
    AppBskyEmbedImages,
    AppBskyFeedDefs,
    AppBskyFeedPost,
} from "@atproto/api"

interface Props {
    className?: string
    postJson?: ViewRecord | PostView | null
    isSkeleton?: boolean
    json?: FeedViewPost
    isEmbedToModal?: boolean
    now?: Date
    isEmbedReportModal?: boolean
    profile?: ProfileViewDetailed | null
    nextQueryParams: URLSearchParams
}

export const ViewQuoteCard: React.FC<Props> = memo((props: Props) => {
    const router = useRouter()
    const [, setImageGallery] = useImageGalleryAtom()
    const {
        postJson,
        isSkeleton,
        isEmbedToModal,
        now,
        isEmbedReportModal,
        profile,
        nextQueryParams,
    } = props
    const {
        PostCard,
        PostAuthor,
        PostContent,
        PostCardContainer,
        PostAuthorIcon,
        PostAuthorDisplayName,
        PostAuthorHandle,
        PostCreatedAt,
        skeletonIcon,
        skeletonName,
        skeletonHandle,
        skeletonText1line,
        skeletonText2line,
    } = viewQuoteCard()

    const renderTextWithLinks = useMemo(() => {
        if (!postJson?.value && !(postJson?.record as Record)?.text) return
        const post: JSX.Element[] = []
        let postText
        if (AppBskyFeedPost.isRecord(postJson?.value)) {
            postText = postJson?.value?.text
        } else if (
            AppBskyFeedDefs.isPostView(postJson) &&
            AppBskyFeedPost.isRecord(postJson?.record)
        ) {
            postText = postJson?.record?.text
        }
        postText?.split("\n").map((line: string, i: number) => {
            post.push(
                <p key={i}>
                    {line}
                    <br />
                </p>
            )
        })
        return post
    }, [])

    return (
        <>
            <main
                className={`${PostCard()} ${
                    isEmbedToModal
                        ? `bg-transparent border-none`
                        : `cursor-pointer`
                }`}
                //style={{backgroundColor: isEmbedToModal ? 'transparent'}}
                onClick={(e) => {
                    if (isEmbedReportModal) return
                    e.preventDefault()
                    e.stopPropagation()
                    router.push(
                        `/profile/${postJson?.author.did}/post/${
                            postJson?.uri.match(/\/(\w+)$/)?.[1] || ""
                        }?${nextQueryParams.toString()}`
                    )
                }}
            >
                <>
                    <>
                        <div className={`${PostCardContainer()}`}>
                            <div className={"w-full h-full pl-[8px]"}>
                                <div className={`${PostAuthor()}`}>
                                    <Link
                                        className={PostAuthorIcon()}
                                        onClick={(e) => {
                                            if (!isEmbedReportModal) return
                                            e.preventDefault()
                                            e.stopPropagation()
                                        }}
                                        href={`/profile/${
                                            postJson?.author.did
                                        }?${nextQueryParams.toString()}`}
                                    >
                                        {isSkeleton ? (
                                            <Skeleton
                                                className={skeletonIcon()}
                                            />
                                        ) : (
                                            <img
                                                src={
                                                    postJson?.author?.avatar ||
                                                    profile?.avatar ||
                                                    defaultIcon.src
                                                }
                                                className={`${
                                                    isEmbedToModal
                                                        ? `z-[2]`
                                                        : `z-[0]`
                                                } rounded-full w-full h-full`}
                                                alt={postJson?.author.did}
                                            />
                                        )}
                                    </Link>
                                    <Link
                                        className={PostAuthorDisplayName()}
                                        style={{ fontSize: "13px" }}
                                        onClick={(e) => {
                                            if (!isEmbedReportModal) return
                                            e.preventDefault()
                                            e.stopPropagation()
                                        }}
                                        href={`/profile/${
                                            postJson?.author.did
                                        }?${nextQueryParams.toString()}`}
                                    >
                                        {isSkeleton ? (
                                            <Skeleton
                                                className={skeletonName()}
                                            />
                                        ) : (
                                            <span>
                                                {postJson?.author?.displayName}
                                                {profile?.displayName}
                                            </span>
                                        )}
                                    </Link>
                                    <Link
                                        className={PostAuthorHandle()}
                                        onClick={(e) => {
                                            if (!isEmbedReportModal) return
                                            e.preventDefault()
                                            e.stopPropagation()
                                        }}
                                        href={`/profile/${
                                            postJson?.author.did
                                        }?${nextQueryParams.toString()}`}
                                    >
                                        {isSkeleton ? (
                                            <Skeleton
                                                className={skeletonHandle()}
                                            />
                                        ) : (
                                            <span className={"ml-[5px]"}>
                                                @
                                                {postJson?.author?.handle ??
                                                    profile?.handle}
                                            </span>
                                        )}
                                    </Link>
                                    <div
                                        className={PostCreatedAt()}
                                        style={{ fontSize: "12px" }}
                                    >
                                        {!isSkeleton && postJson && (
                                            <div>
                                                {formattedSimpleDate(
                                                    postJson?.indexedAt,
                                                    now || new Date()
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className={PostContent()}>
                                    {isSkeleton ? (
                                        <div className="w-full flex flex-col gap-2">
                                            <Skeleton
                                                className={skeletonText1line()}
                                            />
                                            <Skeleton
                                                className={skeletonText2line()}
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <div
                                                style={{
                                                    wordBreak: "break-word",
                                                }}
                                                className={`text-[14px] md:text-[15px]`}
                                            >
                                                {renderTextWithLinks}
                                            </div>
                                        </>
                                    )}
                                    <div className={"overflow-x-scroll"}>
                                        {AppBskyFeedPost.isRecord(postJson) &&
                                            postJson?.embed &&
                                            (AppBskyEmbedImages.isView(
                                                postJson?.embed
                                            ) ? (
                                                <ScrollShadow
                                                    hideScrollBar
                                                    orientation="horizontal"
                                                >
                                                    <div
                                                        className={`flex overflow-x-auto overflow-y-hidden w-100svw}]`}
                                                    >
                                                        {postJson?.embed?.images?.map(
                                                            (
                                                                image: ViewImage,
                                                                index: number
                                                            ) => (
                                                                <div
                                                                    className={`mt-[10px] mb-[10px] rounded-[7.5px] overflow-hidden min-w-[280px] max-w-[500px] h-[300px] mr-[10px] bg-cover}`}
                                                                    key={`image-${index}`}
                                                                >
                                                                    <img
                                                                        className="w-full h-full z-0 object-cover"
                                                                        src={
                                                                            image?.thumb ||
                                                                            ""
                                                                        }
                                                                        alt={
                                                                            image?.alt
                                                                        }
                                                                        onMouseUp={(
                                                                            e
                                                                        ) =>
                                                                            e.stopPropagation()
                                                                        }
                                                                        onClick={() => {
                                                                            if (
                                                                                !AppBskyEmbedImages.isView(
                                                                                    postJson.embed
                                                                                )
                                                                            )
                                                                                return
                                                                            useHandleImageClick(
                                                                                setImageGallery,
                                                                                postJson
                                                                                    ?.embed
                                                                                    ?.images,
                                                                                index
                                                                            )
                                                                        }}
                                                                    />
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </ScrollShadow>
                                            ) : (
                                                AppBskyEmbedExternal.isView(
                                                    postJson.embed
                                                ) && (
                                                    <Linkcard
                                                        ogpData={
                                                            postJson.embed
                                                                .external
                                                        }
                                                    />
                                                )
                                            ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                </>
            </main>
        </>
    )
})
