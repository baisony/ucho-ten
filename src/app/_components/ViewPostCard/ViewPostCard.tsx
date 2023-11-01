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
import { ListView } from "@atproto/api/dist/client/types/app/bsky/graph/defs"
import { ViewRecord } from "@atproto/api/dist/client/types/app/bsky/embed/record"
import { ProfileViewBasic } from "@atproto/api/dist/client/types/app/bsky/actor/defs"
import { ViewImage } from "@atproto/api/dist/client/types/app/bsky/embed/images"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faBookmark as faBookmarkRegular,
    faComment,
    faStar as faHeartRegular,
} from "@fortawesome/free-regular-svg-icons"
import {
    faBookmark as faBookmarkSolid,
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
} from "@fortawesome/free-solid-svg-icons"
import defaultIcon from "@/../public/images/icon/default_icon.svg"
import { viewPostCard } from "./styles"
import { viewQuoteCard } from "../ViewQuoteCard/styles"
import { PostModal } from "../PostModal"
import { Linkcard } from "@/app/_components/Linkcard"
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
import { ViewMuteListCard } from "@/app/_components/ViewMuteListCard"
import { useUserPreferencesAtom } from "@/app/_atoms/preferences"
import { Bookmark, useBookmarks } from "@/app/_atoms/bookmarks"
import Link from "next/link"
import { ViewNotFoundCard } from "@/app/_components/ViewNotFoundCard"

interface Props {
    // className?: string
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
    const [loading, setLoading] = useState(false)
    const {
        PostCard,
        PostAuthor,
        PostContent,
        PostContentText,
        PostReactionButtonContainer,
        PostCardContainer,
        PostReactionButton,
        PostAuthorIcon,
        PostAuthorDisplayName,
        PostAuthorHandle,
        postCreatedAt,
        moreButton,
        skeletonIcon,
        skeletonName,
        skeletonHandle,
        skeletonText1line,
        skeletonText2line,
        chip,
        bookmarkButton,
        replyButton,
        repostButton,
        likeButton,
    } = viewPostCard()
    const quoteCardStyles = viewQuoteCard()

    const [isLiked, setIsLiked] = useState<boolean>(!!postView?.viewer?.like)
    const [isReposted, setIsReposted] = useState<boolean>(
        !!postView?.viewer?.repost
    )
    const [isDeleted, setIsDeleted] = useState<boolean>(false)
    const [userPreference] = useUserPreferencesAtom()
    const [contentWarning, setContentWarning] = useState<boolean>(false)
    const [warningReason, setWarningReason] = useState<string>("")
    const [, setHandleButtonClick] = useState(false)
    const [bookmarks, setBookmarks] = useBookmarks()
    const [isBookmarked, setIsBookmarked] = useState<boolean>(false)

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

