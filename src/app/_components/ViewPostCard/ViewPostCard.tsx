import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
    FeedViewPost,
    GeneratorView,
    PostView,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import {
    AppBskyEmbedExternal,
    AppBskyEmbedImages,
    AppBskyEmbedRecord,
    AppBskyEmbedRecordWithMedia,
    AppBskyFeedPost,
} from "@atproto/api"
import { ViewRecord } from "@atproto/api/dist/client/types/app/bsky/embed/record"
import { ProfileViewBasic } from "@atproto/api/dist/client/types/app/bsky/actor/defs"
import { ViewImage } from "@atproto/api/dist/client/types/app/bsky/embed/images"
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
import { viewPostCard } from "./styles"
import { viewQuoteCard } from "../ViewQuoteCard/styles"
import { PostModal } from "../PostModal"
import { Linkcard } from "../Linkcard"
import { ViewQuoteCard } from "@/app/_components/ViewQuoteCard"
import { ReportModal } from "@/app/_components/ReportModal"
import "react-circular-progressbar/dist/styles.css"
import {
    Button,
    Chip,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
    //Image,
    Modal,
    ModalContent,
    ScrollShadow,
    Skeleton,
    Tooltip,
    useDisclosure,
} from "@nextui-org/react"
import { useAgent } from "@/app/_atoms/agent"
import { formattedSimpleDate } from "@/app/_lib/strings/datetime"
import {
    ImageGalleryObject,
    ImageObject,
    useImageGalleryAtom,
} from "@/app/_atoms/imageGallery"

import "react-swipeable-list/dist/styles.css"
import { ViewFeedCard } from "@/app/_components/ViewFeedCard"
import { useUserPreferencesAtom } from "@/app/_atoms/preferences"

interface Props {
    // className?: string
    color: "light" | "dark"
    isMobile?: boolean
    // uploadImageAvailable?: boolean
    isDragActive?: boolean
    // open?: boolean
    // numbersOfImage?: 0 | 1 | 2 | 3 | 4
    postJson?: PostView
    quoteJson?: ViewRecord
    isSkeleton?: boolean
    json?: FeedViewPost
    isEmbedToModal?: boolean
    now?: Date
    isEmbedToPost?: boolean
    nextQueryParams: URLSearchParams
    t: any
}

