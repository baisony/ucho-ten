import {
    memo,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react"
import { useRouter } from "next/navigation"
import {
    FeedViewPost,
    GeneratorView,
    PostView,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs"
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
    faReply,
    faRetweet,
    faStar as faHeartSolid,
    faEllipsis,
} from "@fortawesome/free-solid-svg-icons"
import defaultIcon from "@/../public/images/icon/default_icon.svg"
import { viewPostCard } from "./styles"
import { viewQuoteCard } from "../ViewQuoteCard/styles"
import { Linkcard } from "@/app/_components/Linkcard"
import { Button, useDisclosure } from "@nextui-org/react"
import { useAgent } from "@/app/_atoms/agent"
import { formattedSimpleDate } from "@/app/_lib/strings/datetime"
import {
    ImageGalleryObject,
    ImageObject,
    useImageGalleryAtom,
} from "@/app/_atoms/imageGallery"

import { ViewFeedCard } from "@/app/_components/ViewFeedCard"
import { ViewMuteListCard } from "@/app/_components/ViewMuteListCard"
import { useUserPreferencesAtom } from "@/app/_atoms/preferences"
import { Bookmark, useBookmarks } from "@/app/_atoms/bookmarks"
import Link from "next/link"
import dynamic from "next/dynamic"
import { ViewNotFoundCard } from "@/app/_components/ViewNotFoundCard"
import { EmbedMedia } from "./EmbedMedia"
import { EmbedImages } from "./EmbedImages"
import { LABEL_ACTIONS } from "@/app/_constants/labels"
import { processPostBodyText } from "@/app/_lib/post/processPostBodyText"
import { useContentFontSize } from "@/app/_atoms/contentFontSize"
import { useWordMutes } from "@/app/_atoms/wordMute"
import { useTranslationLanguage } from "@/app/_atoms/translationLanguage"
import { translateText } from "@/app/_lib/post/translate"
import { syncContents } from "@/app/_lib/sync/syncBookmark"
//import { PostModal } from "../PostModal"
//import { ReportModal } from "@/app/_components/ReportModal"
//import MoreDropDownMenu from "./MoreDropDownMenu"

const MoreDropDownMenu = dynamic(
    () =>
        import("@/app/_components/ViewPostCard/MoreDropDownMenu").then(
            (mod) => mod.default
        ),
    { ssr: true }
)

const ReplyModal = dynamic(
    () => import("@/app/_components/ReplyModal").then((mod) => mod.ReplyModal),
    { ssr: true }
)

const ReportModal = dynamic(
    () =>
        import("@/app/_components/ReportModal").then((mod) => mod.ReportModal),
    { ssr: true }
)
const MobileOptionModal = dynamic(
    () =>
        import("@/app/_components/MobileOptionModal").then(
            (mod) => mod.MobileOptionModal
        ),
    { ssr: true }
)

export interface ViewPostCardProps {
    isSkeleton?: boolean
    isMobile?: boolean
    isDragActive?: boolean
    postJson?: PostView
    quoteJson?: ViewRecord
    json?: FeedViewPost
    bodyText: React.ReactNode
    isEmbedToModal?: boolean
    now?: Date
    isEmbedToPost?: boolean
    nextQueryParams: URLSearchParams
    t: any
    handleValueChange?: (value: any) => void
    handleSaveScrollPosition?: () => void
    isViaUFeed?: boolean
    isDisplayMode?: boolean
    zenMode: boolean | undefined
}

export const ViewPostCard = memo((props: ViewPostCardProps) => {
    const {
        isMobile,
        postJson,
        quoteJson,
        json,
        bodyText,
        isEmbedToModal,
        now,
        isEmbedToPost,
        nextQueryParams,
        t,
        handleValueChange,
        handleSaveScrollPosition,
        isViaUFeed,
        zenMode,
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
    const [muteWords] = useWordMutes()
    const [, setImageGallery] = useImageGalleryAtom()
    const router = useRouter()
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
        postCreatedAt,
        moreButton,
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
    const [userPreference] = useUserPreferencesAtom()
    const [translateTo] = useTranslationLanguage()
    const [contentWarning, setContentWarning] = useState<boolean>(false)
    const warningReason = useRef<string>("")
    const [bookmarks, setBookmarks] = useBookmarks()
    const [isBookmarked, setIsBookmarked] = useState<boolean>(false)
    const [contentFontSize] = useContentFontSize()
    const isTranslated = useRef<boolean>(false)
    const [viewTranslatedText, setViewTranslatedText] = useState<boolean>(false)
    const [translateError, setTranslateError] = useState<boolean>(false)
    const [translatedJsonData, setTranslatedJsonData] = useState<any>(null)
    const [isMuted, setIsMuted] = useState<boolean>(!!postJson?.viewer?.muted)
    const createDisclosure = () => {
        const disclosure = useDisclosure()
        return {
            isOpen: disclosure.isOpen,
            onOpen: disclosure.onOpen,
            onOpenChange: disclosure.onOpenChange,
        }
    }

    const {
        isOpen: isOpenOption,
        onOpen: onOpenOption,
        onOpenChange: onOpenChangeOption,
    } = createDisclosure()

    const {
        isOpen: isOpenReply,
        onOpen: onOpenReply,
        onOpenChange: onOpenChangeReply,
    } = createDisclosure()

    const {
        isOpen: isOpenReport,
        onOpen: onOpenReport,
        onOpenChange: onOpenChangeReport,
    } = createDisclosure()

    const syncBookmarks = async (bookmarklist: Bookmark[]) => {
        if (!agent) return
        await syncContents(bookmarklist, muteWords)
    }

    const handleBookmark = async (uri: string) => {
        const createdAt = new Date().getTime()
        const json: Bookmark = {
            uri: uri,
            category: null,
            createdAt: createdAt,
            updatedAt: createdAt,
            deletedAt: null,
        }

        const index = bookmarks.findIndex(
            (bookmark: Bookmark) => bookmark.uri === uri
        )
        console.log(index)

        if (index !== -1) {
            //console.log("delete")
            const newBookmarks = bookmarks
            newBookmarks.splice(index, 1)
            //console.log(newBookmarks)

            setBookmarks(newBookmarks)
            void syncBookmarks(newBookmarks)
            setIsBookmarked(false)
            //await syncBookmarks()
        } else {
            console.log("add")
            setBookmarks((prevBookmarks) => [...prevBookmarks, json])
            void syncBookmarks([...bookmarks, json])
            setIsBookmarked(true)
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
            handleInputChange(
                "unrepost",
                postView.uri,
                postView.viewer.repost || ""
            )
        } else if (postJsonData?.uri && postJsonData?.cid) {
            setIsReposted(!isReposted)
            const res = await agent?.repost(postJsonData.uri, postJsonData.cid)
            console.log(res)
            handleInputChange("repost", postJsonData?.uri || "", res?.uri || "")
        }
        setLoading(false)
    }

    const handleLike = async () => {
        if (loading) return

        setLoading(true)

        if (isLiked && postView?.viewer?.like) {
            setIsLiked(!isLiked)
            const res = await agent?.deleteLike(postView.viewer.like)
            console.log(res)
            handleInputChange(
                "unlike",
                postView.uri,
                postView.viewer.like || ""
            )
        } else if (postJsonData?.uri && postJsonData?.cid) {
            setIsLiked(!isLiked)
            const res = await agent?.like(postJsonData.uri, postJsonData.cid)
            console.log(res)
            handleInputChange("like", postJsonData.uri || "", res?.uri || "")
        }

        setLoading(false)
    }

    const useEmbed = useMemo(() => {
        const extractEmbedOfType = (type: any) => {
            const quoteEmbed =
                quoteJson?.embeds?.length && quoteJson?.embeds?.length > 0
                    ? quoteJson?.embeds[0]
                    : null
            const embed = quoteEmbed || postView?.embed || null

            if (!embed?.$type) return null

            if ((embed?.record as PostView)?.$type === type) return embed as any

            return embed.$type === type ? (embed as any) : null
        }

        return {
            embedImages: extractEmbedOfType("app.bsky.embed.images#view"),
            embedMedia: extractEmbedOfType(
                "app.bsky.embed.recordWithMedia#view"
            ),
            embedExternal: extractEmbedOfType("app.bsky.embed.external#view"),
            embedRecord: extractEmbedOfType("app.bsky.embed.record#view"),
            embedRecordBlocked: extractEmbedOfType(
                "app.bsky.embed.record#viewBlocked"
            ),
            embedRecordViewRecord: extractEmbedOfType(
                "app.bsky.embed.record#view"
            )?.record as ViewRecord,
            embedFeed: extractEmbedOfType("app.bsky.feed.defs#generatorView")
                ?.record as GeneratorView,
            embedMuteList: extractEmbedOfType("app.bsky.graph.defs#listView")
                ?.record as ListView,
            notfoundEmbedRecord: extractEmbedOfType(
                "app.bsky.embed.record#viewNotFound"
            ),
        }
    }, [postJson, quoteJson])

    // Usage
    const {
        embedImages,
        embedMedia,
        embedExternal,
        embedRecord,
        embedRecordBlocked,
        embedRecordViewRecord,
        embedFeed,
        embedMuteList,
        notfoundEmbedRecord,
    } = useEmbed

    const handleDelete = async () => {
        if (loading || !agent || !postJson) return
        try {
            setLoading(true)
            await agent.deletePost(postJson?.uri)
            handleInputChange("delete", postJson.uri, "")
        } catch (e) {
            console.log(e)
        } finally {
            setLoading(false)
        }
    }

    const handleMute = async () => {
        if (loading || !postView) return

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

    const handleImageClick = useCallback(
        (images: ViewImage[], index: number) => {
            if (images !== undefined) {
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

    useEffect(() => {
        if (!userPreference) {
            return
        }

        const post = postJson || quoteJson

        if (!post || !post.labels || post.labels.length === 0) {
            return
        }

        post.labels.forEach((label) => {
            const labelType = LABEL_ACTIONS[label.val]
            if (labelType) {
                const { label: warningLabel, key } = labelType
                switch (key) {
                    case "nsfw":
                    case "suggestive":
                    case "nudity":
                        if (!userPreference.adultContentEnabled) {
                            handleInputChange("delete", postJson?.uri || "", "")
                        }
                    case "hate":
                    case "spam":
                    case "impersonation":
                    case "gore":
                        const action =
                            userPreference.contentLabels?.[
                                key === "suggestive" || key === "nudity"
                                    ? "nsfw"
                                    : key
                            ]
                        if (action === "warn") {
                            setContentWarning(true)
                            warningReason.current = warningLabel
                        } else if (action === "hide") {
                            handleInputChange("delete", postJson?.uri || "", "")
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

    useLayoutEffect(() => {
        const shouldDeletePost = (viewer: any) =>
            viewer?.blockedBy || viewer?.muted || viewer?.blocking

        if (
            (embedRecord &&
                embedRecordViewRecord?.author?.viewer &&
                shouldDeletePost(embedRecordViewRecord.author.viewer)) ||
            (embedMedia &&
                embedMedia.record.record.author?.viewer &&
                shouldDeletePost(
                    embedMedia.record.record?.author.viewer as ProfileViewBasic
                ))
        ) {
            handleInputChange("delete", postJsonData?.uri || "", "")
        }
    }, [])

    useEffect(() => {
        const postUri = postJson?.uri || quoteJson?.uri || json?.post?.uri
        if (!postUri) return
        //console.log(bookmarks[0][agent?.session?.did as string])
        const isBookmarked = bookmarks.some(
            (bookmark) => bookmark.uri === postUri
        )
        setIsBookmarked(isBookmarked)
    }, [postJson, quoteJson, json, bookmarks])

    const handleCopy = (object: string) => {
        void navigator.clipboard.writeText(object)
    }

    const handleMenuClickCopyURL = () => {
        if (!postJsonData) return
        const urlToCopy = `https://bsky.app/profile/${
            postJsonData.author.did
        }/post/${postJsonData.uri.match(/\/(\w+)$/)?.[1] || ""}`

        handleCopy(urlToCopy)
    }

    const handleMenuClickCopyATURI = () => {
        if (!postJsonData) return
        handleCopy(postJsonData.uri)
    }

    const handleMenuClickCopyDID = () => {
        if (!postJsonData) return
        handleCopy(postJsonData.author.did)
    }

    const handleMenuClickCopyJSON = () => {
        handleCopy(JSON.stringify(postJson))
    }

    const handleMenuClickReport = () => {
        onOpenReport()
    }

    const handleMenuClickDelete = () => {
        void handleDelete()
    }

    const handleInputChange = (
        reaction: string,
        postUri: string,
        reactionUri: string
    ) => {
        if (!handleValueChange) return

        //const value = event.target.value
        const json = {
            reaction: reaction,
            postUri: postUri,
            reactionUri: reactionUri,
        }
        console.log(json)
        handleValueChange(json)
    }

    const handleChangeSaveScrollPosition = () => {
        if (!handleSaveScrollPosition) return
        handleSaveScrollPosition()
    }

    const translateContentText = async () => {
        isTranslated.current = true
        setViewTranslatedText(true)
        const res = await translateText(translateTo, postJson, postView)
        setTranslatedJsonData(res)
    }

    const longPressTimerRef = useRef<number | null>(null)

    const handleLongPress = () => {
        console.log(props)
        onOpenOption()
    }

    const handleTouchStart = useCallback(() => {
        longPressTimerRef.current = window.setTimeout(() => {
            handleLongPress()
        }, 500)

        const clearTimer = () => {
            if (longPressTimerRef.current !== null) {
                clearTimeout(longPressTimerRef.current)
                longPressTimerRef.current = null
            }
        }

        document.addEventListener("touchend", clearTimer)
        document.addEventListener("touchmove", clearTimer)
        document.addEventListener("touchcancel", clearTimer)
        document.addEventListener("contextmenu", clearTimer)

        return () => {
            // Clean up event listeners when the component unmounts
            document.removeEventListener("touchend", clearTimer)
            document.removeEventListener("touchmove", clearTimer)
            document.removeEventListener("touchcancel", clearTimer)
            document.removeEventListener("contextmenu", clearTimer)
        }
    }, [onOpenOption])

    useEffect(() => {
        return () => {
            // Clean up the timer when the component unmounts
            if (longPressTimerRef.current !== null) {
                clearTimeout(longPressTimerRef.current)
                longPressTimerRef.current = null
            }
        }
    }, [])

    return (
        <div className={quoteJson ? quoteCardStyles.PostCardContainer() : ""}>
            <ReplyModal
                isOpen={isOpenReply}
                onOpenChange={onOpenChangeReply}
                post={postJson}
            />
            <ReportModal
                isOpen={isOpenReport}
                onOpenChange={onOpenChangeReport}
                placement={isMobile ? "top" : "center"}
                className={`z-[100] max-w-[600px] ${
                    isMobile && `mt-[env(safe-area-inset-top)]`
                }`}
                target={"post"}
                post={postJson}
                nextQueryParams={nextQueryParams}
            />
            <MobileOptionModal
                isOpen={isOpenOption}
                onOpenChange={onOpenChangeOption}
                placement={"bottom"}
                className={"z-[100] max-w-[600px] text-black dark:text-white"}
                postView={postView}
                postJson={postJson}
                handleMute={handleMute}
                handleDelete={handleDelete}
                isMuted={isMuted}
                onOpenReport={onOpenReport}
                translateContentText={translateContentText}
            />
            <main
                className={`${
                    quoteJson
                        ? quoteCardStyles.PostCard()
                        : PostCard({ isEmbedToModal })
                } ${
                    isEmbedToModal ? `border-none` : `cursor-pointer group`
                } overflow-hidden`}
                style={{
                    backgroundColor: isEmbedToModal ? "transparent" : "",
                }}
                onClick={(e) => {
                    e.stopPropagation()
                    handleChangeSaveScrollPosition()
                    console.log("hogehoge")
                    router.push(
                        `/profile/${postJsonData?.author.did}/post/${
                            postJsonData?.uri.match(/\/(\w+)$/)?.[1] || ""
                        }?${nextQueryParams.toString()}`
                    )
                }}
                onTouchStart={(e) => {
                    e.stopPropagation()
                    handleTouchStart()
                }}
            >
                <div className={`${PostCardContainer({ isEmbedToModal })}`}>
                    {json?.reason && (
                        <Link
                            className={`text-[13px] ${zenMode ? `ml-[11px]` : `ml-[40px]`} text-[#595959] text-bold hover:cursor-pointer md:hover:underline`}
                            onClick={(e) => {
                                e.stopPropagation()
                                handleChangeSaveScrollPosition()
                            }}
                            href={`/profile/${
                                (json?.reason?.by as ProfileViewBasic)?.did
                            }?${nextQueryParams.toString()}`}
                        >
                            <FontAwesomeIcon icon={faRetweet} /> Reposted by{" "}
                            {(json.reason.by as ProfileViewBasic).displayName ||
                                ""}
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
                                    zenMode,
                                })}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleChangeSaveScrollPosition()
                                }}
                                href={`/profile/${
                                    postJsonData?.author?.did
                                }?${nextQueryParams.toString()}`}
                            >
                                <img
                                    src={
                                        postJsonData?.author?.avatar ||
                                        defaultIcon.src
                                    }
                                    alt={postJsonData?.author?.did || ""}
                                    className={`${
                                        !isEmbedToPost
                                            ? `w-[30px] h-[30px]`
                                            : `w-[18px] h-[18px]`
                                    }`}
                                    decoding={"async"}
                                    loading={"eager"}
                                    fetchPriority={"high"}
                                />
                            </Link>
                            <Link
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleChangeSaveScrollPosition()
                                }}
                                href={`/profile/${
                                    postJsonData?.author?.did
                                }?${nextQueryParams.toString()}`}
                                className={"items-start"}
                            >
                                <span
                                    className={`${PostAuthorDisplayName()} md:hover:underline ${
                                        `text-[` +
                                        Number(contentFontSize + 11) +
                                        `px]`
                                    }`}
                                >
                                    {postJsonData?.author?.displayName ||
                                        postJsonData?.author?.handle}
                                </span>
                            </Link>
                            {postJsonData?.author?.displayName && (
                                <>
                                    <Link
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleChangeSaveScrollPosition()
                                        }}
                                        href={`/profile/${
                                            postJsonData?.author?.did
                                        }?${nextQueryParams.toString()}`}
                                    >
                                        <span
                                            className={`${PostAuthorHandle()} md:hover:underline ml-[5px]`}
                                        >
                                            @{postJsonData?.author?.handle}
                                        </span>
                                    </Link>
                                </>
                            )}
                        </span>

                        <div
                            className={`${postCreatedAt()} group-hover:md:hidden md:flex`}
                        >
                            {postJsonData &&
                                formattedSimpleDate(
                                    postJsonData.indexedAt,
                                    now || new Date()
                                )}
                        </div>

                        <div
                            className={`${moreButton()} group-hover:md:flex md:hidden hidden`}
                        >
                            {!isEmbedToModal && postJsonData && postJson && (
                                <MoreDropDownMenu
                                    isThisUser={
                                        agent?.session?.did !==
                                        postJsonData?.author.did
                                    }
                                    onClickTranslate={translateContentText}
                                    onClickCopyURL={handleMenuClickCopyURL}
                                    onClickCopyATURI={handleMenuClickCopyATURI}
                                    onClickCopyDID={handleMenuClickCopyDID}
                                    onClickCopyJSON={handleMenuClickCopyJSON}
                                    onClickReport={handleMenuClickReport}
                                    onClickDelete={handleMenuClickDelete}
                                    t={t}
                                />
                            )}
                        </div>
                    </div>
                    <div className={PostContent({ isEmbedToPost, zenMode })}>
                        {json?.reply && (
                            <div
                                className={
                                    "text-[#BABABA] text-[12px] dark:text-[#787878]"
                                }
                            >
                                <FontAwesomeIcon icon={faReply} /> Reply to{" "}
                                {
                                    (
                                        json.reply.parent
                                            .author as ProfileViewBasic
                                    )?.displayName
                                }
                            </div>
                        )}
                        {bodyText !== undefined && (
                            <div
                                style={{ wordBreak: "break-word" }}
                                className={`h-full w-full ${
                                    isEmbedToPost
                                        ? `text-[13px]`
                                        : `text-[` +
                                          Number(contentFontSize + 11) +
                                          `px]`
                                }`}
                            >
                                {!viewTranslatedText && bodyText}
                                {translatedJsonData !== null &&
                                    viewTranslatedText && (
                                        <>
                                            {processPostBodyText(
                                                nextQueryParams,
                                                null,
                                                translatedJsonData
                                            )}
                                        </>
                                    )}
                                {viewTranslatedText && (
                                    <Button
                                        size={"sm"}
                                        variant={"flat"}
                                        radius={"full"}
                                        onClick={async (e) => {
                                            e.stopPropagation()
                                            if (!isTranslated.current) {
                                                await translateContentText()
                                            }
                                            if (viewTranslatedText) {
                                                setViewTranslatedText(false)
                                            } else {
                                                setViewTranslatedText(true)
                                            }
                                        }}
                                    >
                                        {!translateError
                                            ? !viewTranslatedText
                                                ? t(
                                                      "pages.postOnlyPage.translate"
                                                  )
                                                : t(
                                                      "pages.postOnlyPage.viewOriginal"
                                                  )
                                            : t(
                                                  "pages.postOnlyPage.translateErorr"
                                              )}
                                    </Button>
                                )}
                            </div>
                        )}
                        {embedImages && !contentWarning && (
                            <EmbedImages
                                embedImages={embedImages}
                                onImageClick={(images, index) => {
                                    handleImageClick(images, index)
                                }}
                                isEmbedToModal={isEmbedToModal}
                            />
                        )}
                        {contentWarning && (
                            <div
                                className={`h-[50px] w-full flex justify-between items-center border border-gray-600 rounded-[10px]`}
                            >
                                <div className={"ml-[20px]"}>
                                    {t("components.ViewPostCard.warning")}:{" "}
                                    {warningReason.current}
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
                                onImageClick={(images, index) => {
                                    handleImageClick(images, index)
                                }}
                                nextQueryParams={nextQueryParams}
                            />
                        )}
                        {embedExternal &&
                            !isEmbedToPost &&
                            !isEmbedToModal &&
                            !contentWarning && (
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
                                    zenMode={props.zenMode}
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
                    {!isEmbedToPost && (
                        <div className={PostReactionButtonContainer()}>
                            <div className={`flex`}>
                                <div
                                    className={`${bookmarkButton()} ${
                                        !isBookmarked && `md:hidden`
                                    } ${isEmbedToModal && `hidden`} ${
                                        !zenMode
                                            ? `group-hover:md:block md:hidden`
                                            : `hidden`
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
                                            void handleBookmark(postUri)
                                        }}
                                        className={"h-[14px] w-[12px]"}
                                    />
                                </div>
                            </div>
                            {!isEmbedToModal && (
                                <div
                                    className={`flex text-[#bfbfbf] dark:text-[#636363]`}
                                >
                                    {!isViaUFeed && (
                                        <div
                                            className={`${PostReactionButton()}  ${replyButton(
                                                {
                                                    replyDisabled:
                                                        postJson?.viewer
                                                            ?.replyDisabled,
                                                }
                                            )} ${
                                                !zenMode
                                                    ? `group-hover:md:block md:hidden`
                                                    : `hidden`
                                            }`}
                                        >
                                            <FontAwesomeIcon
                                                icon={faComment}
                                                onClick={async (e) => {
                                                    e.stopPropagation()
                                                    if (
                                                        postJson?.viewer
                                                            ?.replyDisabled
                                                    )
                                                        return
                                                    await handleReply()
                                                }}
                                                className={"h-full w-full"}
                                            />
                                        </div>
                                    )}
                                    {!isViaUFeed && (
                                        <div
                                            className={`${PostReactionButton()} ${repostButton(
                                                {
                                                    isReacted: isReposted,
                                                }
                                            )} ${
                                                !zenMode
                                                    ? `group-hover:md:block`
                                                    : `hidden`
                                            } ${!isReposted && `md:hidden`}`}
                                        >
                                            <FontAwesomeIcon
                                                icon={faRetweet}
                                                onClick={async (e) => {
                                                    e.stopPropagation()
                                                    await handleRepost()
                                                }}
                                                className={"h-full w-full"}
                                            />
                                        </div>
                                    )}
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
                                                await handleLike()
                                            }}
                                            className={"h-full w-full"}
                                        />
                                    </div>
                                    <div
                                        className={`${PostReactionButton()} lg:hidden h-[15px] w-[20px]`}
                                    >
                                        <FontAwesomeIcon
                                            icon={faEllipsis}
                                            onClick={async (e) => {
                                                e.stopPropagation()
                                                onOpenOption()
                                            }}
                                            className={"h-full w-full"}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
})

export default ViewPostCard
