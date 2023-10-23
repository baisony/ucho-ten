"use client"
import React, { useCallback, useEffect, useState } from "react"
import { useAgent } from "@/app/_atoms/agent"
import type { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { usePathname, useRouter } from "next/navigation"
import { postOnlyPage } from "./styles"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faBookmark as faRegularBookmark,
    faComment,
    faStar as faRegularStar,
} from "@fortawesome/free-regular-svg-icons"
import {
    faArrowUpFromBracket,
    faBookmark as faSolidBookmark,
    faCheckCircle,
    faCircleQuestion,
    faCircleXmark,
    faCode,
    faEllipsis,
    faFlag,
    faHashtag,
    faLanguage,
    faLink,
    faQuoteLeft,
    faRetweet,
    faStar as faSolidStar,
    faTrash,
    faU,
    faUser,
} from "@fortawesome/free-solid-svg-icons"
import {
    Chip,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
    Modal,
    ModalContent,
    ScrollShadow,
    Tooltip,
    useDisclosure,
} from "@nextui-org/react"
import "react-swipeable-list/dist/styles.css"
import { ViewPostCard } from "@/app/components/ViewPostCard"
import { isMobile } from "react-device-detect"
import { PostModal } from "@/app/components/PostModal"
import { useTranslationLanguage } from "@/app/_atoms/translationLanguage"
import { useAppearanceColor } from "@/app/_atoms/appearanceColor"
import { AtUri } from "@atproto/api"
import { Bookmark, useBookmarks } from "@/app/_atoms/bookmarks"
import { ViewQuoteCard } from "@/app/components/ViewQuoteCard"
import { Linkcard } from "@/app/components/Linkcard"
import {
    ImageGalleryObject,
    ImageObject,
    useImageGalleryAtom,
} from "@/app/_atoms/imageGallery"
import { ReportModal } from "@/app/components/ReportModal"
import { useTranslation } from "react-i18next"
import { useNextQueryParamsAtom } from "@/app/_atoms/nextQueryParams"