export const ViewPostCard = (props: Props) => {
    const {
        // className,
        color,
        isMobile,
        // uploadImageAvailable,
        // open,
        // numbersOfImage,
        postJson,
        quoteJson,
        isSkeleton,
        json,
        isEmbedToModal,
        now,
        isEmbedToPost,
        nextQueryParams,
        t,
    } = props

    const postJsonData = useMemo((): ViewRecord | PostView | null => {
        return quoteJson || postJson || null
    }, [postJson, quoteJson])

    const postView = useMemo((): PostView | null => {
        if (quoteJson) {
            return null
        } else if (postJson) {
            return postJson
        } else {
            return null
        }
    }, [postJson, quoteJson])

    const [agent] = useAgent()

    const [, setImageGallery] = useImageGalleryAtom()
    const router = useRouter()
    // const reg =
    //     /^[\u0009-\u000d\u001c-\u0020\u11a3-\u11a7\u1680\u180e\u2000-\u200f\u202f\u205f\u2060\u3000\u3164\ufeff\u034f\u2028\u2029\u202a-\u202e\u2061-\u2063]*$/
    const [loading, setLoading] = useState(false)
    const [isHover, setIsHover] = useState<boolean>(false)
    const {
        Container,
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
        // LinkCard,
        // LinkCardThumbnailContainer,
        // LinkCardThumbnail,
        // LinkCardContent,
        // LinkCardTitle,
        // LinkCardDescription,
        // LinkCardSiteName,
    } = viewPostCard()

    const quoteCardStyles = viewQuoteCard()

    const [isLiked, setIsLiked] = useState<boolean>(!!postView?.viewer?.like)
    const [isReposted, setIsReposted] = useState<boolean>(
        !!postView?.viewer?.repost
    )
    const [isDeleted, setIsDeleted] = useState<boolean>(false)
    const [userPreference, setUserPreference] = useUserPreferencesAtom()
    const [contentWarning, setContentWarning] = useState<boolean>(false)
    const [warningReason, setWarningReason] = useState<string>("")
    const [, setHandleButtonClick] = useState(false)

    const {
        isOpen: isOpenReply,
        onOpen: onOpenReply,
        onOpenChange: onOpenChangeReply,
    } = useDisclosure()

    const {
        isOpen: isOpenReport,
        onOpen: onOpenReport,
        onOpenChange: onOpenChangeReport,
    } = useDisclosure()

    const handleReply = async () => {
        //setIsPostModalOpen(true)
        console.log("open")
        onOpenReply()
    }

    const handleRepost = async () => {
        if (loading) return
        setLoading(true)
        if (isReposted && postView?.viewer?.repost) {
            setIsReposted(!isReposted)
            const res = await agent?.deleteRepost(postView.viewer.repost)
            console.log(res)
        } else if (postJsonData?.uri && postJsonData?.cid) {
            setIsReposted(!isReposted)
            const res = await agent?.repost(postJsonData.uri, postJsonData.cid)
            console.log(res)
        }
        setLoading(false)
    }

    const handleLike = async () => {
        if (loading) {
            return
        }

        setLoading(true)

        if (isLiked && postView?.viewer?.like) {
            setIsLiked(!isLiked)
            const res = await agent?.deleteLike(postView.viewer.like)
            console.log(res)
        } else if (postJsonData?.uri && postJsonData?.cid) {
            setIsLiked(!isLiked)
            const res = await agent?.like(postJsonData.uri, postJsonData.cid)
            console.log(res)
        }

        setLoading(false)
    }

    const embedImages = useMemo((): AppBskyEmbedImages.View | null => {
        const quoteEmbed =
            quoteJson?.embeds?.length && quoteJson?.embeds?.length > 0
                ? quoteJson?.embeds[0]
                : null
        const embed = quoteEmbed || postView?.embed || null

        if (!embed?.$type) {
            return null
        }

        if (embed.$type === "app.bsky.embed.images#view") {
            return embed as AppBskyEmbedImages.View
        } else {
            return null
        }
    }, [postJson, quoteJson])

    const embedMedia = useMemo((): AppBskyEmbedRecordWithMedia.View | null => {
        const quoteEmbed =
            quoteJson?.embeds?.length && quoteJson?.embeds?.length > 0
                ? quoteJson?.embeds[0]
                : null
        const embed = quoteEmbed || postView?.embed || null

        if (!embed?.$type) {
            return null
        }

        if (embed.$type === "app.bsky.embed.recordWithMedia#view") {
            return embed as AppBskyEmbedRecordWithMedia.View
        } else {
            return null
        }
    }, [postJson, quoteJson])

    const embedExternal = useMemo((): AppBskyEmbedExternal.View | null => {
        const quoteEmbed =
            quoteJson?.embeds?.length && quoteJson?.embeds?.length > 0
                ? quoteJson?.embeds[0]
                : null
        const embed = quoteEmbed || postView?.embed || null

        if (!embed?.$type) {
            return null
        }

        if (embed.$type === "app.bsky.embed.external#view") {
            return embed as AppBskyEmbedExternal.View
        } else {
            return null
        }
    }, [postJson, quoteJson])

    const embedRecord = useMemo((): AppBskyEmbedRecord.View | null => {
        if (!postView?.embed?.$type) {
            return null
        }

        const embedType = postView.embed.$type

        if (embedType === "app.bsky.embed.record#view") {
            const embed = postView.embed as AppBskyEmbedRecord.View

            return embed
        } else {
            return null
        }
    }, [postJson, quoteJson])

    const embedRecordViewRecord = useMemo((): ViewRecord | null => {
        const quoteEmbed =
            quoteJson?.embeds?.length && quoteJson?.embeds?.length > 0
                ? quoteJson?.embeds[0]
                : null
        const embed = quoteEmbed || postView?.embed || null

        if (!embed?.$type) {
            return null
        }

        if (embed.$type === "app.bsky.embed.record#view") {
            return embed.record as ViewRecord
        } else {
            return null
        }
    }, [postJson, quoteJson])

    const embedFeed = useMemo((): GeneratorView | null => {
        if (
            !postView?.embed?.$type &&
            !(postView?.embed?.record as GeneratorView)?.$type
        ) {
            return null
        }

        const embedType = postView?.embed?.$type

        if (
            embedType === "app.bsky.embed.record#view" &&
            (postView?.embed?.record as GeneratorView)?.$type ===
                "app.bsky.feed.defs#generatorView"
        ) {
            const embed = postView?.embed?.record as GeneratorView

            return embed
        } else {
            return null
        }
    }, [postJson, quoteJson])

    const handleDelete = async () => {
        if (loading) return
        if (!agent) return
        if (!postJson) return
        try {
            setLoading(true)
            const res = await agent.deletePost(postJson?.uri)
            setIsDeleted(true)
        } catch (e) {
            console.log(e)
        } finally {
            setLoading(false)
        }
    }

    const handleImageClick = useCallback(
        (index: number) => {
            const images: ViewImage[] | null =
                embedImages?.images ||
                (embedMedia?.media.images as ViewImage[]) ||
                null

            if (images !== null) {
                const imageObjects: ImageObject[] = []

                for (const image of images) {
                    const currentImageObject: ImageObject = {
                        fullsize: image.fullsize,
                        alt: image.alt,
                    }

                    imageObjects.push(currentImageObject)
                }

                if (imageObjects.length > 0) {
                    const gelleryObject: ImageGalleryObject = {
                        images: imageObjects,
                        index,
                    }

                    setImageGallery(gelleryObject)
                }
            }
        },
        [postJson]
    )

    const renderTextWithLinks = useMemo(() => {
        if (!postJsonData?.record && !quoteJson?.value) {
            return
        }

        const record = (quoteJson?.value ||
            postJsonData?.record) as AppBskyFeedPost.Record

        const encoder = new TextEncoder()
        const decoder = new TextDecoder()

        if (!record?.facets && record?.text) {
            const post: any[] = []
            record.text.split("\n").map((line: any, i: number) => {
                post.push(
                    <p key={i}>
                        {line}
                        <br />
                    </p>
                )
            })
            return post
        }

        const { text, facets } = record
        const text_bytes = encoder.encode(text)
        const result: any[] = []

        let lastOffset = 0

        ;(facets || []).forEach((facet: any, index: number) => {
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
                                e.stopPropagation()
                                router.push(
                                    `/profile/${
                                        facet.features[0].did
                                    }?${nextQueryParams.toString()}`
                                )
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
                                            e.stopPropagation()
                                            router.push(
                                                facet.features[0].uri.replace(
                                                    "https://bsky.app",
                                                    `${location.protocol}//${window.location.host}`
                                                ) +
                                                    `?${nextQueryParams.toString()}`
                                            )
                                        }}
                                    >
                                        {facetText}
                                    </span>
                                ) : (
                                    <a
                                        onClick={(e) => e.stopPropagation()}
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
                                        e.stopPropagation()
                                        const queryParams = new URLSearchParams(
                                            nextQueryParams
                                        )
                                        queryParams.set(
                                            "word",
                                            `%23${facet.features[0].tag.replace(
                                                "#",
                                                ""
                                            )}`
                                        )
                                        queryParams.set("target", "posts")
                                        router.push(
                                            `/search?${nextQueryParams.toString()}`
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

        if (lastOffset < text_bytes.length) {
            const nonLinkText = decoder.decode(text_bytes.slice(lastOffset))
            const textWithLineBreaks = nonLinkText
                .split("\n")
                .map((line, index) => (
                    <span key={`div-${lastOffset}-${index}`}>
                        {line}
                        {index !== nonLinkText.length - 1 && <br />}
                    </span>
                ))
            result.push(textWithLineBreaks)
        }
        return result
    }, [postJson, quoteJson])

    useEffect(() => {
        if (!userPreference) return
        const post = postJson || quoteJson
        if (!post || !post.labels || post.labels.length === 0) return
        type LabelActionsType = {
            [key: string]: {
                label: string
                key: string
            }
        }

        const labelActions: LabelActionsType = {
            porn: {
                label: "Adult Content",
                key: "nsfw",
            },
            nudity: {
                label: "Nudity Content",
                key: "nudity",
            },
            sexual: {
                label: "Sexual Content",
                key: "suggestive",
            },
            spam: {
                label: "Spam",
                key: "spam",
            },
            impersonation: {
                label: "Impersonation",
                key: "impersonation",
            },
            gore: {
                label: "Violence or Bloody",
                key: "gore",
            },
        }

        post.labels.forEach((label) => {
            const labelType = labelActions[label.val]
            if (labelType) {
                const { label: warningLabel, key } = labelType
                switch (key) {
                    case "nsfw":
                    case "suggestive":
                    case "nudity":
                    case "spam":
                    case "impersonation":
                    case "gore":
                        const action = userPreference.contentLabels?.[key]
                        if (action === "warn") {
                            setContentWarning(true)
                            setWarningReason(warningLabel)
                        } else if (action === "hide") {
                            setIsDeleted(true)
                        }
                        break
                    default:
                        break
                }
            } else {
                console.log(label)
            }
        })
    }, [userPreference, postJson, quoteJson])

    return (
        !isDeleted && (
            <div
                className={
                    quoteJson
                        ? quoteCardStyles.PostCardContainer({ color, isMobile })
                        : Container({ color, isMobile })
                }
            >
                <Modal
                    isOpen={isOpenReply}
                    onOpenChange={onOpenChangeReply}
                    placement={isMobile ? "top" : "center"}
                    className={"z-[100] max-w-[600px]"}
                >
                    <ModalContent>
                        {(onClose) => (
                            <PostModal
                                color={color}
                                type={"Reply"}
                                postData={postJson}
                                onClose={onClose}
                            />
                        )}
                    </ModalContent>
                </Modal>
                <ReportModal
                    isOpen={isOpenReport}
                    onOpenChange={onOpenChangeReport}
                    placement={isMobile ? "top" : "center"}
                    className={"z-[100] max-w-[600px]"}
                    color={color}
                    target={"post"}
                    post={postJson}
                    nextQueryParams={nextQueryParams}
                />
                <main
                    className={`${
                        quoteJson
                            ? quoteCardStyles.PostCard({ color, isMobile })
                            : PostCard({ color, isMobile })
                    } ${
                        isEmbedToModal
                            ? `bg-transparent border-none`
                            : `cursor-pointer`
                    }`}
                    // ${
                    //     !isMobile &&
                    //     color === "light" &&
                    //     "bg-[#DADADA] bg-opacity-70 backdrop-blur-[15px]"
                    // } ${
                    //     (!isMobile &&
                    //     color === "dark") &&
                    //     "bg-[#2C2C2C] bg-opacity-70 backdrop-blur-[15px]"
                    // }`}
                    //     quoteJson &&
                    //     !isMobile &&
                    //     color === "light" &&
                    //     "bg-[#DADADA] bg-opacity-90"
                    // } ${
                    //     quoteJson &&
                    //     !isMobile &&
                    //     color === "dark" &&
                    //     "bg-[#2C2C2C] bg-opacity-90"
                    // }`

                    //style={{backgroundColor: isEmbedToModal ? 'transparent'}}
                    onClick={(e) => {
                        e.stopPropagation()
                        router.push(
                            `/profile/${postJsonData?.author.did}/post/${
                                postJsonData?.uri.match(/\/(\w+)$/)?.[1] || ""
                            }?${nextQueryParams.toString()}`
                        )
                    }}
                >
                    <div
                        className={`flex ${PostCardContainer({
                            isMobile: isMobile,
                        })} ${(isEmbedToModal && `pt-[0px]`) || ""}`}
                        onMouseEnter={() => {
                            setIsHover(true)
                        }}
                        onMouseLeave={() => {
                            setIsHover(false)
                        }}
                    >
                        <div
                            className={`${PostAuthorIcon()} w-[42px] h-[42px] mr-3 mt-2`}
                            onClick={(e) => {
                                e.stopPropagation()
                                router.push(
                                    `/profile/${postJsonData?.author
                                        .did}?${nextQueryParams.toString()}`
                                )
                            }}
                        >
                            {json?.reason && <div className="h-[24px]"></div>}
                            {isSkeleton ? (
                                <Skeleton
                                    className={skeletonIcon({
                                        color: color,
                                    })}
                                />
                            ) : (
                                <>
                                    {postJsonData?.author?.avatar ? (
                                        <img
                                            src={postJsonData?.author?.avatar}
                                            //radius={"lg"}
                                            className={`${
                                                isEmbedToModal
                                                    ? `z-[2]`
                                                    : `z-[0]`
                                            } rounded-full border border-gray-300 w-[42px] h-[42px]`}
                                            alt={postJsonData.author.did}
                                        />
                                    ) : (
                                        <FontAwesomeIcon
                                            className={`${
                                                isEmbedToModal
                                                    ? `z-[2]`
                                                    : `z-[0]`
                                            } h-[42px] w-[42px]`}
                                            icon={faUser}
                                        />
                                    )}
                                </>
                            )}
                        </div>
                        <div className="w-[calc(100%-60px)]">
                            {json?.reason && (
                                <div
                                    className={`text-[13px] text-blue-500 text-bold hover:cursor-pointer h-[16px] mb-[8px] ${
                                        !isMobile && `hover:underline`
                                    }`}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        router.push(
                                            `/profile/${postJsonData?.author
                                                .did}?${nextQueryParams.toString()}`
                                        )
                                    }}
                                >
                                    <FontAwesomeIcon icon={faRetweet} />{" "}
                                    Reposted by{" "}
                                    {(json.reason.by as ProfileViewBasic)
                                        .displayName || ""}
                                </div>
                            )}
                            <div className={`${PostAuthor()}`}>
                                <span
                                    className={PostAuthorDisplayName({
                                        color: color,
                                    })}
                                    style={{ fontSize: "13px" }}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        router.push(
                                            `/profile/${postJsonData?.author
                                                .did}?${nextQueryParams.toString()}`
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
                                        <span
                                            className={`${
                                                !isMobile && `hover:underline`
                                            }`}
                                        >
                                            {postJsonData?.author?.displayName}
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
                                        e.stopPropagation()
                                        router.push(
                                            `/profile/${postJsonData?.author.did}`
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
                                        <span
                                            className={`${
                                                !isMobile && `hover:underline`
                                            }`}
                                        >
                                            {postJsonData?.author?.handle}
                                        </span>
                                    )}
                                </span>
                                <div
                                    className={PostCreatedAt()}
                                    style={{ fontSize: "12px" }}
                                >
                                    {!isEmbedToModal &&
                                    !isMobile &&
                                    isHover &&
                                    !isSkeleton ? (
                                        <Dropdown
                                            className={dropdown({
                                                color: color,
                                            })}
                                        >
                                            <DropdownTrigger>
                                                <FontAwesomeIcon
                                                    icon={faEllipsis}
                                                    className={
                                                        "h-[20px] mb-[4px] cursor-pointer text-[#6b7280]"
                                                    }
                                                />
                                            </DropdownTrigger>
                                            <DropdownMenu
                                                disallowEmptySelection
                                                aria-label="Multiple selection actions"
                                                selectionMode="multiple"
                                            >
                                                <DropdownItem
                                                    key="1"
                                                    startContent={
                                                        <FontAwesomeIcon
                                                            icon={faLink}
                                                        />
                                                    }
                                                    onClick={() => {
                                                        if (!postJsonData) {
                                                            return
                                                        }

                                                        console.log(
                                                            `https://bsky.app/profile/${
                                                                postJsonData
                                                                    .author.did
                                                            }/post/${
                                                                postJsonData.uri.match(
                                                                    /\/(\w+)$/
                                                                )?.[1] || ""
                                                            }`
                                                        )
                                                        navigator.clipboard.writeText(
                                                            `https://bsky.app/profile/${
                                                                postJsonData
                                                                    .author.did
                                                            }/post/${
                                                                postJsonData.uri.match(
                                                                    /\/(\w+)$/
                                                                )?.[1] || ""
                                                            }`
                                                        )
                                                    }}
                                                >
                                                    {t(
                                                        "components.ViewPostCard.copyURL"
                                                    )}
                                                </DropdownItem>
                                                <DropdownItem
                                                    key="2"
                                                    startContent={
                                                        <FontAwesomeIcon
                                                            icon={faCode}
                                                        />
                                                    }
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(
                                                            JSON.stringify(
                                                                postJson
                                                            )
                                                        )
                                                    }}
                                                >
                                                    {t(
                                                        "components.ViewPostCard.copyJSON"
                                                    )}
                                                </DropdownItem>
                                                <DropdownSection title="Danger zone">
                                                    {postJsonData &&
                                                    agent?.session?.did !==
                                                        postJsonData.author
                                                            .did ? (
                                                        <DropdownItem
                                                            key="report"
                                                            className="text-danger"
                                                            color="danger"
                                                            startContent={
                                                                <FontAwesomeIcon
                                                                    icon={
                                                                        faFlag
                                                                    }
                                                                />
                                                            }
                                                            onClick={() => {
                                                                console.log(
                                                                    "hogehoge"
                                                                )
                                                                onOpenReport()
                                                            }}
                                                        >
                                                            {t(
                                                                "components.ViewPostCard.report"
                                                            )}
                                                        </DropdownItem>
                                                    ) : (
                                                        <DropdownItem
                                                            key="delete"
                                                            className="text-danger"
                                                            color="danger"
                                                            startContent={
                                                                <FontAwesomeIcon
                                                                    icon={
                                                                        faTrash
                                                                    }
                                                                />
                                                            }
                                                            onClick={() => {
                                                                handleDelete()
                                                            }}
                                                        >
                                                            {t(
                                                                "components.ViewPostCard.delete"
                                                            )}
                                                        </DropdownItem>
                                                    )}
                                                </DropdownSection>
                                            </DropdownMenu>
                                        </Dropdown>
                                    ) : (
                                        <>
                                            {!isSkeleton && (
                                                <div>
                                                    {postJsonData &&
                                                        formattedSimpleDate(
                                                            postJsonData.indexedAt,
                                                            now || new Date()
                                                        )}
                                                </div>
                                            )}
                                        </>
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
                                        {json?.reply && (
                                            <div
                                                className={
                                                    "text-[#BABABA] text-[12px]"
                                                }
                                            >
                                                <FontAwesomeIcon
                                                    icon={faReply}
                                                />{" "}
                                                Reply to{" "}
                                                {
                                                    (
                                                        json.reply.parent
                                                            .author as ProfileViewBasic
                                                    )?.displayName
                                                }
                                            </div>
                                        )}
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
                                {embedImages && !contentWarning && (
                                    <EmbedImages
                                        color={color}
                                        embedImages={embedImages}
                                        onImageClick={(index: number) => {
                                            handleImageClick(index)
                                        }}
                                    />
                                )}
                                {contentWarning && (
                                    <div
                                        className={`h-[50px] w-full flex justify-between items-center border border-gray-600 rounded-[10px]`}
                                    >
                                        <div className={"ml-[20px]"}>
                                            {t(
                                                "components.ViewPostCard.warning"
                                            )}
                                            : {warningReason}
                                        </div>
                                        <Button
                                            variant={"light"}
                                            color={"primary"}
                                            onClick={() => {
                                                setContentWarning(false)
                                            }}
                                        >
                                            {t("components.ViewPostCard.show")}
                                        </Button>
                                    </div>
                                )}
                                {embedMedia && (
                                    <EmbedMedia
                                        color={color}
                                        embedMedia={embedMedia}
                                        onImageClick={(index: number) => {
                                            handleImageClick(index)
                                        }}
                                        nextQueryParams={nextQueryParams}
                                    />
                                )}
                                {embedExternal && (
                                    <div className="mt-4">
                                        <Linkcard
                                            color={color}
                                            ogpData={embedExternal.external}
                                        />
                                    </div>
                                )}
                                {embedRecord &&
                                    embedRecordViewRecord &&
                                    !embedFeed && (
                                        <ViewPostCard
                                            isMobile={isMobile}
                                            color={color}
                                            quoteJson={embedRecordViewRecord}
                                            isEmbedToPost={true}
                                            nextQueryParams={nextQueryParams}
                                            t={t}
                                        />
                                    )}
                                {embedFeed && (
                                    <div className="mt-4">
                                        <ViewFeedCard
                                            color={color}
                                            feed={embedFeed}
                                        />
                                    </div>
                                )}
                            </div>
                            {!quoteJson && (
                                <div className={PostReactionButtonContainer()}>
                                    <div className={`mr-[12px]`}>
                                        {isMobile &&
                                            !isEmbedToModal &&
                                            !isEmbedToPost && (
                                                <>
                                                    <FontAwesomeIcon
                                                        icon={faComment}
                                                        className={PostReactionButton()}
                                                        style={{
                                                            color: "#6b7280", // gray-500
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setHandleButtonClick(
                                                                true
                                                            )
                                                            handleReply()
                                                        }}
                                                    />
                                                    <FontAwesomeIcon
                                                        icon={faRetweet}
                                                        style={{
                                                            color: isReposted
                                                                ? "#3b82f6" // blue-500
                                                                : "#6b7280", // gray-500
                                                        }}
                                                        className={PostReactionButton()}
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setHandleButtonClick(
                                                                true
                                                            )
                                                            handleRepost()
                                                        }}
                                                    />
                                                    <FontAwesomeIcon
                                                        icon={
                                                            isLiked
                                                                ? faHeartSolid
                                                                : faHeartRegular
                                                        }
                                                        style={{
                                                            color: isLiked
                                                                ? "#3b82f6" // blue-500
                                                                : "#6b7280", // gray-500
                                                        }}
                                                        className={PostReactionButton()}
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setHandleButtonClick(
                                                                true
                                                            )
                                                            handleLike()
                                                        }}
                                                    />
                                                </>
                                            )}
                                        {!isMobile &&
                                            !isEmbedToModal &&
                                            !isEmbedToPost && (
                                                <>
                                                    <FontAwesomeIcon
                                                        icon={faComment}
                                                        style={{
                                                            display:
                                                                isHover &&
                                                                !isSkeleton
                                                                    ? undefined
                                                                    : "none",
                                                        }}
                                                        className={PostReactionButton()}
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setHandleButtonClick(
                                                                true
                                                            )
                                                            handleReply()
                                                        }}
                                                    />
                                                    <FontAwesomeIcon
                                                        icon={faRetweet}
                                                        style={{
                                                            color: isReposted
                                                                ? "#3b82f6" // blue-500
                                                                : "#6b7280", // gray-500
                                                            display:
                                                                isHover &&
                                                                !isSkeleton
                                                                    ? undefined
                                                                    : isReposted
                                                                    ? undefined
                                                                    : "none",
                                                        }}
                                                        className={PostReactionButton()}
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setHandleButtonClick(
                                                                true
                                                            )
                                                            handleRepost()
                                                        }}
                                                    />
                                                    <FontAwesomeIcon
                                                        icon={
                                                            isLiked
                                                                ? faHeartSolid
                                                                : faHeartRegular
                                                        }
                                                        style={{
                                                            color: isLiked
                                                                ? "#3b82f6" // blue-500
                                                                : "#6b7280", // gray-500
                                                            display:
                                                                isHover &&
                                                                !isSkeleton
                                                                    ? undefined
                                                                    : isLiked
                                                                    ? undefined
                                                                    : "none",
                                                        }}
                                                        className={PostReactionButton()}
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setHandleButtonClick(
                                                                true
                                                            )
                                                            handleLike()
                                                        }}
                                                    />
                                                </>
                                            )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        )
    )
}

