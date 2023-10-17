import React, { useCallback, useMemo, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUser } from "@fortawesome/free-solid-svg-icons"
import { Linkcard } from "../Linkcard"
import "react-circular-progressbar/dist/styles.css"
import { Image, ScrollShadow, Skeleton } from "@nextui-org/react"
import "react-swipeable-list/dist/styles.css"
import { useAgent } from "@/app/_atoms/agent"
import { useRouter } from "next/navigation"
import { formattedSimpleDate } from "@/app/_lib/strings/datetime"
import {
    ImageGalleryObject,
    ImageObject,
    useImageGalleryAtom,
} from "@/app/_atoms/imageGallery"
import { viewQuoteCard } from "@/app/components/ViewQuoteCard/styles"

interface Props {
    className?: string
    color: "light" | "dark"
    isMobile?: boolean
    uploadImageAvailable?: boolean
    isDragActive?: boolean
    open?: boolean
    numbersOfImage?: 0 | 1 | 2 | 3 | 4
    postJson?: any
    isSkeleton?: boolean
    json?: any
    isEmbedToModal?: boolean
    now?: Date
    isEmbedReportModal?: boolean
    profile?: any
}

export const ViewQuoteCard: React.FC<Props> = (props: Props) => {
    const [agent] = useAgent()
    const [imageGallery, setImageGallery] = useImageGalleryAtom()
    const router = useRouter()
    const {
        className,
        color,
        isMobile,
        uploadImageAvailable,
        open,
        numbersOfImage,
        postJson,
        isSkeleton,
        json,
        isEmbedToModal,
        now,
        isEmbedReportModal,
        profile,
    } = props
    const reg =
        /^[\u0009-\u000d\u001c-\u0020\u11a3-\u11a7\u1680\u180e\u2000-\u200f\u202f\u205f\u2060\u3000\u3164\ufeff\u034f\u2028\u2029\u202a-\u202e\u2061-\u2063]*$/
    const [loading, setLoading] = useState(false)
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
    const [isSwipeEnabled, setIsSwipeEnabled] = useState(true)
    const [startX, setStartX] = useState(null)
    const [startY, setStartY] = useState(null)

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
        if (true) {
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
        }
    }, [])

    const handleMouseUp = (e: any) => {
        // マウスダウンしていない状態でクリックされた場合は何もしない
        if (startX === null || startY === null) return

        // マウスが動いた場合の座標
        const currentX = e.clientX
        const currentY = e.clientY

        // クリックが発生した座標との差を計算
        const deltaX = Math.abs(currentX - startX)
        const deltaY = Math.abs(currentY - startY)

        // カーソルが一定の閾値以上動いた場合にクリックをキャンセル
        if (deltaX > 5 || deltaY > 5) {
            console.log("cancel click")
            //e.preventDefault();
            //e.stopPropagation();
        } else {
            e.preventDefault()
            e.stopPropagation()
            router.push(
                `/profile/${postJson?.author.did}/post/${
                    postJson?.uri.match(/\/(\w+)$/)?.[1] || ""
                }`
            )
        }
    }

    const handleMouseDown = (e: any) => {
        // マウスダウン時の座標を記録
        setStartX(e.clientX)
        setStartY(e.clientY)
    }
    return (
        <>
            <main
                className={`${PostCard({ color: color })} ${
                    isEmbedToModal
                        ? `bg-transparent border-none`
                        : `cursor-pointer`
                }`}
                //style={{backgroundColor: isEmbedToModal ? 'transparent'}}
                onMouseDown={(e) => {
                    handleMouseDown(e)
                }}
                onMouseUp={(e) => {
                    if (isEmbedToModal) return
                    handleMouseUp(e)
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
                                <span
                                    className={PostAuthorIcon()}
                                    onClick={(e) => {
                                        if (!isEmbedReportModal) return
                                        e.preventDefault()
                                        e.stopPropagation()
                                        router.push(
                                            `/profile/${postJson?.author.did}`
                                        )
                                    }}
                                >
                                    {isSkeleton ? (
                                        <Skeleton
                                            className={skeletonIcon({
                                                color: color,
                                            })}
                                        />
                                    ) : (
                                        <>
                                            {postJson &&
                                                (postJson?.author?.avatar ? (
                                                    <Image
                                                        src={
                                                            postJson?.author
                                                                ?.avatar
                                                        }
                                                        //radius={"lg"}
                                                        className={`${
                                                            isEmbedToModal
                                                                ? `z-[2]`
                                                                : `z-[0]`
                                                        } rounded-[7px]`}
                                                        alt={
                                                            postJson?.author.did
                                                        }
                                                    />
                                                ) : (
                                                    <FontAwesomeIcon
                                                        className={`${
                                                            isEmbedToModal
                                                                ? `z-[2]`
                                                                : `z-[0]`
                                                        } h-full w-full`}
                                                        icon={faUser}
                                                    />
                                                ))}
                                            {profile &&
                                                (profile?.avatar ? (
                                                    <Image
                                                        src={profile.avatar}
                                                        //radius={"lg"}
                                                        className={`${
                                                            isEmbedToModal
                                                                ? `z-[2]`
                                                                : `z-[0]`
                                                        } rounded-[7px]`}
                                                        alt={profile.did}
                                                    />
                                                ) : (
                                                    <FontAwesomeIcon
                                                        className={`${
                                                            isEmbedToModal
                                                                ? `z-[2]`
                                                                : `z-[0]`
                                                        } h-full w-full`}
                                                        icon={faUser}
                                                    />
                                                ))}
                                        </>
                                    )}
                                </span>
                                <span
                                    className={PostAuthorDisplayName({
                                        color: color,
                                    })}
                                    style={{ fontSize: "13px" }}
                                    onClick={(e) => {
                                        if (!isEmbedReportModal) return
                                        e.preventDefault()
                                        e.stopPropagation()
                                        router.push(
                                            `/profile/${postJson?.author.did}`
                                        )
                                    }}
                                >
                                    {isSkeleton ? (
                                        <Skeleton
                                            className={skeletonName({
                                                color: color,
                                            })}
                                        />
                                    ) : (
                                        <span>
                                            {postJson?.author?.displayName}
                                            {profile?.displayName}
                                        </span>
                                    )}
                                </span>
                                <div className={"text-[#BABABA]"}>
                                    &nbsp;-&nbsp;
                                </div>
                                <span
                                    className={PostAuthorHandle({
                                        color: color,
                                    })}
                                    onClick={(e) => {
                                        if (!isEmbedReportModal) return
                                        e.preventDefault()
                                        e.stopPropagation()
                                        router.push(
                                            `/profile/${postJson?.author.did}`
                                        )
                                    }}
                                >
                                    {isSkeleton ? (
                                        <Skeleton
                                            className={skeletonHandle({
                                                color: color,
                                            })}
                                        />
                                    ) : (
                                        <span>
                                            {postJson?.author?.handle}
                                            {profile?.handle}
                                        </span>
                                    )}
                                </span>
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
                                                                    onClick={(
                                                                        e
                                                                    ) => {
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
                                                    color={color}
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
