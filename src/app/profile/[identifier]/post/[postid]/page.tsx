"use client"
import React, { useCallback, useEffect, useState } from "react"
import { useAgent } from "@/app/_atoms/agent"
import type {
    FeedViewPost,
    PostView,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs"
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
    faQuoteLeft,
    faRetweet,
    faStar as faSolidStar,
    faTrash,
    faU,
    faUser,
    faVolumeXmark,
} from "@fortawesome/free-solid-svg-icons"
import defaultIcon from "@/../public/images/icon/default_icon.svg"
import {
    Chip,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
    Modal,
    ModalBody,
    ModalContent,
    ScrollShadow,
    Tooltip,
    useDisclosure,
} from "@nextui-org/react"
import "react-swipeable-list/dist/styles.css"
import { ViewPostCard } from "@/app/_components/ViewPostCard"
import { isMobile } from "react-device-detect"
import { PostModal } from "@/app/_components/PostModal"
import { useTranslationLanguage } from "@/app/_atoms/translationLanguage"
import { AtUri } from "@atproto/api"
import { Bookmark, useBookmarks } from "@/app/_atoms/bookmarks"
import { ViewQuoteCard } from "@/app/_components/ViewQuoteCard"
import { Linkcard } from "@/app/_components/Linkcard"
import {
    ImageGalleryObject,
    ImageObject,
    useImageGalleryAtom,
} from "@/app/_atoms/imageGallery"
import { ReportModal } from "@/app/_components/ReportModal"
import { useTranslation } from "react-i18next"
import { useNextQueryParamsAtom } from "@/app/_atoms/nextQueryParams"
import Link from "next/link"

