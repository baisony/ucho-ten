import React, { useCallback, useMemo } from "react"
import defaultIcon from "@/../public/images/icon/default_icon.svg"
import { Linkcard } from "../Linkcard"
import "react-circular-progressbar/dist/styles.css"
import { Image, ScrollShadow, Skeleton } from "@nextui-org/react"
import "react-swipeable-list/dist/styles.css"
import { formattedSimpleDate } from "@/app/_lib/strings/datetime"
import {
    ImageGalleryObject,
    ImageObject,
    useImageGalleryAtom,
} from "@/app/_atoms/imageGallery"
import { viewQuoteCard } from "@/app/_components/ViewQuoteCard/styles"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Props {
    className?: string
    postJson?: any
    isSkeleton?: boolean
    json?: any
    isEmbedToModal?: boolean
    now?: Date
    isEmbedReportModal?: boolean
    profile?: any
    nextQueryParams: URLSearchParams
}

export const ViewQuoteCard: React.FC<Props> = (props: Props) => {
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

    const handleImageClick = useCallback(
        (index: number) => {
            if (
                postJson?.embed?.images &&
                Array.isArray(postJson.embed.images)
            ) {
                const images: ImageObject[] = []

                for (const image of postJson.embed.images) {
                    const currentImage: ImageObject = {
                        fullsize: "",
                        alt: "",
                    }

                    if (typeof image.fullsize === "string") {
                        currentImage.fullsize = image.fullsize
                    }

                    if (typeof image.alt === "string") {
                        currentImage.alt = image.alt
                    }

                    if (currentImage.fullsize.length > 0) {
                        images.push(currentImage)
                    }
                }

                if (images.length > 0) {
                    const gelleryObject: ImageGalleryObject = {
                        images,
                        index,
                    }

                    setImageGallery(gelleryObject)
                }
            }
        },
        [postJson]
    )

    const renderTextWithLinks = useMemo(() => {
        if (!postJson?.value && !postJson?.record?.text) return
        const post: any[] = []
        const postText = postJson?.value?.text || postJson?.record?.text
        postText?.split("\n").map((line: any, i: number) => {
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
                            <div className={`${PostAuthor()}`}>
                                <Link
                                    className={PostAuthorIcon()}
                                    onClick={(e) => {
                                        if (!isEmbedReportModal) return
                                        e.preventDefault()
                                        e.stopPropagation()
                                    }}
                                    href={`/profile/${postJson?.author
                                        .did}?${nextQueryParams.toString()}`}
                                >
                                    {isSkeleton ? (
                                        <Skeleton className={skeletonIcon()} />
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
                                    href={`/profile/${postJson?.author
                                        .did}?${nextQueryParams.toString()}`}
                                >
                                    {isSkeleton ? (
                                        <Skeleton className={skeletonName()} />
                                    ) : (
                                        <span>
                                            {postJson?.author?.displayName}
                                            {profile?.displayName}
                                        </span>
                                    )}
                                </Link>
                                <div className={"text-[#BABABA]"}>
                                    &nbsp;-&nbsp;
                                </div>
                                <Link
                                    className={PostAuthorHandle()}
                                    onClick={(e) => {
                                        if (!isEmbedReportModal) return
                                        e.preventDefault()
                                        e.stopPropagation()
                                    }}
                                    href={`/profile/${postJson?.author
                                        .did}?${nextQueryParams.toString()}`}
                                >
                                    {isSkeleton ? (
                                        <Skeleton
                                            className={skeletonHandle()}
                                        />
                                    ) : (
                                        <span>
                                            {postJson?.author?.handle}
                                            {profile?.handle}
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
                                            style={{ wordBreak: "break-word" }}
                                            className={`text-[14px] md:text-[15px]`}
                                        >
                                            {renderTextWithLinks}
                                        </div>
                                    </>
                                )}
                                <div className={"overflow-x-scroll"}>
                                    {postJson?.embed &&
                                        (postJson?.embed?.$type ===
                                        "app.bsky.embed.images#view" ? (
                                            <ScrollShadow
                                                hideScrollBar
                                                orientation="horizontal"
                                            >
                                                <div
                                                    className={`flex overflow-x-auto overflow-y-hidden w-100svw}]`}
                                                >
                                                    {postJson.embed.images.map(
                                                        (
                                                            image: any,
                                                            index: number
                                                        ) => (
                                                            <div
                                                                className={`mt-[10px] mb-[10px] rounded-[7.5px] overflow-hidden min-w-[280px] max-w-[500px] h-[300px] mr-[10px] bg-cover}`}
                                                                key={`image-${index}`}
                                                            >
                                                                <img
                                                                    className="w-full h-full z-0 object-cover"
                                                                    src={
                                                                        image.thumb
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
                                                                        handleImageClick(
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
                                            postJson.embed.$type ===
                                                "app.bsky.embed.external#view" && (
                                                <Linkcard
                                                    ogpData={
                                                        postJson.embed.external
                                                    }
                                                />
                                            )
                                        ))}
                                </div>
                            </div>
                        </div>
                    </>
                </>
            </main>
        </>
    )
}

export default ViewQuoteCard