    const handleBookmark = async (uri: string) => {
        const createdAt = new Date().getTime()
        const json: Bookmark = {
            uri: uri,
            category: null,
            createdAt: createdAt,
            updatedAt: createdAt,
            deletedAt: null,
        }
        const isDuplicate = bookmarks.some((bookmark) => bookmark.uri === uri)

        if (!isDuplicate) {
            setBookmarks([...bookmarks, json])
            setIsBookmarked(true)
        } else {
            setBookmarks(bookmarks.filter((bookmark) => bookmark.uri !== uri))
            setIsBookmarked(false)
        }
    }

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
            return postView.embed as AppBskyEmbedRecord.View
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
            return postView?.embed?.record as GeneratorView
        } else {
            return null
        }
    }, [postJson, quoteJson])

    const embedMuteList = useMemo((): ListView | null => {
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
                "app.bsky.graph.defs#listView"
        ) {
            return postView?.embed?.record as ListView
        } else {
            return null
        }
    }, [postJson, quoteJson])

    const notfoundEmbedRecord = useMemo((): AppBskyEmbedRecord.View | null => {
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
                "app.bsky.embed.record#viewNotFound"
        ) {
            return postView?.embed?.record as AppBskyEmbedRecord.View
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
            await agent.deletePost(postJson?.uri)
            setIsDeleted(true)
        } catch (e) {
            console.log(e)
        } finally {
            setLoading(false)
        }
    }

    const handleImageClick = useCallback(
        (index: number) => {
            if (embedImages?.images) {
                const images: ImageObject[] = []

                for (const image of embedImages.images) {
                    const currentImage: ImageObject = {
                        fullsize: "",
                        alt: "",
                    }

                    currentImage.fullsize = image.fullsize
                    currentImage.alt = image.alt

                    images.push(currentImage)
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

    const deletehttp = (text: string) => {
        return text.replace(/^https?:\/\//, "")
    }

    const addParamsToUrl = (hashtag: string) => {
        const queryParams = new URLSearchParams(nextQueryParams)
        queryParams.set("word", `${hashtag.replace("#", "")}`)
        queryParams.set("target", "posts")
        return `/search?${queryParams.toString()}` as string
    }

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
                        <Link
                            key={`link-${index}-${byteStart}`}
                            className={"text-blue-500"}
                            onClick={(e) => {
                                e.stopPropagation()
                            }}
                            href={`/profile/${
                                facet.features[0].did
                            }?${nextQueryParams.toString()}`}
                        >
                            {facetText}
                        </Link>
                    )
                    break

                case "app.bsky.richtext.facet#link":
                    result.push(
                        <span key={`link-${index}-${byteStart}`}>
                            <Chip
                                className={chip()}
                                size={"sm"}
                                startContent={
                                    <Tooltip
                                        showArrow={true}
                                        color={"foreground"}
                                        content={
                                            deletehttp(facetText) ===
                                            deletehttp(facet.features[0].uri)
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
                                                deletehttp(facetText) ===
                                                deletehttp(
                                                    facet.features[0].uri
                                                )
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
                                    deletehttp(facetText) ===
                                    deletehttp(facet.features[0].uri)
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
                                    <Link
                                        key={`a-${index}-${byteStart}`}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                        }}
                                        href={
                                            facet.features[0].uri.replace(
                                                "https://bsky.app",
                                                `${location.protocol}//${window.location.host}`
                                            ) + `?${nextQueryParams.toString()}`
                                        }
                                    >
                                        {facetText}
                                    </Link>
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
                                size={"sm"}
                                startContent={
                                    <FontAwesomeIcon icon={faHashtag} />
                                }
                                variant="faded"
                                color="primary"
                            >
                                <Link
                                    key={`a-${index}-${byteStart}`}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                    }}
                                    href={addParamsToUrl(facet.features[0].tag)}
                                >
                                    {facetText.replace("#", "")}
                                </Link>
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
                        if (!userPreference.adultContentEnabled) {
                            setIsDeleted(true)
                        }
                    case "hate":
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

    useEffect(() => {
        if (!embedRecord) {
            return
        }

        if (
            !embedRecordViewRecord?.author ||
            !embedRecordViewRecord?.author.viewer
        ) {
            return
        }

        if (
            embedRecordViewRecord.author.viewer?.blockedBy ||
            embedRecordViewRecord.author.viewer?.muted ||
            embedRecordViewRecord.author.viewer?.blocking
        ) {
            setIsDeleted(true)
        }
    }, [])

    useEffect(() => {
        const postUri = postJson?.uri || quoteJson?.uri || json?.post?.uri
        if (!postUri) return
        const isBookmarked = bookmarks.some(
            (bookmark) => bookmark.uri === postUri
        )
        setIsBookmarked(isBookmarked)
    }, [postJson, quoteJson, json])

    return (
        !isDeleted && (
            <div
                className={quoteJson ? quoteCardStyles.PostCardContainer() : ""}
            >
                <Modal
                    isOpen={isOpenReply}
                    onOpenChange={onOpenChangeReply}
                    placement={isMobile ? "top" : "center"}
                    className={"z-[100] max-w-[600px] bg-transparent"}
                >
                    <ModalContent>
                        {(onClose) => (
                            <PostModal
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
                    target={"post"}
                    post={postJson}
                    nextQueryParams={nextQueryParams}
                />
                <main
                    className={`${
                        quoteJson
                            ? quoteCardStyles.PostCard()
                            : PostCard({ isEmbedToModal })
                    } ${
                        isEmbedToModal ? `border-none` : `cursor-pointer`
                    } group`}
                    style={{
                        backgroundColor: isEmbedToModal ? "transparent" : "",
                    }}
                    onClick={(e) => {
                        e.stopPropagation()
                        if (isSkeleton) return
                        router.push(
                            `/profile/${postJsonData?.author.did}/post/${
                                postJsonData?.uri.match(/\/(\w+)$/)?.[1] || ""
                            }?${nextQueryParams.toString()}`
                        )
                    }}
                >
                    <div className={`${PostCardContainer({ isEmbedToModal })}`}>
                        {json?.reason && (
                            <Link
                                className={`text-[13px] ml-[40px] text-[#909090] text-bold hover:cursor-pointer md:hover:underline`}
                                onClick={(e) => {
                                    e.stopPropagation()
                                }}
                                href={`/profile/${postJsonData?.author
                                    .did}?${nextQueryParams.toString()}`}
                            >
                                <FontAwesomeIcon icon={faRetweet} /> Reposted by{" "}
                                {(json.reason.by as ProfileViewBasic)
                                    .displayName || ""}
                            </Link>
                        )}
                        <div
                            className={`${PostAuthor()} ${
                                isEmbedToModal ? `z-[2]` : `z-[0]`
                            }`}
                        >
                            <span className={"flex items-center"}>
                                <Link
                                    className={PostAuthorIcon({
                                        isEmbedToPost,
                                    })}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                    }}
                                    href={`/profile/${postJsonData?.author
                                        .did}?${nextQueryParams.toString()}`}
                                >
                                    {isSkeleton ? (
                                        <Skeleton className={skeletonIcon()} />
                                    ) : (
                                        <img
                                            src={
                                                postJsonData?.author?.avatar ||
                                                defaultIcon.src
                                            }
                                            //radius={"lg"}
                                            className={``}
                                            alt={postJsonData?.author.did}
                                        />
                                    )}
                                </Link>
                                <Link
                                    onClick={(e) => {
                                        e.stopPropagation()
                                    }}
                                    href={`/profile/${postJsonData?.author
                                        .did}?${nextQueryParams.toString()}`}
                                >
                                    {isSkeleton ? (
                                        <Skeleton className={skeletonName()} />
                                    ) : (
                                        <span
                                            className={`${PostAuthorDisplayName()} md:hover:underline`}
                                            style={{ fontSize: "13px" }}
                                        >
                                            {postJsonData?.author?.displayName}
                                        </span>
                                    )}
                                </Link>
                                {!isSkeleton && (
                                    <div className={"text-[#BABABA]"}>
                                        &nbsp;-&nbsp;
                                    </div>
                                )}
                                <Link
                                    onClick={(e) => {
                                        e.stopPropagation()
                                    }}
                                    href={`/profile/${postJsonData?.author
                                        .did}?${nextQueryParams.toString()}`}
                                >
                                    {isSkeleton ? (
                                        <Skeleton
                                            className={skeletonHandle()}
                                        />
                                    ) : (
                                        <span
                                            className={`${PostAuthorHandle()} md:hover:underline`}
                                        >
                                            {postJsonData?.author?.handle}
                                        </span>
                                    )}
                                </Link>
                            </span>

                            <div
                                className={`${postCreatedAt()} group-hover:md:hidden md:flex`}
                            >
                                {!isSkeleton &&
                                    postJsonData &&
                                    formattedSimpleDate(
                                        postJsonData.indexedAt,
                                        now || new Date()
                                    )}
                            </div>

                            <div
                                className={`${moreButton()} group-hover:md:flex md:hidden hidden`}
                            >
                                {!isEmbedToModal && !isSkeleton && (
                                    <Dropdown
                                        className={"text-black dark:text-white"}
                                    >
                                        <DropdownTrigger>
                                            <FontAwesomeIcon
                                                icon={faEllipsis}
                                                className={
                                                    "h-[20px] mb-[4px] cursor-pointer text-[#909090]"
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
                                                            postJsonData.author
                                                                .did
                                                        }/post/${
                                                            postJsonData.uri.match(
                                                                /\/(\w+)$/
                                                            )?.[1] || ""
                                                        }`
                                                    )
                                                    void navigator.clipboard.writeText(
                                                        `https://bsky.app/profile/${
                                                            postJsonData.author
                                                                .did
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
                                                    void navigator.clipboard.writeText(
                                                        JSON.stringify(postJson)
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
                                                    postJsonData.author.did ? (
                                                    <DropdownItem
                                                        key="report"
                                                        className="text-danger"
                                                        color="danger"
                                                        startContent={
                                                            <FontAwesomeIcon
                                                                icon={faFlag}
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
                                                                icon={faTrash}
                                                            />
                                                        }
                                                        onClick={async () => {
                                                            await handleDelete()
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
                                )}
                            </div>
                        </div>
                        <div className={PostContent({ isEmbedToPost })}>
                            {isSkeleton ? (
                                <div className="w-full flex flex-col gap-2">
                                    <Skeleton className={skeletonText1line()} />
                                    <Skeleton className={skeletonText2line()} />
                                </div>
                            ) : (
                                <>
                                    {json?.reply && (
                                        <div
                                            className={
                                                "text-[#BABABA] text-[12px] dark:text-[#787878]"
                                            }
                                        >
                                            <FontAwesomeIcon icon={faReply} />{" "}
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
                                        className={`${PostContentText()} ${
                                            isEmbedToPost && `text-[13px]`
                                        }`}
                                    >
                                        {renderTextWithLinks}
                                    </div>
                                </>
                            )}
                            {embedImages && !contentWarning && (
                                <EmbedImages
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
                                        {t("components.ViewPostCard.warning")}:{" "}
                                        {warningReason}
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
                                    embedMedia={embedMedia}
                                    onImageClick={(index: number) => {
                                        handleImageClick(index)
                                    }}
                                    nextQueryParams={nextQueryParams}
                                />
                            )}
                            {embedExternal &&
                                !isEmbedToPost &&
                                !isEmbedToModal && (
                                    <div className={"h-full w-full mt-[5px]"}>
                                        <Linkcard
                                            ogpData={embedExternal.external}
                                        />
                                    </div>
                                )}
                            {embedRecord &&
                                embedRecordViewRecord &&
                                !embedFeed &&
                                !embedMuteList &&
                                !notfoundEmbedRecord && (
                                    <ViewPostCard
                                        quoteJson={embedRecordViewRecord}
                                        isEmbedToPost={true}
                                        nextQueryParams={nextQueryParams}
                                        t={t}
                                    />
                                )}
                            {embedFeed && <ViewFeedCard feed={embedFeed} />}
                            {embedMuteList && (
                                <ViewMuteListCard list={embedMuteList} />
                            )}
                            {notfoundEmbedRecord && <ViewNotFoundCard />}
                        </div>
                        {!isEmbedToPost && (
                            <div className={PostReactionButtonContainer()}>
                                <div
                                    className={`flex ${isSkeleton && `hidden`}`}
                                >
                                    <div
                                        className={`${bookmarkButton()} group-hover:md:block ${
                                            !isBookmarked && `md:hidden`
                                        }`}
                                    >
                                        <FontAwesomeIcon
                                            icon={
                                                isBookmarked
                                                    ? faBookmarkSolid
                                                    : faBookmarkRegular
                                            }
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                const postUri =
                                                    postJson?.uri ||
                                                    quoteJson?.uri ||
                                                    json?.post?.uri
                                                if (!postUri) return
                                                handleBookmark(postUri)
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className={``}>
                                    {!isEmbedToModal && (
                                        <>
                                            <div
                                                className={`flex ${
                                                    isSkeleton && `hidden`
                                                }`}
                                            >
                                                <div
                                                    className={`${PostReactionButton()} ${replyButton()} group-hover:md:block md:hidden`}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faComment}
                                                        onClick={async (e) => {
                                                            e.stopPropagation()
                                                            setHandleButtonClick(
                                                                true
                                                            )
                                                            await handleReply()
                                                        }}
                                                    />
                                                </div>
                                                <div
                                                    className={`${PostReactionButton()} ${repostButton(
                                                        {
                                                            isReacted:
                                                                isReposted,
                                                        }
                                                    )} group-hover:md:block ${
                                                        !isReposted &&
                                                        `md:hidden`
                                                    }`}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faRetweet}
                                                        onClick={async (e) => {
                                                            e.stopPropagation()
                                                            setHandleButtonClick(
                                                                true
                                                            )
                                                            await handleRepost()
                                                        }}
                                                    />
                                                </div>
                                                <div
                                                    className={`${PostReactionButton()} ${likeButton(
                                                        { isReacted: isLiked }
                                                    )} group-hover:md:block ${
                                                        !isLiked && `md:hidden`
                                                    }`}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={
                                                            isLiked
                                                                ? faHeartSolid
                                                                : faHeartRegular
                                                        }
                                                        onClick={async (e) => {
                                                            e.stopPropagation()
                                                            setHandleButtonClick(
                                                                true
                                                            )
                                                            await handleLike()
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        )
    )
}

interface EmbedImagesProps {
    embedImages: AppBskyEmbedImages.View
    onImageClick: (index: number) => void
}

const EmbedImages = ({ embedImages, onImageClick }: EmbedImagesProps) => {
    return (
        <ScrollShadow
            isEnabled={embedImages.images.length > 1}
            hideScrollBar={true}
            orientation="horizontal"
            className={`flex overflow-x-auto overflow-y-hidden w-100svw}]`}
        >
            {embedImages.images.map((image: ViewImage, index: number) => (
                <div
                    className={`mt-[10px] rounded-[7.5px] overflow-hidden min-w-[280px] max-w-[500px] h-[300px] ${
                        embedImages.images.length - 1 === index
                            ? `mr-[0px]`
                            : `mr-[7px]`
                    } bg-cover`}
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
    embedMedia: AppBskyEmbedRecordWithMedia.View
    onImageClick: (index: number) => void
    nextQueryParams: URLSearchParams
}

const EmbedMedia = ({
    embedMedia,
    onImageClick,
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
                className={`flex overflow-x-auto overflow-y-hidden w-100svw}]`}
            >
                {images.map((image: ViewImage, index: number) => (
                    <div
                        className={`mt-[10px] mb-[10px] rounded-[7.5px] overflow-hidden min-w-[280px] max-w-[500px] h-[300px] mr-[10px] bg-cover`}
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
                postJson={embedMedia.record.record}
                nextQueryParams={nextQueryParams}
            />
        </>
    )
}

export default ViewPostCard