export default function Root() {
    const [agent] = useAgent()
    const { t } = useTranslation()
    const [, setImageGallery] = useImageGalleryAtom()
    const [translateTo] = useTranslationLanguage()
    const [nextQueryParams] = useNextQueryParamsAtom()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [loading2, setLoading2] = useState(false)
    const pathname = usePathname()
    const username = pathname.replace("/profile/", "")
    const atUri1 = pathname.replace("/profile/", "at://")
    let atUri = atUri1.replace("/post/", "/app.bsky.feed.post/")
    const [timeline, setTimeline] = useState<FeedViewPost[]>([])
    //const [availavleNewTimeline, setAvailableNewTimeline] = useState(false)
    //const [newTimeline, setNewTimeline] = useState<FeedViewPost[]>([])
    const [post, setPost] = useState<any>(null)
    //const [newCursor, setNewCursor] = useState<string | null>(null)
    const [cursor] = useState<string | null>(null)
    const [hasCursor, setHasCursor] = useState<string | null>(null)
    const [, setIsTranslated] = useState(false)
    const [translatedText, setTranslatedText] = useState<string | null>(null)
    const [viewTranslatedText, setViewTranslatedText] = useState<boolean>(true)
    const [translateError, setTranslateError] = useState<boolean>(false)
    const [isLiked, setIsLiked] = useState<boolean>(false)
    const [isReposted, setIsReposted] = useState<boolean>(false)
    const [isBookmarked, setIsBookmarked] = useState<boolean>(false)
    const [isPostMine] = useState<boolean>(false)
    const [isMuted, setIsMuted] = useState<boolean>(false)
    const [bookmarks, setBookmarks] = useBookmarks()
    const [modalType, setModalType] = useState<"Reply" | "Quote" | null>(null)
    const { isOpen, onOpen, onOpenChange } = useDisclosure()
    const {
        isOpen: isOpenReport,
        onOpen: onOpenReport,
        onOpenChange: onOpenChangeReport,
    } = useDisclosure()

    const {
        isOpen: isOpenOption,
        onOpen: onOpenOption,
        onOpenChange: onOpenChangeOption,
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

    const FormattingTimeline = (timeline: FeedViewPost[]) => {
        const seenUris = new Set<string>()
        const filteredData = timeline.filter((item) => {
            const uri = item.post.uri
            if (item.reply) {
                if (item.reason) return true
                return (
                    //@ts-ignore
                    item.post.author.did === item.reply.parent.author.did &&
                    //@ts-ignore
                    item.reply.parent.author.did === item.reply.root.author.did
                )
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
            setIsLiked(!!(data.thread.post as PostView).viewer?.like)
            setIsReposted(!!(data.thread.post as PostView).viewer?.repost)
            setIsMuted(!!(data.thread.post as PostView).author.viewer?.muted)
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
        void fetchPost()
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

    const deletehttp = (text: string) => {
        return text.replace(/^https?:\/\//, "")
    }

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
                        <Link
                            key={`link-${index}-${byteStart}`}
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
                        <span>
                            <Chip
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
                                        href={facet.features[0].uri.replace(
                                            "https://bsky.app",
                                            `${location.protocol}//${window.location.host}`
                                        )}
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
                        <span>
                            <Chip
                                size={"sm"}
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
        isMobile: boolean
    ): JSX.Element | null {
        if (post && post.parent) {
            const nestedViewPostCards = renderNestedViewPostCards(
                post.parent,
                isMobile
            )
            return (
                <>
                    {nestedViewPostCards}
                    <ViewPostCard
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
        isMobile: boolean
    ): JSX.Element | null {
        if (post && post.replies) {
            const nestedViewPostCards = renderNestedViewPostCards(
                post.replies,
                isMobile
            ) // 再帰呼び出し

            return (
                <>
                    {nestedViewPostCards}
                    <ViewPostCard
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
            agent?.deleteRepost(post.post.viewer?.repost)
        } else {
            setIsReposted(!isReposted)
            agent?.repost(post.post.uri, post.post.cid)
        }
        setLoading(false)
    }

    const handleLike = async () => {
        if (loading) return
        setLoading(true)
        if (isLiked) {
            setIsLiked(!isLiked)
            await agent?.deleteLike(post.post.viewer?.like)
        } else {
            setIsLiked(!isLiked)
            await agent?.like(post.post.uri, post.post.cid)
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
    const handleMute = async () => {
        if (loading) return
        setLoading(true)
        if (isMuted) {
            setIsMuted(!isMuted)
            await agent?.unmute(post.post.author.did)
        } else {
            setIsMuted(!isMuted)
            await agent?.mute(post.post.author.did)
        }
        setLoading(false)
    }
    console.log(post)

    const translateContentText = async () => {
        setIsTranslated(true)
        setViewTranslatedText(true)
        const res = await fetch(
            `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${
                translateTo[0] ? translateTo[0] : `auto`
            }&dt=t&q=` + encodeURIComponent(post.post.record.text)
        )
        if (res.status === 200) {
            const json = await res.json()
            if (json[0] !== undefined) {
                const combinedText = json[0].reduce(
                    (acc: string, item: any[]) => {
                        if (item[0]) {
                            return acc + item[0]
                        }
                        return acc
                    },
                    ""
                )
                setTranslatedText(combinedText)
            }
        } else {
            setTranslateError(true)
        }
    }

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
                    className={"z-[100] max-w-[600px] bg-transparent"}
                >
                    <ModalContent>
                        {(onClose) => (
                            <PostModal
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
                    className={"z-[100] max-w-[600px] bg-transparent"}
                    target={"post"}
                    post={post.post}
                    nextQueryParams={nextQueryParams}
                />
                <Modal
                    isOpen={isOpenOption}
                    onOpenChange={onOpenChangeOption}
                    placement={"bottom"}
                    className={
                        "z-[100] max-w-[600px] text-black dark:text-white"
                    }
                    hideCloseButton
                >
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalBody>
                                    <span>
                                        <div
                                            className={
                                                "mt-[15px] mb-[15px] w-full"
                                            }
                                            onClick={async () => {
                                                if (!window.navigator.share) {
                                                    alert(
                                                        "ご利用のブラウザでは共有できません。"
                                                    )
                                                    return
                                                }
                                                try {
                                                    const url = new AtUri(atUri)
                                                    const bskyURL = `https://bsky.app/profile/${
                                                        url.host
                                                    }/${url.pathname.replace(
                                                        "/app.bsky.feed.post/",
                                                        "/post/"
                                                    )}`
                                                    console.log(url)
                                                    await window.navigator.share(
                                                        {
                                                            url: bskyURL,
                                                        }
                                                    )
                                                } catch (e) {}
                                            }}
                                        >
                                            <FontAwesomeIcon
                                                icon={faArrowUpFromBracket}
                                                className={"w-[40px]"}
                                            />
                                            {t("pages.postOnlyPage.share")}
                                        </div>
                                        <div
                                            className={
                                                "mt-[15px] mb-[15px] w-full"
                                            }
                                            onClick={async () => {
                                                await translateContentText()
                                            }}
                                        >
                                            <FontAwesomeIcon
                                                icon={faLanguage}
                                                className={"w-[40px]"}
                                            />
                                            {t("pages.postOnlyPage.translate")}
                                        </div>
                                        <div
                                            className={
                                                "mt-[15px] mb-[15px] w-full text-red-600"
                                            }
                                            onClick={() => {
                                                handleMute()
                                            }}
                                        >
                                            <FontAwesomeIcon
                                                icon={faVolumeXmark}
                                                className={"w-[40px]"}
                                            />
                                            {!isMuted ? (
                                                <span>Mute</span>
                                            ) : (
                                                <span>Un mute</span>
                                            )}
                                        </div>
                                        <div
                                            className={
                                                "mt-[15px] mb-[15px] w-full text-red-600"
                                            }
                                            onClick={() => {
                                                onOpenReport()
                                            }}
                                        >
                                            <FontAwesomeIcon
                                                icon={faFlag}
                                                className={"w-[40px]"}
                                            />
                                            Report
                                        </div>
                                    </span>
                                </ModalBody>
                            </>
                        )}
                    </ModalContent>
                </Modal>
                <main className={`${Container()} md:mt-[100px] mt-[85px]`}>
                    {post?.parent && (
                        <>{renderNestedViewPostCards(post, isMobile)}</>
                    )}
                    <div className={AuthorPost()}>
                        <div className={Author()}>
                            <div className={"flex items-center"}>
                                <Link
                                    className={AuthorIcon()}
                                    href={`/profile/${
                                        post.post.author.did
                                    }?${nextQueryParams.toString()}`}
                                >
                                    <img
                                        src={
                                            post.post?.author?.avatar ||
                                            defaultIcon.src
                                        }
                                        alt={"avatar"}
                                    />
                                </Link>
                                <div>
                                    <div>
                                        <Link
                                            className={AuthorDisplayName()}
                                            href={`/profile/${
                                                post.post.author.did
                                            }?${nextQueryParams.toString()}`}
                                        >
                                            {post.post.author?.displayName}
                                        </Link>
                                    </div>
                                    <div>
                                        <Link
                                            className={AuthorHandle()}
                                            href={`/profile/${
                                                post.post.author.did
                                            }?${nextQueryParams.toString()}`}
                                        >
                                            {post.post.author?.handle}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            <div
                                className={
                                    "md:h-[20px] h-[10px] hover:cursor-pointer items-center"
                                }
                            >
                                <Dropdown
                                    className={`${dropdown()} hidden md:block`}
                                >
                                    <DropdownTrigger>
                                        <FontAwesomeIcon
                                            icon={faEllipsis}
                                            className={
                                                "h-[20px] text-[#AAAAAA] hidden md:block"
                                            }
                                            size={"xs"}
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
                                                        icon={
                                                            faArrowUpFromBracket
                                                        }
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
                                                        translateContentText()
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
                                                    void navigator.clipboard.writeText(
                                                        JSON.stringify(
                                                            post.post
                                                        )
                                                    )
                                                }}
                                            >
                                                {t(
                                                    "pages.postOnlyPage.copyJSON"
                                                )}
                                            </DropdownItem>
                                            <DropdownItem
                                                key="uri"
                                                startContent={
                                                    <FontAwesomeIcon
                                                        icon={faU}
                                                    />
                                                }
                                                onClick={() => {
                                                    void navigator.clipboard.writeText(
                                                        atUri
                                                    )
                                                }}
                                            >
                                                {t(
                                                    "pages.postOnlyPage.copyURL"
                                                )}
                                            </DropdownItem>
                                            <DropdownItem
                                                key="did"
                                                startContent={
                                                    <FontAwesomeIcon
                                                        icon={faUser}
                                                    />
                                                }
                                                onClick={() => {
                                                    void navigator.clipboard.writeText(
                                                        post.post.author.did
                                                    )
                                                }}
                                            >
                                                {t(
                                                    "pages.postOnlyPage.copyDID"
                                                )}
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
                                                    {t(
                                                        "pages.postOnlyPage.report"
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
                                                >
                                                    {t(
                                                        "pages.postOnlyPage.delete"
                                                    )}
                                                </DropdownItem>
                                            )}
                                        </DropdownSection>
                                    </DropdownMenu>
                                </Dropdown>
                                <FontAwesomeIcon
                                    icon={faEllipsis}
                                    className={
                                        "h-[20px] flex text-[#AAAAAA] md:hidden"
                                    }
                                    size={"xs"}
                                    onClick={onOpenOption}
                                />
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
                                            {post.post?.embed.$type ===
                                                "app.bsky.embed.recordWithMedia#view" && (
                                                <>
                                                    <ViewQuoteCard
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
                                            ogpData={post.post.embed.external}
                                        />
                                    ) : (
                                        post.post?.embed.$type ===
                                            "app.bsky.embed.record#view" && (
                                            <ViewQuoteCard
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
                                    void handleReply()
                                }}
                            />
                            <FontAwesomeIcon
                                icon={faQuoteLeft}
                                className={`${ReactionButton()} hidden`}
                                onClick={() => {
                                    void handleQuote()
                                }}
                            />
                            <FontAwesomeIcon
                                icon={faRetweet}
                                className={ReactionButton()}
                                style={{
                                    color: isReposted ? "#17BF63" : "#909090",
                                }}
                                onClick={() => {
                                    void handleRepost()
                                }}
                            />
                            <FontAwesomeIcon
                                icon={!isLiked ? faRegularStar : faSolidStar}
                                className={ReactionButton()}
                                style={{
                                    color: isLiked ? "#fd7e00" : "#909090",
                                }}
                                onClick={() => {
                                    void handleLike()
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
                                    void handleBookmark()
                                }}
                            />
                        </div>
                    </div>
                    {post.replies && (
                        <>
                            {post.replies.map((item: any, index: number) => (
                                <ViewPostCard
                                    key={index}
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
