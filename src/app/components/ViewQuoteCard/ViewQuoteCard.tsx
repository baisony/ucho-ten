import React, { useCallback, useMemo, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faComment,
    faStar as faHeartRegular,
} from "@fortawesome/free-regular-svg-icons"
import {
    faCheckCircle,
    faCircleQuestion,
    faCircleXmark,
    faCode,
    faEllipsis,
    faFlag,
    faHashtag,
    faLink,
    faReply,
    faRetweet,
    faStar as faHeartSolid,
    faTrash,
    faUser,
} from "@fortawesome/free-solid-svg-icons"
import { PostModal } from "../PostModal"
import { Linkcard } from "../Linkcard"
import "react-circular-progressbar/dist/styles.css"
import {
    Chip,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
    Image,
    Modal,
    ModalContent,
    ScrollShadow,
    Skeleton,
    Tooltip,
    useDisclosure,
} from "@nextui-org/react"
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
    } = props
    const reg =
        /^[\u0009-\u000d\u001c-\u0020\u11a3-\u11a7\u1680\u180e\u2000-\u200f\u202f\u205f\u2060\u3000\u3164\ufeff\u034f\u2028\u2029\u202a-\u202e\u2061-\u2063]*$/
    const [loading, setLoading] = useState(false)
    const {
        PostCard,
        PostAuthor,
        PostContent,
        PostReactionButtonContainer,
        PostCardContainer,
        PostReactionButton,
        PostAuthorIcon,
        PostAuthorDisplayName,
        PostAuthorHandle,
        PostCreatedAt,
        dropdown,
        skeletonIcon,
        skeletonName,
        skeletonHandle,
        skeletonText1line,
        skeletonText2line,
        chip,
        LinkCard,
        LinkCardThumbnailContainer,
        LinkCardThumbnail,
        LinkCardContent,
        LinkCardTitle,
        LinkCardDescription,
        LinkCardSiteName,
    } = viewQuoteCard()
    const [isSwipeEnabled, setIsSwipeEnabled] = useState(true)
    const [postInfo, setPostInfo] = useState<any>(null)
    const [isTextSelectionInProgress, setIsTextSelectionInProgress] =
        useState(false)
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
        console.log(postJson)
        if (!postJson?.value) return
        const encoder = new TextEncoder()
        const decoder = new TextDecoder()
        if (true) {
            const post: any[] = []
            postJson.value.text.split("\n").map((line: any, i: number) => {
                post.push(
                    <p key={i}>
                        {line}
                        <br />
                    </p>
                )
            })
            return post
        }
        const { text, facets } = postJson.value
        const text_bytes = encoder.encode(text)
        const result: any[] = []
        let lastOffset = 0
        facets.forEach((facet: any, index: number) => {
            const { byteStart, byteEnd } = facet.index

            const facetText = decoder.decode(
                text_bytes.slice(byteStart, byteEnd)
            )

            // 直前のテキストを追加
            if (byteStart > lastOffset) {
                const nonLinkText = decoder.decode(
                    text_bytes.slice(lastOffset, byteStart)
                )
                const textChunks = nonLinkText
                    .split("\n")
                    .map((line, index, array) => (
                        <span key={`text-${byteStart}-${index}`}>
                            {line}
                            {index !== array.length - 1 && <br />}
                        </span>
                    ))
                result.push(textChunks)
            }

            switch (facet.features[0].$type) {
                case "app.bsky.richtext.facet#mention":
                    result.push(
                        <span
                            key={`link-${index}-${byteStart}`}
                            className={"text-blue-500"}
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                router.push(`/profile/${facet.features[0].did}`)
                            }}
                        >
                            {facetText}
                        </span>
                    )
                    break

                case "app.bsky.richtext.facet#link":
                    result.push(
                        <span key={`link-${index}-${byteStart}`}>
                            <Chip
                                className={chip({ color: color })}
                                startContent={
                                    <Tooltip
                                        showArrow={true}
                                        color={"foreground"}
                                        content={
                                            facetText === facet.features[0].uri
                                                ? "リンク偽装の心配はありません。"
                                                : facet.features[0].uri.includes(
                                                      facetText.replace(
                                                          "...",
                                                          ""
                                                      )
                                                  )
                                                ? "URL短縮の可能性があります。"
                                                : "リンク偽装の可能性があります。"
                                        }
                                    >
                                        <FontAwesomeIcon
                                            icon={
                                                facetText ===
                                                facet.features[0].uri
                                                    ? faCheckCircle
                                                    : facet.features[0].uri.includes(
                                                          facetText.replace(
                                                              "...",
                                                              ""
                                                          )
                                                      )
                                                    ? faCircleQuestion
                                                    : faCircleXmark
                                            }
                                        />
                                    </Tooltip>
                                }
                                variant="faded"
                                color={
                                    facetText === facet.features[0].uri
                                        ? "success"
                                        : facet.features[0].uri.includes(
                                              facetText.replace("...", "")
                                          )
                                        ? "default"
                                        : "danger"
                                }
                            >
                                {facet.features[0].uri.startsWith(
                                    "https://bsky.app"
                                ) ? (
                                    <span
                                        key={`a-${index}-${byteStart}`}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            router.push(
                                                facet.features[0].uri.replace(
                                                    "https://bsky.app",
                                                    `${location.protocol}//${window.location.host}`
                                                )
                                            )
                                        }}
                                    >
                                        {facetText}
                                    </span>
                                ) : (
                                    <a
                                        onMouseUp={(e) => e.stopPropagation()}
                                        key={`a-${index}-${byteStart}`}
                                        href={facet.features[0].uri}
                                        target={"_blank"}
                                        rel={"noopener noreferrer"}
                                    >
                                        {facetText}
                                    </a>
                                )}
                            </Chip>
                        </span>
                    )
                    break

                case "app.bsky.richtext.facet#tag":
                    result.push(
                        <span key={`link-${index}-${byteStart}`}>
                            <Chip
                                className={chip({ color: color })}
                                startContent={
                                    <FontAwesomeIcon icon={faHashtag} />
                                }
                                variant="faded"
                                color="primary"
                            >
                                <span
                                    key={`a-${index}-${byteStart}`}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        router.push(
                                            `/search?word=%23${facet.features[0].tag.replace(
                                                "#",
                                                ""
                                            )}&target=posts`
                                        )
                                    }}
                                >
                                    {facetText.replace("#", "")}
                                </span>
                            </Chip>
                        </span>
                    )
                    break
            }
            lastOffset = byteEnd
        })
        return result
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
                                            {postJson?.author?.avatar ? (
                                                <Image
                                                    src={
                                                        postJson?.author?.avatar
                                                    }
                                                    //radius={"lg"}
                                                    className={`${
                                                        isEmbedToModal
                                                            ? `z-[2]`
                                                            : `z-[0]`
                                                    } rounded-[10px]`}
                                                    alt={postJson?.author.did}
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
                                            )}
                                        </>
                                    )}
                                </span>
                                <span
                                    className={PostAuthorDisplayName({
                                        color: color,
                                    })}
                                    style={{ fontSize: "13px" }}
                                    onClick={(e) => {
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
                                        <span>{postJson?.author?.handle}</span>
                                    )}
                                </span>
                                <div
                                    className={PostCreatedAt()}
                                    style={{ fontSize: "12px" }}
                                >
                                    {!isSkeleton && (
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
                                                    OGPData={
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