export default function Root() {
    const [agent, setAgent] = useAgent()
    const { t } = useTranslation()
    const [imageGallery, setImageGallery] = useImageGalleryAtom()
    const [translateTo] = useTranslationLanguage()
    const [nextQueryParams] = useNextQueryParamsAtom()
    const router = useRouter()
    const [appearanceColor] = useAppearanceColor()
    const [loading, setLoading] = useState(false)
    const [loading2, setLoading2] = useState(false)
    const pathname = usePathname()
    const username = pathname.replace("/profile/", "")
    const atUri1 = pathname.replace("/profile/", "at://")
    let atUri = atUri1.replace("/post/", "/app.bsky.feed.post/")
    const [timeline, setTimeline] = useState<FeedViewPost[]>([])
    const [availavleNewTimeline, setAvailableNewTimeline] = useState(false)
    const [newTimeline, setNewTimeline] = useState<FeedViewPost[]>([])
    const [post, setPost] = useState<any>(null)
    const [newCursor, setNewCursor] = useState<string | null>(null)
    const [cursor, setCursor] = useState<string | null>(null)
    const [hasCursor, setHasCursor] = useState<string | null>(null)
    const [darkMode, setDarkMode] = useState(false)
    const [isTranslated, setIsTranslated] = useState(false)
    const [translatedText, setTranslatedText] = useState<string | null>(null)
    const [viewTranslatedText, setViewTranslatedText] = useState<boolean>(true)
    const [translateError, setTranslateError] = useState<boolean>(false)
    const [isLiked, setIsLiked] = useState<boolean>(false)
    const [isReposted, setIsReposted] = useState<boolean>(false)
    const [isBookmarked, setIsBookmarked] = useState<boolean>(false)
    const [isPostMine, setIsPostMine] = useState<boolean>(false)
    const [bookmarks, setBookmarks] = useBookmarks()
    const [modalType, setModalType] = useState<"Reply" | "Quote" | null>(null)
    const color = darkMode ? "dark" : "light"
    const { isOpen, onOpen, onOpenChange } = useDisclosure()
    const {
        isOpen: isOpenReport,
        onOpen: onOpenReport,
        onOpenChange: onOpenChangeReport,
    } = useDisclosure()

    const {
        Container,
        AuthorPost,
        Author,
        AuthorIcon,
        AuthorDisplayName,
        AuthorHandle,
        PostContent,
        PostCreatedAt,
        ReactionButtonContainer,
        ReactionButton,
        dropdown,
    } = postOnlyPage()

    const modeMe = (e: any) => {
        setDarkMode(!!e.matches)
    }

    useEffect(() => {
        if (appearanceColor === "system") {
            const matchMedia = window.matchMedia("(prefers-color-scheme: dark)")

            setDarkMode(matchMedia.matches)
            matchMedia.addEventListener("change", modeMe)

            return () => matchMedia.removeEventListener("change", modeMe)
        } else if (appearanceColor === "dark") {
            setDarkMode(true)
        } else if (appearanceColor === "light") {
            setDarkMode(false)
        }
    }, [appearanceColor])

    const FormattingTimeline = (timeline: FeedViewPost[]) => {
        const seenUris = new Set<string>()
        const filteredData = timeline.filter((item) => {
            const uri = item.post.uri
            if (item.reply) {
                if (item.reason) return true
                if (
                    //@ts-ignore
                    item.post.author.did === item.reply.parent.author.did &&
                    //@ts-ignore
                    item.reply.parent.author.did === item.reply.root.author.did
                )
                    return true
                return false
            }
            // まだ uri がセットに登録されていない場合、trueを返し、セットに登録する
            if (!seenUris.has(uri)) {
                seenUris.add(uri)
                return true
            }
            return false
        })
        return filteredData as FeedViewPost[]
    }

    const fetchPost = async () => {
        if (!agent) return
        try {
            if (!atUri.startsWith("at://did:")) {
                const toAtUri = new AtUri(atUri)
                const did = await agent.resolveHandle({
                    handle: toAtUri.hostname,
                })
                atUri = atUri.replace(toAtUri.hostname, did.data.did)
            }
            const { data } = await agent.getPostThread({ uri: atUri })
            setPost(data.thread)
            setIsLiked(!!(data.thread.post as any).viewer?.like)
            setIsReposted(!!(data.thread.post as any).viewer?.repost)
        } catch (e) {
            console.log(e)
        }
    }

    const loadMore = async (page: any) => {
        if (!agent) return
        if (!cursor) return
        if (loading) return
        if (loading2) return
        try {
            setLoading2(true)
            const { data } = await agent.getAuthorFeed({
                cursor: !hasCursor ? cursor : hasCursor,
                actor: username,
            })
            const { feed } = data
            if (data.cursor) {
                setHasCursor(data.cursor)
            }
            const filteredData = FormattingTimeline(feed)
            const diffTimeline = filteredData.filter((newItem) => {
                return !timeline.some(
                    (oldItem) => oldItem.post.uri === newItem.post.uri
                )
            })

            //取得データをリストに追加
            setTimeline([...timeline, ...diffTimeline])
            setLoading2(false)
        } catch (e) {
            setLoading2(false)
            console.log(e)
        }
    }

    useEffect(() => {
        if (!agent) return
        fetchPost()
    }, [agent, atUri])

    const handleImageClick = useCallback(
        (index: number) => {
            if (
                post.post?.embed?.images &&
                Array.isArray(post.post?.embed.images)
            ) {
                const images: ImageObject[] = []

                for (const image of post.post.embed.images) {
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
        [post]
    )

    const renderTextWithLinks = () => {
        const encoder = new TextEncoder()
        const decoder = new TextDecoder()
        if (!post.post.record?.facets) {
            const memo: any[] = []
            post.post.record.text.split("\n").map((line: any, i: number) => {
                memo.push(
                    <p key={i}>
                        {line}
                        <br />
                    </p>
                )
            })
            return memo
        }
        const { text, facets } = post.post.record
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
                        <div
                            key={`link-${index}-${byteStart}`}
                            onClick={() => {
                                router.push(
                                    `/profile/${
                                        facet.features[0].did
                                    }?${nextQueryParams.toString()}`
                                )
                            }}
                        >
                            {facetText}
                        </div>
                    )
                    break

                case "app.bsky.richtext.facet#link":
                    result.push(
                        <span>
                            <Chip
                                className={color}
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
                                <a
                                    key={`a-${index}-${byteStart}`}
                                    href={facet.features[0].uri}
                                    target={"_blank"}
                                    rel={"noopener noreferrer"}
                                >
                                    <>
                                        <FontAwesomeIcon icon={faLink} />
                                        {facetText}
                                    </>
                                </a>
                            </Chip>
                        </span>
                    )
                    break

                case "app.bsky.richtext.facet#tag":
                    result.push(
                        <span>
                            <Chip
                                className={color}
                                startContent={
                                    <FontAwesomeIcon icon={faHashtag} />
                                }
                                variant="faded"
                                color="primary"
                            >
                                <div
                                    key={`a-${index}-${byteStart}`}
                                    onClick={() => {
                                        const queryParams = new URLSearchParams(
                                            nextQueryParams
                                        )
                                        queryParams.set(
                                            "word",
                                            facet.features[0].tag.replace(
                                                "#",
                                                "%23"
                                            )
                                        )
                                        queryParams.set("target", "posts")
                                        router.push(
                                            `/search?${nextQueryParams.toString()}`
                                        )
                                    }}
                                >
                                    {facetText.replace("#", "")}
                                </div>
                            </Chip>
                        </span>
                    )
                    break
            }

            lastOffset = byteEnd
        })

        // 最後のテキストを追加
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
    }

    function formatDate(inputDate: string): string {
        const date = new Date(inputDate)
        if (isNaN(date.getTime())) return "Invalid date" // 無効な日付が与えられた場合
        // 年、月、日、時、分、秒を取得
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const day = String(date.getDate()).padStart(2, "0")
        const hours = String(date.getHours()).padStart(2, "0")
        const minutes = String(date.getMinutes()).padStart(2, "0")
        const seconds = String(date.getSeconds()).padStart(2, "0")

        return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`
    }

    function renderNestedViewPostCards(
        post: any,
        color: "dark" | "light",
        isMobile: boolean
    ): JSX.Element | null {
        if (post && post.parent) {
            const nestedViewPostCards = renderNestedViewPostCards(
                post.parent,
                color,
                isMobile
            )
            return (
                <>
                    {nestedViewPostCards}
                    <ViewPostCard
                        color={color}
                        postJson={post.parent.post}
                        isMobile={isMobile}
                        nextQueryParams={nextQueryParams}
                        t={t}
                    />
                </>
            )
        }
        return null
    }

    function renderNestedRepliesViewPostCards(
        post: any,
        color: "dark" | "light",
        isMobile: boolean
    ): JSX.Element | null {
        if (post && post.replies) {
            const nestedViewPostCards = renderNestedViewPostCards(
                post.replies,
                color,
                isMobile
            ) // 再帰呼び出し

            return (
                <>
                    {nestedViewPostCards}
                    <ViewPostCard
                        color={color}
                        postJson={post.replies.post}
                        isMobile={isMobile}
                        nextQueryParams={nextQueryParams}
                        t={t}
                    />
                </>
            )
        }
        return null // ネストが終了したらnullを返す
    }

    const handleReply = async () => {
        console.log("open")
        setModalType("Reply")
        onOpen()
    }

    const handleQuote = async () => {
        console.log("open")
        setModalType("Quote")
        onOpen()
    }

    const handleRepost = async () => {
        if (loading) return
        setLoading(true)
        if (isReposted) {
            setIsReposted(!isReposted)
            const res = await agent?.deleteRepost(post.post.viewer?.repost)
        } else {
            setIsReposted(!isReposted)
            const res = await agent?.repost(post.post.uri, post.post.cid)
        }
        setLoading(false)
    }

    const handleLike = async () => {
        if (loading) return
        setLoading(true)
        if (isLiked) {
            setIsLiked(!isLiked)
            const res = await agent?.deleteLike(post.post.viewer?.like)
        } else {
            setIsLiked(!isLiked)
            const res = await agent?.like(post.post.uri, post.post.cid)
        }
        setLoading(false)
    }
    const handleBookmark = async () => {
        const createdAt = new Date().getTime()
        const json: Bookmark = {
            uri: post.post.uri,
            category: null,
            createdAt: createdAt,
            updatedAt: createdAt,
            deletedAt: null,
        }
        const isDuplicate = bookmarks.some(
            (bookmark) => bookmark.uri === json.uri
        )

        if (!isDuplicate) {
            setBookmarks([...bookmarks, json])
            setIsBookmarked(true)
        } else {
            setBookmarks(
                bookmarks.filter((bookmark) => bookmark.uri !== json.uri)
            )
            setIsBookmarked(false)
        }
    }
    console.log(post)

    useEffect(() => {
        if (!post?.post?.uri) return
        const isBookmarked = bookmarks.some(
            (bookmark) => bookmark.uri === post.post.uri
        )
        setIsBookmarked(isBookmarked)
    }, [post])
    return (
        post && (
            <>
                <Modal
                    isOpen={isOpen}
                    onOpenChange={onOpenChange}
                    placement={isMobile ? "top" : "center"}
                    className={"z-[100] max-w-[600px]"}
                >
                    <ModalContent>
                        {(onClose) => (
                            <PostModal
                                color={color}
                                type={modalType ? modalType : "Reply"}
                                postData={post.post}
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
                    post={post.post}
                    nextQueryParams={nextQueryParams}
                />
                <main className={`${Container({ color: color })} mt-[100px]`}>
                    {post?.parent && (
                        <>{renderNestedViewPostCards(post, color, isMobile)}</>
                    )}
                    <div className={AuthorPost({ color: color })}>
                        <div className={Author()}>
                            <div
                                className={AuthorIcon()}
                                onClick={() => {
                                    router.push(
                                        `/profile/${
                                            post.post.author.did
                                        }?${nextQueryParams.toString()}`
                                    )
                                }}
                            >
                                {post.post.author?.avatar ? (
                                    <img src={post.post.author?.avatar} />
                                ) : (
                                    <FontAwesomeIcon
                                        className={`h-full w-full`}
                                        icon={faUser}
                                    />
                                )}
                            </div>
                            <div>
                                <div
                                    className={AuthorDisplayName()}
                                    onClick={() => {
                                        router.push(
                                            `/profile/${
                                                post.post.author.did
                                            }?${nextQueryParams.toString()}`
                                        )
                                    }}
                                >
                                    {post.post.author?.displayName}
                                </div>
                                <div
                                    className={AuthorHandle()}
                                    onClick={() => {
                                        router.push(
                                            `/profile/${
                                                post.post.author.did
                                            }?${nextQueryParams.toString()}`
                                        )
                                    }}
                                >
                                    {post.post.author?.handle}
                                </div>
                            </div>
                        </div>
                        <div className={PostContent()}>
                            {renderTextWithLinks()}
                            {translateError && (
                                <div className={"text-red-500"}>
                                    {t("pages.postOnlyPage.translateError")}
                                </div>
                            )}
                            {translatedText !== null && viewTranslatedText && (
                                <>
                                    <div className={"select-none"}>
                                        Translated by Google
                                        <span
                                            onClick={() => {
                                                setViewTranslatedText(false)
                                            }}
                                            className={"cursor-pointer"}
                                        >
                                            &nbsp;-{" "}
                                            {t(
                                                "pages.postOnlyPage.viewOriginal"
                                            )}
                                        </span>
                                    </div>
                                    <div>{translatedText}</div>
                                </>
                            )}
                            <div className={"overflow-x-scroll"}>
                                {post.post?.embed &&
                                    (post.post?.embed?.$type ===
                                        "app.bsky.embed.images#view" ||
                                    post.post?.embed.$type ===
                                        "app.bsky.embed.recordWithMedia#view" ? (
                                        <>
                                            <ScrollShadow
                                                hideScrollBar
                                                orientation="horizontal"
                                            >
                                                <div
                                                    className={`flex overflow-x-auto overflow-y-hidden w-100svw}]`}
                                                >
                                                    {(post.post.embed.$type ===
                                                    "app.bsky.embed.recordWithMedia#view"
                                                        ? post.post.embed.media
                                                              .images
                                                        : post.post.embed.images
                                                    ).map(
                                                        (
                                                            image: any,
                                                            index: number
                                                        ) => (
                                                            <div
                                                                className={`mt-[10px] mb-[10px] rounded-[7.5px] overflow-hidden min-w-[280px] max-w-[500px] h-[300px] mr-[10px] bg-cover`}
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
                                            {post.post?.embed.$type ===
                                                "app.bsky.embed.recordWithMedia#view" && (
                                                <>
                                                    <ViewQuoteCard
                                                        color={color}
                                                        postJson={
                                                            post.post.embed
                                                                ?.record.record
                                                        }
                                                        nextQueryParams={
                                                            nextQueryParams
                                                        }
                                                    />
                                                </>
                                            )}
                                        </>
                                    ) : post.post?.embed.$type ===
                                      "app.bsky.embed.external#view" ? (
                                        <Linkcard
                                            color={color}
                                            ogpData={post.post.embed.external}
                                        />
                                    ) : (
                                        post.post?.embed.$type ===
                                            "app.bsky.embed.record#view" && (
                                            <ViewQuoteCard
                                                color={color}
                                                postJson={
                                                    post.post.embed?.record
                                                }
                                                nextQueryParams={
                                                    nextQueryParams
                                                }
                                            />
                                        )
                                    ))}
                            </div>
                        </div>
                        <div className={PostCreatedAt()}>
                            {formatDate(post.post.indexedAt)}
                        </div>
                        <div className={ReactionButtonContainer()}>
                            <FontAwesomeIcon
                                icon={faComment}
                                className={ReactionButton()}
                                onClick={() => {
                                    handleReply()
                                }}
                            />
                            <FontAwesomeIcon
                                icon={faQuoteLeft}
                                className={ReactionButton()}
                                onClick={() => {
                                    handleQuote()
                                }}
                            />
                            <FontAwesomeIcon
                                icon={faRetweet}
                                className={ReactionButton()}
                                style={{
                                    color: isReposted ? "#17BF63" : "#909090",
                                }}
                                onClick={() => {
                                    handleRepost()
                                }}
                            />
                            <FontAwesomeIcon
                                icon={!isLiked ? faRegularStar : faSolidStar}
                                className={ReactionButton()}
                                style={{
                                    color: isLiked ? "#fd7e00" : "#909090",
                                }}
                                onClick={() => {
                                    handleLike()
                                }}
                            />
                            <FontAwesomeIcon
                                icon={
                                    !isBookmarked
                                        ? faRegularBookmark
                                        : faSolidBookmark
                                }
                                className={ReactionButton()}
                                onClick={() => {
                                    handleBookmark()
                                }}
                            />
                            <Dropdown className={dropdown({ color: color })}>
                                <DropdownTrigger>
                                    <FontAwesomeIcon
                                        icon={faEllipsis}
                                        className={ReactionButton()}
                                    />
                                </DropdownTrigger>
                                <DropdownMenu>
                                    <DropdownSection
                                        title="Actions"
                                        showDivider
                                    >
                                        <DropdownItem
                                            key="share"
                                            startContent={
                                                <FontAwesomeIcon
                                                    icon={faArrowUpFromBracket}
                                                />
                                            }
                                        >
                                            {t("pages.postOnlyPage.share")}
                                        </DropdownItem>
                                        {post.post.record?.text && (
                                            <DropdownItem
                                                key="translate"
                                                startContent={
                                                    <FontAwesomeIcon
                                                        icon={faLanguage}
                                                    />
                                                }
                                                onClick={async () => {
                                                    setIsTranslated(true)
                                                    setViewTranslatedText(true)
                                                    const res = await fetch(
                                                        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${
                                                            translateTo[0]
                                                                ? translateTo[0]
                                                                : `auto`
                                                        }&dt=t&q=` +
                                                            encodeURIComponent(
                                                                post.post.record
                                                                    .text
                                                            )
                                                    )
                                                    if (res.status === 200) {
                                                        const json =
                                                            await res.json()
                                                        if (
                                                            json[0] !==
                                                            undefined
                                                        ) {
                                                            const combinedText =
                                                                json[0].reduce(
                                                                    (
                                                                        acc: string,
                                                                        item: any[]
                                                                    ) => {
                                                                        if (
                                                                            item[0]
                                                                        ) {
                                                                            return (
                                                                                acc +
                                                                                item[0]
                                                                            )
                                                                        }
                                                                        return acc
                                                                    },
                                                                    ""
                                                                )
                                                            setTranslatedText(
                                                                combinedText
                                                            )
                                                        }
                                                    } else {
                                                        setTranslateError(true)
                                                    }
                                                }}
                                            >
                                                {t(
                                                    "pages.postOnlyPage.translate"
                                                )}
                                            </DropdownItem>
                                        )}
                                    </DropdownSection>
                                    <DropdownSection
                                        title="Copy"
                                        showDivider={isPostMine}
                                    >
                                        <DropdownItem
                                            key="json"
                                            startContent={
                                                <FontAwesomeIcon
                                                    icon={faCode}
                                                />
                                            }
                                            onClick={() => {
                                                navigator.clipboard.writeText(
                                                    JSON.stringify(post.post)
                                                )
                                            }}
                                        >
                                            {t("pages.postOnlyPage.copyJSON")}
                                        </DropdownItem>
                                        <DropdownItem
                                            key="uri"
                                            startContent={
                                                <FontAwesomeIcon icon={faU} />
                                            }
                                            onClick={() => {
                                                navigator.clipboard.writeText(
                                                    atUri
                                                )
                                            }}
                                        >
                                            {t("pages.postOnlyPage.copyURL")}
                                        </DropdownItem>
                                        <DropdownItem
                                            key="did"
                                            startContent={
                                                <FontAwesomeIcon
                                                    icon={faUser}
                                                />
                                            }
                                            onClick={() => {
                                                navigator.clipboard.writeText(
                                                    post.post.author.did
                                                )
                                            }}
                                        >
                                            {t("pages.postOnlyPage.copyDID")}
                                        </DropdownItem>
                                    </DropdownSection>
                                    <DropdownSection title="Danger zone">
                                        {agent?.session?.did !==
                                        post.post.author.did ? (
                                            <DropdownItem
                                                key="delete"
                                                className="text-danger"
                                                color="danger"
                                                startContent={
                                                    <FontAwesomeIcon
                                                        icon={faFlag}
                                                    />
                                                }
                                                onClick={() => {
                                                    onOpenReport()
                                                }}
                                            >
                                                {t("pages.postOnlyPage.report")}
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
                                            >
                                                {t("pages.postOnlyPage.delete")}
                                            </DropdownItem>
                                        )}
                                    </DropdownSection>
                                </DropdownMenu>
                            </Dropdown>
                        </div>
                    </div>
                    {post.replies && (
                        <>
                            {post.replies.map((item: any, index: number) => (
                                <ViewPostCard
                                    key={index}
                                    color={color}
                                    postJson={item.post}
                                    isMobile={isMobile}
                                    nextQueryParams={nextQueryParams}
                                    t={t}
                                />
                            ))}
                        </>
                    )}
                </main>
            </>
        )
    )
}
