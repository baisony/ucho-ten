"use client"

import React, {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react"
import { useAgent } from "@/app/_atoms/agent"
import type { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { GeneratorView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { notFound, usePathname, useRouter } from "next/navigation"
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
    faCode,
    faEllipsis,
    faFlag,
    faLanguage,
    faQuoteLeft,
    faRetweet,
    faStar as faSolidStar,
    faTrash,
    faAt,
    faUser,
    faChain,
    faVolumeXmark,
} from "@fortawesome/free-solid-svg-icons"
import defaultIcon from "@/../public/images/icon/default_icon.svg"
import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
    Modal,
    ModalBody,
    ModalContent,
    ScrollShadow,
    Spinner,
    useDisclosure,
} from "@nextui-org/react"
import "react-swipeable-list/dist/styles.css"
import { ViewPostCard } from "@/app/_components/ViewPostCard"
import { isMobile } from "react-device-detect"
import { PostModal } from "@/app/_components/PostModal"
import { useTranslationLanguage } from "@/app/_atoms/translationLanguage"
import {
    AppBskyEmbedExternal,
    AppBskyEmbedImages,
    AppBskyEmbedRecord,
    AppBskyEmbedRecordWithMedia,
    AppBskyFeedDefs,
    AppBskyFeedPost,
    AtUri,
} from "@atproto/api"
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
import { ViewImage } from "@atproto/api/dist/client/types/app/bsky/embed/images"
import { ViewRecord } from "@atproto/api/dist/client/types/app/bsky/embed/record"
import { ListView } from "@atproto/api/dist/client/types/app/bsky/graph/defs"
import { ViewFeedCard } from "@/app/_components/ViewFeedCard"
import { ViewMuteListCard } from "@/app/_components/ViewMuteListCard"
import { ViewNotFoundCard } from "@/app/_components/ViewNotFoundCard"
import { useUserPreferencesAtom } from "@/app/_atoms/preferences"
import {
    menuIndexAtom,
    useCurrentMenuType,
    useMenuIndexChangedByMenu,
} from "@/app/_atoms/headerMenu"
import { processPostBodyText } from "@/app/_lib/post/processPostBodyText"
import { LABEL_ACTIONS } from "@/app/_constants/labels"
import { useAtom } from "jotai"

import { Swiper, SwiperSlide } from "swiper/react"
import SwiperCore from "swiper/core"
import { Pagination } from "swiper/modules"

import "swiper/css"
import "swiper/css/pagination"
import { DummyHeader } from "@/app/_components/DummyHeader"

const Page = () => {
    const [currentMenuType, setCurrentMenuType] = useCurrentMenuType()
    const [menuIndex, setMenuIndex] = useAtom(menuIndexAtom)
    const [menuIndexChangedByMenu, setMenuIndexChangedByMenu] =
        useMenuIndexChangedByMenu()

    const swiperRef = useRef<SwiperCore | null>(null)

    useLayoutEffect(() => {
        setCurrentMenuType("onlyPost")
    }, [])

    useEffect(() => {
        if (
            currentMenuType === "onlyPost" &&
            swiperRef.current &&
            menuIndex !== swiperRef.current.activeIndex
        ) {
            swiperRef.current.slideTo(menuIndex)
        }
    }, [currentMenuType, menuIndex, swiperRef.current])

    return (
        <>
            <Swiper
                onSwiper={(swiper) => {
                    swiperRef.current = swiper
                }}
                cssMode={isMobile}
                pagination={{ type: "custom", clickable: false }}
                modules={[Pagination]}
                className="swiper-only-post"
                style={{ height: "100%" }}
                touchAngle={30}
                touchRatio={0.8}
                touchReleaseOnEdges={true}
                touchMoveStopPropagation={true}
                preventInteractionOnTransition={true}
                onActiveIndexChange={(swiper) => {
                    if (!menuIndexChangedByMenu) {
                        setMenuIndex(swiper.activeIndex)
                    }
                }}
                onTouchStart={() => {
                    setMenuIndexChangedByMenu(false)
                }}
            >
                <SwiperSlide>
                    <PostPage tab={"authors"} />
                </SwiperSlide>
                <SwiperSlide>
                    <PostPage tab={"others"} />
                </SwiperSlide>
            </Swiper>
        </>
    )
}

export default Page

interface PostPageProps {
    tab: "authors" | "others"
}

const PostPage = (props: PostPageProps) => {
    const { tab } = props
    const router = useRouter()
    const [agent] = useAgent()
    const [userPreference] = useUserPreferencesAtom()
    const [isDeleted, setIsDeleted] = useState<boolean>(false)
    const { t } = useTranslation()
    const [, setImageGallery] = useImageGalleryAtom()
    const [translateTo] = useTranslationLanguage()
    const [nextQueryParams] = useNextQueryParamsAtom()
    const [loading, setLoading] = useState(false)
    const pathname = usePathname()
    const atUri1 = pathname.replace("/profile/", "at://")
    let atUri = atUri1.replace("/post/", "/app.bsky.feed.post/")
    const [thread, setThread] = useState<AppBskyFeedDefs.ThreadViewPost | null>(
        null
    )
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
    const [contentWarning, setContentWarning] = useState<boolean>(false)
    const [warningReason, setWarningReason] = useState<string>("")
    const [modalType, setModalType] = useState<"Reply" | "Quote" | null>(null)
    const [notfoundPost, setNotfoundPost] = useState<boolean | null>(null)
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

    const postView = useMemo((): PostView | null => {
        if (thread?.post) {
            return thread.post as PostView
        } else {
            return null
        }
    }, [thread])

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
            if (data.thread?.blocked) {
                setNotfoundPost(true)
                return
            }
            // @ts-ignore - it's hard to handle unknown types
            setThread(data.thread)
            setIsLiked(!!(data.thread.post as PostView).viewer?.like)
            setIsReposted(!!(data.thread.post as PostView).viewer?.repost)
            setIsMuted(!!(data.thread.post as PostView).author.viewer?.muted)
        } catch (e: unknown) {
            //@ts-ignore
            if (e.message.startsWith("Post not found")) {
                setNotfoundPost(true)
            }
        }
    }

    useEffect(() => {
        if (!agent) return
        void fetchPost()
    }, [agent, atUri])

    const handleImageClick = useCallback(
        (index: number) => {
            if (
                postView?.embed?.images &&
                Array.isArray(postView?.embed.images)
            ) {
                const images: ImageObject[] = []

                for (const image of postView?.embed.images) {
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
        [postView]
    )

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
                        bodyText={processPostBodyText(
                            nextQueryParams,
                            post.parent.post
                        )}
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
        if (loading) {
            return
        }

        if (!postView?.viewer) {
            return
        }

        setLoading(true)

        if (isReposted) {
            setIsReposted(!isReposted)
            agent?.deleteRepost(postView?.viewer?.repost as string)
        } else {
            setIsReposted(!isReposted)
            agent?.repost(postView?.uri, postView?.cid)
        }

        setLoading(false)
    }

    const handleLike = async () => {
        if (loading) {
            return
        }

        if (!postView?.viewer) {
            return
        }

        setLoading(true)

        if (isLiked) {
            setIsLiked(!isLiked)
            await agent?.deleteLike(postView?.viewer?.like as string)
        } else {
            setIsLiked(!isLiked)
            await agent?.like(postView?.uri, postView?.cid)
        }

        setLoading(false)
    }
    const handleBookmark = async () => {
        if (postView === null) {
            return
        }

        const createdAt = new Date().getTime()
        const json: Bookmark = {
            uri: postView.uri,
            category: null,
            createdAt: createdAt,
            updatedAt: createdAt,
            deletedAt: null,
        }

        const index = bookmarks.findIndex(
            (bookmark: any) => bookmark.uri === postView.uri
        )
        console.log(index)

        if (index !== -1) {
            console.log("delete")
            const newBookmarks = bookmarks
            newBookmarks.splice(index, 1)
            setBookmarks(newBookmarks)
            setIsBookmarked(false)
        } else {
            console.log("add")
            setBookmarks((prevBookmarks) => [...prevBookmarks, json])
            setIsBookmarked(true)
        }
    }

    const handleDelete = async () => {
        if (loading) return
        if (!agent) return
        if (!thread?.post) return
        try {
            setLoading(true)
            await agent.deletePost(thread?.post?.uri)
        } catch (e) {
            console.log(e)
        } finally {
            setLoading(false)
        }
    }

    const handleMute = async () => {
        if (loading) {
            return
        }

        if (postView === null) {
            return
        }

        setLoading(true)

        if (isMuted) {
            setIsMuted(!isMuted)
            await agent?.unmute(postView.author.did)
        } else {
            setIsMuted(!isMuted)
            await agent?.mute(postView.author.did)
        }

        setLoading(false)
    }

    const embedImages = useMemo((): AppBskyEmbedImages.View | null => {
        const embed = postView?.embed || null

        if (!embed?.$type) {
            return null
        }

        if (embed.$type === "app.bsky.embed.images#view") {
            return embed as AppBskyEmbedImages.View
        } else {
            return null
        }
    }, [thread])

    const embedMedia = useMemo((): AppBskyEmbedRecordWithMedia.View | null => {
        const embed = postView?.embed || null

        if (!embed?.$type) {
            return null
        }

        if (embed.$type === "app.bsky.embed.recordWithMedia#view") {
            return embed as AppBskyEmbedRecordWithMedia.View
        } else {
            return null
        }
    }, [thread])

    const embedExternal = useMemo((): AppBskyEmbedExternal.View | null => {
        const embed = postView?.embed || null

        if (!embed?.$type) {
            return null
        }

        if (embed.$type === "app.bsky.embed.external#view") {
            return embed as AppBskyEmbedExternal.View
        } else {
            return null
        }
    }, [thread])

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
    }, [thread])

    const embedRecordBlocked = useMemo((): AppBskyEmbedRecord.View | null => {
        if (!postView?.embed?.$type) {
            return null
        }

        const embedType = postView.embed.$type

        if (
            embedType === "app.bsky.embed.record#view" &&
            (postView?.embed?.record as AppBskyEmbedRecord.View)?.$type ===
                "app.bsky.embed.record#viewBlocked"
        ) {
            return postView.embed as AppBskyEmbedRecord.View
        } else {
            return null
        }
    }, [thread])

    const embedRecordViewRecord = useMemo((): ViewRecord | null => {
        const embed = postView?.embed || null

        if (!embed?.$type) {
            return null
        }

        if (embed.$type === "app.bsky.embed.record#view") {
            return embed.record as ViewRecord
        } else {
            return null
        }
    }, [thread])

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
    }, [thread])

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
    }, [thread])

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
    }, [thread])

    const translateContentText = async () => {
        if ((postView?.record as AppBskyFeedPost.Record)?.text === undefined) {
            return
        }

        setIsTranslated(true)
        setViewTranslatedText(true)
        const res = await fetch(
            `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${
                translateTo[0] ? translateTo[0] : `auto`
            }&dt=t&q=` +
                encodeURIComponent(
                    (postView?.record as AppBskyFeedPost.Record)?.text
                )
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
        if (!postView?.uri) {
            return
        }
        const isBookmarked = bookmarks.some(
            (bookmark) => bookmark.uri === postView.uri
        )
        setIsBookmarked(isBookmarked)
    }, [thread])

    useEffect(() => {
        if (!userPreference) return
        const post = postView
        if (!post || !post.labels || post.labels.length === 0) return

        post.labels.forEach((label) => {
            const labelType = LABEL_ACTIONS[label.val]
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
    }, [userPreference, postView])

    return thread && !notfoundPost ? (
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
                            postData={postView}
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
                post={postView}
                nextQueryParams={nextQueryParams}
            />
            <Modal
                isOpen={isOpenOption}
                onOpenChange={onOpenChangeOption}
                placement={"bottom"}
                className={"z-[100] max-w-[600px] text-black dark:text-white"}
                hideCloseButton
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalBody>
                                <span>
                                    <div
                                        className={"mt-[15px] mb-[15px] w-full"}
                                        onClick={async () => {
                                            if (!window.navigator.share) {
                                                alert(
                                                    t(
                                                        "alert.cannotShareInBrowser"
                                                    )
                                                )
                                                return
                                            }
                                            try {
                                                const url = new AtUri(atUri)
                                                const bskyURL = `https://bsky.app/profile/${url.hostname}/${url.rkey}`

                                                console.log(url)
                                                await window.navigator.share({
                                                    url: bskyURL,
                                                })
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
                                        className={"mt-[15px] mb-[15px] w-full"}
                                        onClick={async () => {
                                            await translateContentText()
                                            onClose()
                                        }}
                                    >
                                        <FontAwesomeIcon
                                            icon={faLanguage}
                                            className={"w-[40px]"}
                                        />
                                        {t("pages.postOnlyPage.translate")}
                                    </div>
                                    {thread?.post?.author?.did !==
                                        agent?.session?.did && (
                                        <div
                                            className={
                                                "mt-[15px] mb-[15px] w-full text-red-600"
                                            }
                                            onClick={() => {
                                                let confirm
                                                if (isMuted) {
                                                    confirm = window?.confirm(
                                                        t(
                                                            "components.ViewPostCard.unMuteThisUser?"
                                                        )
                                                    )
                                                } else {
                                                    confirm = window?.confirm(
                                                        t(
                                                            "components.ViewPostCard.muteThisUser?"
                                                        )
                                                    )
                                                }
                                                if (!confirm) return
                                                void handleMute()
                                            }}
                                        >
                                            <FontAwesomeIcon
                                                icon={faVolumeXmark}
                                                className={"w-[40px]"}
                                            />
                                            {!isMuted ? (
                                                <span>
                                                    {" "}
                                                    {t(
                                                        "components.ViewPostCard.mute"
                                                    )}
                                                </span>
                                            ) : (
                                                <span>
                                                    {" "}
                                                    {t(
                                                        "components.ViewPostCard.unmute"
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    {thread?.post?.author?.did ===
                                    agent?.session?.did ? (
                                        <div
                                            className={
                                                "mt-[15px] mb-[15px] w-full text-red-600"
                                            }
                                            onClick={() => {
                                                const confirm = window?.confirm(
                                                    t(
                                                        "components.ViewPostCard.deletePost?"
                                                    )
                                                )
                                                if (!confirm) return
                                                void handleDelete()
                                                onClose()
                                                router.back()
                                            }}
                                        >
                                            <FontAwesomeIcon
                                                icon={faTrash}
                                                className={"w-[40px]"}
                                            />
                                            {t(
                                                "components.ViewPostCard.delete"
                                            )}
                                        </div>
                                    ) : (
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
                                            {t(
                                                "components.ViewPostCard.report"
                                            )}
                                        </div>
                                    )}
                                </span>
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
            <DummyHeader />
            <main className={`${Container()}`}>
                {thread?.parent && (
                    <>{renderNestedViewPostCards(thread, isMobile)}</>
                )}
                <div className={AuthorPost()}>
                    <div className={Author()}>
                        <div className={"flex items-center"}>
                            <Link
                                className={AuthorIcon()}
                                href={`/profile/${postView?.author
                                    .did}?${nextQueryParams.toString()}`}
                            >
                                <img
                                    src={
                                        postView?.author?.avatar ||
                                        defaultIcon.src
                                    }
                                    alt={"avatar"}
                                />
                            </Link>
                            <div>
                                <div>
                                    <Link
                                        className={AuthorDisplayName()}
                                        href={`/profile/${postView?.author
                                            .did}?${nextQueryParams.toString()}`}
                                    >
                                        {postView?.author?.displayName}
                                    </Link>
                                </div>
                                <div>
                                    <Link
                                        className={AuthorHandle()}
                                        href={`/profile/${postView?.author
                                            .did}?${nextQueryParams.toString()}`}
                                    >
                                        {postView?.author?.handle}
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div
                            className={
                                "md:h-[20px] h-[10px] hover:cursor-pointer items-center hidden md:block"
                            }
                        >
                            <Dropdown
                                className={`${dropdown()} text-black dark:text-white`}
                            >
                                <DropdownTrigger>
                                    <FontAwesomeIcon
                                        icon={faEllipsis}
                                        className={"h-[20px] text-[#AAAAAA] "}
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
                                                    icon={faArrowUpFromBracket}
                                                />
                                            }
                                        >
                                            {t("pages.postOnlyPage.share")}
                                        </DropdownItem>
                                        <DropdownItem
                                            key="translate"
                                            startContent={
                                                <FontAwesomeIcon
                                                    icon={faLanguage}
                                                />
                                            }
                                            onClick={async () => {
                                                await translateContentText()
                                            }}
                                        >
                                            {t("pages.postOnlyPage.translate")}
                                        </DropdownItem>
                                    </DropdownSection>
                                    <DropdownSection
                                        title="Copy"
                                        showDivider={isPostMine}
                                    >
                                        <DropdownItem
                                            key="url"
                                            startContent={
                                                <FontAwesomeIcon
                                                    icon={faChain}
                                                />
                                            }
                                            onClick={() => {
                                                const url = new AtUri(atUri)
                                                void navigator.clipboard.writeText(
                                                    `https://bsky.app/profile/${url.hostname}/post/${url.rkey}`
                                                )
                                            }}
                                        >
                                            {t("pages.postOnlyPage.copyURL")}
                                        </DropdownItem>
                                        <DropdownItem
                                            key="aturi"
                                            startContent={
                                                <FontAwesomeIcon icon={faAt} />
                                            }
                                            onClick={() => {
                                                void navigator.clipboard.writeText(
                                                    atUri
                                                )
                                            }}
                                        >
                                            {t("pages.postOnlyPage.copyATURI")}
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
                                                    postView?.author.did || ""
                                                )
                                            }}
                                        >
                                            {t("pages.postOnlyPage.copyDID")}
                                        </DropdownItem>
                                        <DropdownItem
                                            key="json"
                                            startContent={
                                                <FontAwesomeIcon
                                                    icon={faCode}
                                                />
                                            }
                                            onClick={() => {
                                                void navigator.clipboard.writeText(
                                                    JSON.stringify(thread)
                                                )
                                            }}
                                        >
                                            {t("pages.postOnlyPage.copyJSON")}
                                        </DropdownItem>
                                    </DropdownSection>
                                    <DropdownSection title="Danger zone">
                                        {agent?.session?.did !==
                                        postView?.author.did ? (
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
                        <div
                            className={
                                "md:h-[20px] h-[10px] hover:cursor-pointer items-center block md:hidden"
                            }
                        >
                            <FontAwesomeIcon
                                icon={faEllipsis}
                                className={"h-[20px] flex text-[#AAAAAA]"}
                                size={"xs"}
                                onClick={onOpenOption}
                            />
                        </div>
                    </div>
                    <div className={PostContent()}>
                        {processPostBodyText(nextQueryParams, postView)}
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
                                        {t("pages.postOnlyPage.viewOriginal")}
                                    </span>
                                </div>
                                <div>{translatedText}</div>
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
                        {contentWarning && !isDeleted && (
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
                        {embedMedia && !contentWarning && (
                            <EmbedMedia
                                embedMedia={embedMedia}
                                onImageClick={(index: number) => {
                                    handleImageClick(index)
                                }}
                                nextQueryParams={nextQueryParams}
                            />
                        )}
                        {embedExternal && !contentWarning && (
                            <div className={"h-full w-full mt-[5px]"}>
                                <Linkcard ogpData={embedExternal.external} />
                            </div>
                        )}
                        {embedRecord &&
                            embedRecordViewRecord &&
                            !embedFeed &&
                            !embedMuteList &&
                            !notfoundEmbedRecord &&
                            !embedRecordBlocked &&
                            !contentWarning && (
                                <ViewPostCard
                                    bodyText={processPostBodyText(
                                        nextQueryParams,
                                        null,
                                        embedRecordViewRecord
                                    )}
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
                        {(notfoundEmbedRecord || embedRecordBlocked) && (
                            <ViewNotFoundCard />
                        )}
                    </div>
                    <div className={PostCreatedAt()}>
                        {formatDate(postView!.indexedAt)}
                    </div>
                    <div className={ReactionButtonContainer()}>
                        <div className={ReactionButton()}>
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
                        <div className={ReactionButton()}>
                            <FontAwesomeIcon
                                icon={faComment}
                                className={ReactionButton({
                                    isReplyDisabled:
                                        postView?.viewer?.replyDisabled,
                                })}
                                onClick={() => {
                                    if (postView?.viewer?.replyDisabled) return
                                    void handleReply()
                                }}
                            />
                        </div>
                        <div
                            className={`${ReactionButton()} ${
                                agent?.session?.did !== postView?.author.did &&
                                `hidden`
                            }`}
                        >
                            <FontAwesomeIcon
                                icon={faQuoteLeft}
                                className={ReactionButton()}
                                onClick={() => {
                                    void handleQuote()
                                }}
                            />
                        </div>
                        <div className={ReactionButton()}>
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
                        </div>
                        <div className={ReactionButton()}>
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
                        </div>
                    </div>
                </div>
                <div className={"h-full"}>
                    {thread?.replies &&
                        (
                            thread.replies as Array<AppBskyFeedDefs.ThreadViewPost>
                        ).map((item: any, index: number) => {
                            console.log(thread)
                            console.log(item)
                            if (tab === "authors") {
                                if (
                                    thread.post.author.did !==
                                        item.post.author.did &&
                                    item.post.author.did !==
                                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                        //@ts-ignore
                                        thread?.parent?.post?.author?.did
                                ) {
                                    return null
                                }
                            }
                            return (
                                <ViewPostCard
                                    key={index}
                                    bodyText={processPostBodyText(
                                        nextQueryParams,
                                        item.post as PostView
                                    )}
                                    postJson={item.post as PostView}
                                    //isMobile={isMobile}
                                    nextQueryParams={nextQueryParams}
                                    t={t}
                                />
                            )
                        })}
                </div>
            </main>
        </>
    ) : notfoundPost ? (
        notFound()
    ) : (
        <div className={"w-full h-full"}>
            <div className={"flex items-center justify-center h-full w-full"}>
                <Spinner />
            </div>
        </div>
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
                    } bg-cover hover:cursor-pointer`}
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
