import {
    memo,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react"
import { useRouter } from "next/navigation"
import {
    FeedViewPost,
    PostView,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { ViewRecord } from "@atproto/api/dist/client/types/app/bsky/embed/record"
import {
    ProfileViewBasic,
    ViewerState,
} from "@atproto/api/dist/client/types/app/bsky/actor/defs"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faBookmark as faBookmarkRegular,
    faComment,
    faStar as faHeartRegular,
} from "@fortawesome/free-regular-svg-icons"
import {
    faBookmark as faBookmarkSolid,
    faEllipsis,
    faReply,
    faRetweet,
    faStar as faHeartSolid,
} from "@fortawesome/free-solid-svg-icons"
import defaultIcon from "@/../public/images/icon/default_icon.svg"
import { viewPostCard } from "./styles"
import { viewQuoteCard } from "../ViewQuoteCard/styles"
import { Linkcard } from "@/app/_components/Linkcard"
import { Button, useDisclosure } from "@nextui-org/react"
import { useAgent } from "@/app/_atoms/agent"
import { formattedSimpleDate } from "@/app/_lib/strings/datetime"
import { useImageGalleryAtom } from "@/app/_atoms/imageGallery"

import { ViewFeedCard } from "@/app/_components/ViewFeedCard"
import { ViewMuteListCard } from "@/app/_components/ViewMuteListCard"
import { useUserPreferencesAtom } from "@/app/_atoms/preferences"
import { Bookmark, useBookmarks } from "@/app/_atoms/bookmarks"
import Link from "next/link"
import dynamic from "next/dynamic"
import { ViewNotFoundCard } from "@/app/_components/ViewNotFoundCard"
import { EmbedMedia } from "./EmbedMedia"
import { EmbedImages } from "./EmbedImages"
import { processPostBodyText } from "@/app/_lib/post/processPostBodyText"
import { useContentFontSize } from "@/app/_atoms/contentFontSize"
import { useWordMutes } from "@/app/_atoms/wordMute"
import { syncContents } from "@/app/_lib/sync/syncBookmark"
import useHandleImageClick from "@/app/_components/ViewPostCard/lib/handleDisplayImage"
import useHandleLike from "@/app/_components/ViewPostCard/lib/useHandleLike"
import useHandleRepost from "@/app/_components/ViewPostCard/lib/useHandleRepost"
import useHandleMute from "@/app/_components/ViewPostCard/lib/useHandleMute"
import useHandlePostDelete from "@/app/_components/ViewPostCard/lib/useHandlePostDelete"
import useHandleBookmark from "@/app/_components/ViewPostCard/lib/useHandleBookmark"
import useLongPress from "@/app/_components/ViewPostCard/lib/useLongPress"
import useEmbed from "@/app/_components/ViewPostCard/lib/useEmbed"
import useContentLabels from "@/app/_components/ViewPostCard/lib/useContentLabels"
import useTranslateContentText from "@/app/_components/ViewPostCard/lib/useTranslateContentText"
import { TFunction } from "i18next"
import { AppBskyEmbedRecord } from "@atproto/api"

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

interface reactionJson {
    reaction: string
    postUri: string
    reactionUri: string
}

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
    t: TFunction
    handleValueChange?: (value: reactionJson) => void
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

    const postJsonData = useMemo(
        () => quoteJson || postJson || null,
        [postJson, quoteJson]
    )

    const postView = useMemo((): PostView | null => {
        if (postJson) {
            return postJson
        } else {
            return null
        }
    }, [postJson, quoteJson])
    const [agent] = useAgent()
    const [muteWords] = useWordMutes()
    const [, setImageGallery] = useImageGalleryAtom()
    const router = useRouter()
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

    const [userPreference] = useUserPreferencesAtom()
    const [contentWarning, setContentWarning] = useState<boolean>(false)
    const warningReason = useRef<string | null | undefined>("")
    const [bookmarks, setBookmarks] = useBookmarks()
    const [contentFontSize] = useContentFontSize()
    const isTranslated = useRef<boolean>(false)
    const [translateError] = useState<boolean>(false)
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

    const [handleBookmark, isBookmarked, setIsBookmarked] = useHandleBookmark(
        bookmarks,
        setBookmarks,
        syncBookmarks
    )

    const handleInputChange = (
        reaction: string,
        postUri: string,
        reactionUri: string
    ) => {
        if (!handleValueChange) return

        const json = {
            reaction: reaction,
            postUri: postUri,
            reactionUri: reactionUri,
        }
        console.log(json)
        handleValueChange(json)
    }

    const [handleRepost, isReposted] = useHandleRepost(
        postView,
        postJsonData,
        handleInputChange,
        agent,
        !!postView?.viewer?.repost
    )

    const [handleLike, isLiked] = useHandleLike(
        postView,
        postJsonData,
        handleInputChange,
        agent,
        !!postView?.viewer?.like
    )

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
    } = useEmbed(postJson, quoteJson)

    const [handleDelete] = useHandlePostDelete(
        agent,
        postJson,
        handleInputChange
    )

    const [handleMute, isMuted] = useHandleMute(
        agent,
        postView,
        !!postJson?.viewer?.muted
    )

    useLayoutEffect(() => {
        if (!userPreference || !postJson) return
        warningReason.current = useContentLabels(
            userPreference,
            postJson,
            quoteJson,
            handleInputChange,
            setContentWarning
        )
    }, [userPreference, postJson, quoteJson])

    useLayoutEffect(() => {
        const shouldDeletePost = (viewer: ViewerState) =>
            viewer?.blockedBy || viewer?.muted || viewer?.blocking

        if (
            (embedRecord &&
                embedRecordViewRecord?.author?.viewer &&
                shouldDeletePost(embedRecordViewRecord.author.viewer)) ||
            (embedMedia &&
                (
                    (embedMedia?.record as AppBskyEmbedRecord.View)?.record
                        ?.author as ProfileViewBasic
                )?.viewer &&
                shouldDeletePost(
                    (
                        (embedMedia?.record as AppBskyEmbedRecord.View)?.record
                            ?.author as ProfileViewBasic
                    ).viewer as ProfileViewBasic
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

    const handleChangeSaveScrollPosition = () => {
        if (!handleSaveScrollPosition) return
        handleSaveScrollPosition()
    }

    const {
        viewTranslatedText,
        setViewTranslatedText,
        translatedJsonData,
        translateContentText,
    } = useTranslateContentText(postJson, postView)

    const longPressTimerRef = useRef<number | null>(null)

    const handleLongPress = () => {
        onOpenOption()
    }

    const handleTouchStart = useLongPress(handleLongPress)

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
                            className={`text-[13px] ${
                                zenMode ? `ml-[11px]` : `ml-[40px]`
                            } text-[#595959] text-bold hover:cursor-pointer md:hover:underline`}
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
                                    useHandleImageClick(
                                        setImageGallery,
                                        images,
                                        index
                                    )
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
                                    useHandleImageClick(
                                        setImageGallery,
                                        images,
                                        index
                                    )
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
                                                    await onOpenReply()
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