interface EmbedImagesProps {
    color: "light" | "dark"
    embedImages: AppBskyEmbedImages.View
    onImageClick: (index: number) => void
}

const EmbedImages = ({ embedImages, onImageClick }: EmbedImagesProps) => {
    return (
        <ScrollShadow
            isEnabled={embedImages.images.length > 1}
            hideScrollBar={true}
            orientation="horizontal"
            className={`flex overflow-x-auto overflow-y-hidden w-full]`}
        >
            {embedImages.images.map((image: ViewImage, index: number) => (
                <div
                    className={`mt-[10px] mb-[10px] rounded-[7.5px] overflow-hidden min-w-[150px] min-h-[150px] w-[150px] h-[150px] mr-[10px] bg-cover border border-gray-300`}
                    key={`image-${index}`}
                >
                    <img
                        className="w-full h-full z-0 object-cover"
                        src={image.thumb}
                        alt={image.alt}
                        onClick={(e) => {
                            e.stopPropagation()
                            onImageClick(index)
                        }}
                    />
                </div>
            ))}
        </ScrollShadow>
    )
}

interface EmbedMediaProps {
    color: "light" | "dark"
    embedMedia: AppBskyEmbedRecordWithMedia.View
    onImageClick: (index: number) => void
    nextQueryParams: URLSearchParams
}

const EmbedMedia = ({
    embedMedia,
    onImageClick,
    color,
    nextQueryParams,
}: EmbedMediaProps) => {
    const images = embedMedia.media.images

    if (!images || !Array.isArray(images)) {
        return
    }

    return (
        <>
            <ScrollShadow
                isEnabled={images.length > 1}
                hideScrollBar
                orientation="horizontal"
                className={`flex overflow-x-auto overflow-y-hidden w-full]`}
            >
                {images.map((image: ViewImage, index: number) => (
                    <div
                        className={`mt-[10px] mb-[10px] rounded-[7.5px] overflow-hidden min-w-[150px] min-h-[150px] w-[150px] h-[150px] mr-[10px] bg-cover border border-gray-300`}
                        key={`image-${index}`}
                    >
                        <img
                            className="w-full h-full z-0 object-cover"
                            src={image.thumb}
                            alt={image.alt}
                            onClick={(e) => {
                                e.stopPropagation()
                                onImageClick(index)
                            }}
                        />
                    </div>
                ))}
            </ScrollShadow>
            <ViewQuoteCard
                color={color}
                postJson={embedMedia.record.record}
                nextQueryParams={nextQueryParams}
            />
        </>
    )
}

export default ViewPostCard
