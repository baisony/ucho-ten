"use client"

import {
    ChangeEvent,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react"
import { isMobile } from "react-device-detect"
import { useAgent } from "@/app/_atoms/agent"
import type {
    FeedViewPost,
    PostView,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { notFound, usePathname, useRouter } from "next/navigation"
import { viewProfilePage } from "./styles"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faAt } from "@fortawesome/free-solid-svg-icons/faAt"
import { faCopy } from "@fortawesome/free-solid-svg-icons/faCopy"
import { faD } from "@fortawesome/free-solid-svg-icons/faD"
import { faEllipsis } from "@fortawesome/free-solid-svg-icons/faEllipsis"
import { faFlag } from "@fortawesome/free-solid-svg-icons/faFlag"
import { faLink } from "@fortawesome/free-solid-svg-icons/faLink"
import { faN } from "@fortawesome/free-solid-svg-icons/faN"
import { faVolumeXmark } from "@fortawesome/free-solid-svg-icons/faVolumeXmark"

import defaultIcon from "@/../public/images/icon/default_icon.svg"
import {
    Button,
    Chip,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Skeleton,
    Spinner,
    Textarea,
    useDisclosure,
} from "@nextui-org/react"
import { AppBskyActorProfile, BlobRef, BskyAgent } from "@atproto/api"
import { ReportModal } from "@/app/_components/ReportModal"
import { useTranslation } from "react-i18next"
import { useNextQueryParamsAtom } from "@/app/_atoms/nextQueryParams"
import { Virtuoso, VirtuosoHandle } from "react-virtuoso"
import Link from "next/link"
import {
    useCurrentMenuType,
    useHeaderMenusByHeaderAtom,
    useMenuIndex,
} from "@/app/_atoms/headerMenu"
import { ViewPostCard, ViewPostCardProps } from "@/app/_components/ViewPostCard"
import { processPostBodyText } from "@/app/_lib/post/processPostBodyText"
import { tabBarSpaceStyles } from "@/app/_components/TabBar/tabBarSpaceStyles"
import { DummyHeader } from "@/app/_components/DummyHeader"
import { SwiperSlide } from "swiper/react"
import SwiperCore from "swiper/core"
import { useScrollPositions } from "@/app/_atoms/scrollPosition"
import ViewPostCardSkelton from "@/app/_components/ViewPostCard/ViewPostCardSkelton"
import { SwiperContainer } from "@/app/_components/SwiperContainer"
import { useZenMode } from "@/app/_atoms/zenMode"
import { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs"
import { useSaveScrollPosition } from "@/app/_components/FeedPage/hooks/useSaveScrollPosition"

const PageClient = () => {
    const [currentMenuType, setCurrentMenuType] = useCurrentMenuType()
    const [menus] = useHeaderMenusByHeaderAtom()
    const [agent] = useAgent()
    const [menuIndex] = useMenuIndex()

    const swiperRef = useRef<SwiperCore | null>(null)
    const pathname = usePathname()
    const username = pathname.replace("/profile/", "")

    const [hidden, setHidden] = useState<boolean | null>(null)
    const [zenMode] = useZenMode()

    useLayoutEffect(() => {
        setCurrentMenuType("profile")
    }, [])

    useEffect(() => {
        if (
            currentMenuType === "profile" &&
            swiperRef.current &&
            menuIndex !== swiperRef.current.activeIndex
        ) {
            swiperRef.current.slideTo(menuIndex)
        }
    }, [currentMenuType, menuIndex, swiperRef.current])

    const fetchProfile = async () => {
        if (!agent) return
        try {
            const { data } = await agent.getProfile({ actor: username })
            const user = data.viewer
            if (user?.muted || user?.blockedBy || user?.blocking) {
                setHidden(true)
            } else {
                setHidden(false)
            }
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        if (!agent) return
        void fetchProfile()
    }, [agent])

    return hidden === false ? (
        <>
            <SwiperContainer props={{ page: "profile" }}>
                {menus.profile.map((menu, index) => {
                    return (
                        <SwiperSlide key={index}>
                            <PostPage tab={menu.info} zenMode={zenMode} />
                        </SwiperSlide>
                    )
                })}
            </SwiperContainer>
        </>
    ) : (
        hidden && notFound()
    )
}

export default PageClient

interface PostPageProps {
    tab: string
    zenMode: boolean | undefined
}

const PostPage = (props: PostPageProps) => {
    const { nullTimeline } = tabBarSpaceStyles()
    const router = useRouter()
    const pathname = usePathname()
    const { t } = useTranslation()

    const [agent] = useAgent()
    const [nextQueryParams] = useNextQueryParamsAtom()
    const username = pathname.replace("/profile/", "")

    const [hasMore, setHasMore] = useState(false)
    const [timeline, setTimeline] = useState<FeedViewPost[] | null>(null)
    //const [isEndOfFeed, setIsEndOfFeed] = useState(false)
    const isEndOfFeedRef = useRef(false)
    const [profile, setProfile] = useState<ProfileViewDetailed | null>(null)
    const [now, setNow] = useState<Date>(new Date())

    const scrollRef = useRef<HTMLElement | null>(null)
    const cursor = useRef<string>("")

    const virtuosoRef = useRef<VirtuosoHandle | null>(null)
    const [scrollPositions, setScrollPositions] = useScrollPositions()
    const [zenMode] = useZenMode()

    //const [isFetchingTimeline, setIsFetchingTimeline] = useState(false)
    const isFetchingTimeline = useRef<boolean>(false)

    useEffect(() => {
        const intervalId = setInterval(() => {
            setNow(new Date())
        }, 60 * 1000)

        return () => {
            clearInterval(intervalId)
        }
    }, [])

    const formattingOnlyPostsTimeline = (timeline: FeedViewPost[]) => {
        const seenUris = new Set<string>()

        const filteredData = timeline.filter((item) => {
            if (item.reason) return true
            if (item.reply) return false
            if ((item.post.record as PostView)?.reply) return false
            const uri = item.post.uri

            // まだ uri がセットに登録されていない場合、trueを返し、セットに登録する
            if (!seenUris.has(uri)) {
                seenUris.add(uri)
                return true
            }

            return false
        })

        return filteredData as FeedViewPost[]
    }
    const formattingOnlyRepliesTimeline = (timeline: FeedViewPost[]) => {
        const seenUris = new Set<string>()

        const filteredData = timeline.filter((item) => {
            if (item.reason) return false
            if (!item.reply || !(item.post.record as PostView)?.reply)
                return false
            const uri = item.post.uri

            // まだ uri がセットに登録されていない場合、trueを返し、セットに登録する
            if (!seenUris.has(uri)) {
                seenUris.add(uri)
                return true
            }

            return false
        })

        return filteredData as FeedViewPost[]
    }

    const formattingOnlyMediaTimeline = (timeline: FeedViewPost[]) => {
        const seenUris = new Set<string>()

        const filteredData = timeline.filter((item) => {
            if (item.reason) return false
            if (
                item?.post?.embed?.$type !== "app.bsky.embed.images#view" &&
                item?.post?.embed?.$type !==
                    "app.bsky.embed.recordWithMedia#view"
            )
                return false
            const uri = item.post.uri

            // まだ uri がセットに登録されていない場合、trueを返し、セットに登録する
            if (!seenUris.has(uri)) {
                seenUris.add(uri)
                return true
            }

            return false
        })

        return filteredData as FeedViewPost[]
    }

    const fetchTimeline = async () => {
        if (!agent) {
            return
        }

        if (isEndOfFeedRef.current || isFetchingTimeline.current) return

        try {
            isFetchingTimeline.current = true
            const { data } = await agent.getAuthorFeed({
                actor: username,
                cursor: cursor.current,
            })
            if (
                data.feed.length === 0 &&
                (cursor.current === data.cursor || !data.cursor)
            ) {
                isEndOfFeedRef.current = true
            }

            if (data) {
                if (data.cursor) {
                    cursor.current = data.cursor
                } else {
                    isEndOfFeedRef.current = true
                }

                const { feed } = data

                let filteredData: FeedViewPost[] = []
                if (props.tab === "posts") {
                    filteredData = formattingOnlyPostsTimeline(feed)
                } else if (props.tab === "replies") {
                    filteredData = formattingOnlyRepliesTimeline(feed)
                } else if (props.tab === "media") {
                    filteredData = formattingOnlyMediaTimeline(feed)
                }

                setTimeline((currentTimeline) => {
                    if (currentTimeline !== null) {
                        return [...currentTimeline, ...filteredData]
                    } else {
                        return [...filteredData]
                    }
                })

                if (data.cursor) {
                    cursor.current = data.cursor
                    setHasMore(true)
                }
            } else {
                setHasMore(false)
            }
        } catch (e) {
            setHasMore(false)
            console.error(e)
        } finally {
            //setLoading(false)
            isFetchingTimeline.current = false
        }
    }

    const fetchProfile = async () => {
        if (!agent) return
        try {
            const { data } = await agent.getProfile({ actor: username })
            setProfile(data)
        } catch (e) {
            console.error(e)
        }
    }

    const loadMore = async () => {
        if (isEndOfFeedRef.current) return
        await fetchTimeline()
    }

    useEffect(() => {
        if (profile) {
            void fetchTimeline()
        }
    }, [profile])

    useEffect(() => {
        if (!agent) return
        void fetchProfile()
    }, [agent])

    const onClickDomain = (domain: string) => {
        router.push(`/profile/${domain}?${nextQueryParams.toString()}`)
    }

    const handleSaveScrollPosition = useSaveScrollPosition(
        true,
        virtuosoRef,
        `profile-${username}`,
        props.tab,
        scrollPositions,
        setScrollPositions
    )

    const dataWithDummy = useMemo((): UserProfilePageCellProps[] => {
        let data: UserProfilePageCellProps[] = []

        if (profile && agent) {
            const userProfileProps: UserProfileProps = {
                agent,
                profile,
                isProfileMine: profile.did === agent?.session?.did,
                onClickDomain,
            }

            const feedData: UserProfilePageCellProps = {
                userProfileProps,
            }

            data.push(feedData)
        } else {
            const userProfileProps: UserProfileProps = {
                agent,
                isSkeleton: true,
            }

            const feedData: UserProfilePageCellProps = {
                userProfileProps,
            }

            data.push(feedData)
        }

        if (timeline) {
            const timelineData: UserProfilePageCellProps[] = timeline.map(
                (post) => {
                    const postProps: ViewPostCardProps = {
                        isMobile,
                        bodyText: processPostBodyText(
                            nextQueryParams,
                            post.post
                        ),
                        postJson: post.post,
                        json: post,
                        now,
                        nextQueryParams,
                        t,
                        handleSaveScrollPosition: handleSaveScrollPosition,
                        zenMode: props.zenMode,
                    }

                    return {
                        postProps,
                    }
                }
            )

            data = [...data, ...timelineData]
        } else {
            const timelineData: UserProfilePageCellProps[] = Array.from({
                length: 20,
            }).map(() => {
                const postProps: ViewPostCardProps = {
                    isSkeleton: true,
                    isMobile,
                    bodyText: undefined,
                    now,
                    nextQueryParams,
                    t,
                    handleSaveScrollPosition: handleSaveScrollPosition,
                    zenMode,
                }

                return {
                    postProps,
                }
            })

            data = [...data, ...timelineData]
        }

        if (data.length > 0) {
            data = [{ isDummyHeader: true }, ...data]
        }

        return data
    }, [profile, timeline])

    return (
        <Virtuoso
            scrollerRef={(ref) => {
                if (ref instanceof HTMLElement) {
                    scrollRef.current = ref
                }
            }}
            context={{ hasMore }}
            ref={virtuosoRef}
            restoreStateFrom={
                scrollPositions[`profile-${username}-${props.tab}`]
            }
            overscan={200}
            increaseViewportBy={200}
            data={dataWithDummy}
            atTopThreshold={100}
            atBottomThreshold={100}
            itemContent={(_, item) => (
                <UserProfilePageCell
                    key={
                        `feed-${item.postProps?.postJson?.uri}` ||
                        `profile-${item.userProfileProps?.profile?.did}`
                    }
                    {...item}
                />
            )}
            endReached={loadMore}
            // onScroll={(e) => disableScrollIfNeeded(e)}
            className={nullTimeline()}
        />
    )
}

interface UserProfilePageCellProps {
    isDummyHeader?: boolean
    userProfileProps?: UserProfileProps
    postProps?: ViewPostCardProps
}

const UserProfilePageCell = (props: UserProfilePageCellProps) => {
    const { isDummyHeader, userProfileProps, postProps } = props

    if (isDummyHeader) {
        return <DummyHeader />
    }

    if (userProfileProps) {
        return <UserProfileComponent {...userProfileProps} />
    }

    if (postProps) {
        if (postProps.isSkeleton) return <ViewPostCardSkelton zenMode />
        return <ViewPostCard {...postProps} />
    }
}

interface UserProfileProps {
    agent: BskyAgent | null
    profile?: ProfileViewDetailed | undefined
    isProfileMine?: boolean
    onClickDomain?: (url: string) => void
    isSkeleton?: boolean
}

const UserProfileComponent = ({
    agent,
    profile,
    isProfileMine,
    //onClickDomain,
    isSkeleton,
}: UserProfileProps) => {
    // const router = useRouter()
    const [nextQueryParams] = useNextQueryParamsAtom()
    const [onHoverButton, setOnHoverButton] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isMuted, setIsMuted] = useState(!!profile?.viewer?.muted)
    const { isOpen, onOpen, onOpenChange } = useDisclosure()
    const [displayName, setDisplayName] = useState(profile?.displayName)
    const [description, setDescription] = useState(profile?.description)
    const [avatar, setAvatar] = useState<string | undefined | File>(
        profile?.avatar
    )
    const [banner, setBanner] = useState<string | undefined | File>(
        profile?.banner
    )
    const [isUploading, setIsUploading] = useState(false)
    const [isFollowing, setIsFollowing] = useState(!!profile?.viewer?.following)
    const [copyContent, setCopyContent] = useState<
        "did" | "handle" | "displayName" | ""
    >("")
    const { t } = useTranslation()
    const {
        isOpen: isOpenReport,
        onOpen: onOpenReport,
        onOpenChange: onOpenChangeReport,
    } = useDisclosure()
    const {
        isOpen: isOpenCopy,
        onOpen: onOpenCopy,
        onOpenChange: onOpenChangeCopy,
    } = useDisclosure()

    const {
        isOpen: isOpenProperty,
        onOpen: onOpenProperty,
        onOpenChange: onOpenChangeProperty,
    } = useDisclosure()
    const {
        //background,
        ProfileContainer,
        ProfileInfoContainer,
        HeaderImageContainer,
        ProfileHeaderImage,
        ProfileImage,
        ProfileDisplayName,
        ProfileHandle,
        ProfileCopyButton,
        ProfileActionButton,
        FollowButton,
        ProfileBio,
        Buttons,
        PropertyButton,
        //PostContainer,
        appearanceTextColor,
    } = viewProfilePage()

    const bannerInputRef = useRef<HTMLInputElement | null>(null)
    const avatarInputRef = useRef<HTMLInputElement | null>(null)

    const handleBannerFileSelect = useCallback(() => {
        if (bannerInputRef.current) {
            bannerInputRef.current.click()
        }
    }, [])
    const handleAvatarFileSelect = useCallback(() => {
        if (avatarInputRef.current) {
            avatarInputRef.current.click()
        }
    }, [])

    const handleBannerClick = (event: ChangeEvent<HTMLInputElement>) => {
        // 選択されたファイルを取得
        const target = event.target as HTMLInputElement
        const selectedFile = (target.files as FileList)[0]

        // 選択されたファイルに対する処理を行う
        setBanner(selectedFile)
    }
    const handleAvatarClick = (event: ChangeEvent<HTMLInputElement>) => {
        // 選択されたファイルを取得
        const target = event.target as HTMLInputElement
        const selectedFile = (target.files as FileList)[0]

        // 選択されたファイルに対する処理を行う
        setAvatar(selectedFile)
    }
    const handleSaveClick = async () => {
        if (!agent) {
            return
        }

        try {
            setIsUploading(true)
            let avatarBlob: BlobRef | undefined

            if (
                avatar !== profile?.avatar &&
                typeof avatar !== "string" &&
                avatar
            ) {
                const result = await agent.uploadBlob(
                    new Uint8Array(await avatar?.arrayBuffer()),
                    {
                        encoding: avatar?.type,
                    }
                )
                avatarBlob = result.data.blob
            }

            let bannerBlob: BlobRef | undefined

            if (
                banner !== profile?.banner &&
                typeof banner !== "string" &&
                banner
            ) {
                const result = await agent.uploadBlob(
                    new Uint8Array(await banner?.arrayBuffer()),
                    {
                        encoding: banner?.type,
                    }
                )
                bannerBlob = result.data.blob
            }
            await agent.upsertProfile((old) => {
                const profile: AppBskyActorProfile.Record = {
                    ...old,
                    avatar: avatarBlob ?? old?.avatar,
                    banner: bannerBlob ?? old?.banner,
                    displayName: displayName || undefined,
                    description: description || undefined,
                }
                return profile
            })
            setIsUploading(false)
            return true
        } catch (e) {
            console.log(e)
            setIsUploading(false)
            return false
        }
    }

    const renderTextWithLinks = useMemo(() => {
        if (!profile?.description) return
        const description = profile?.description
        const post: JSX.Element[] = []
        description.split("\n").map((line: string, i: number) => {
            const words = line.split(" ")
            const updatedLine = words.map((word, j: number) => {
                if (word.includes("http://") || word.includes("https://")) {
                    const url = word.replace(/https?:\/\//, "") // http://またはhttps://を削除
                    return (
                        <Chip
                            size={"sm"}
                            variant="faded"
                            key={i + "_" + j}
                            startContent={<FontAwesomeIcon icon={faLink} />}
                            className={"overflow-hidden w-full"}
                        >
                            {url.startsWith("bsky.app") ? (
                                <Link
                                    className={"cursor-pointer"}
                                    href={
                                        url.replace(
                                            "bsky.app",
                                            `${location.protocol}//${window.location.host}`
                                        ) + `?${nextQueryParams.toString()}`
                                    }
                                >
                                    {url}
                                </Link>
                            ) : (
                                <a
                                    href={word}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {url}
                                </a>
                            )}
                        </Chip>
                    )
                } else if (word.startsWith("@")) {
                    let handle = word.substring(1) // remove "@" symbol from match
                    if (handle.endsWith(".")) {
                        handle = handle.slice(0, -1)
                    }
                    return (
                        <Chip
                            size={"sm"}
                            key={i + "_" + j}
                            className={`cursor-pointer`}
                            variant="faded"
                            startContent={<FontAwesomeIcon icon={faAt} />}
                        >
                            <Link
                                key={j}
                                href={`/profile/${handle}?${nextQueryParams.toString()}`}
                            >
                                {handle}
                            </Link>
                        </Chip>
                    )
                }
                return <span key={i + "_" + j}>{word} </span>
            })

            post.push(
                <p key={i}>
                    {updatedLine}
                    <br />
                </p>
            )
        })
        return post
    }, [profile?.description])

    const copyToClipboard = useCallback(
        (text: string, key: string) => {
            navigator.clipboard
                .writeText(text)
                .then(() => {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    //@ts-ignore
                    setCopyContent(key)
                })
                .catch((error) => {
                    console.error("Copy unsuccessful", error)
                })
        },
        [copyContent]
    )

    const handleMute = async () => {
        if (isLoading || !profile) return
        setIsLoading(true)
        if (isMuted) {
            await agent?.unmute(profile?.did)
            setIsMuted(!isMuted)
        } else {
            await agent?.mute(profile?.did)
            setIsMuted(!isMuted)
        }
        setIsLoading(false)
    }

    useEffect(() => {
        if (!profile) return
        setBanner(profile?.banner)
        setAvatar(profile?.avatar)
        setDisplayName(profile?.displayName)
        setDescription(profile?.description)
        setIsMuted(!!profile?.viewer?.muted)
        setIsFollowing(!!profile?.viewer?.following)
    }, [profile])

    return (
        <>
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                placement={isMobile ? "top" : "center"}
                className={`z-[100] max-w-[600px] ${appearanceTextColor()} ${
                    isMobile && `mt-[env(safe-area-inset-top)]`
                }`}
                isDismissable={isUploading}
                hideCloseButton
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>
                                {t("pages.profile.editProfile")} @
                                {agent?.session?.handle}
                            </ModalHeader>
                            <ModalBody>
                                <div
                                    className="Header w-full relative"
                                    onClick={handleBannerFileSelect}
                                >
                                    <img
                                        src={
                                            banner instanceof File
                                                ? URL.createObjectURL(banner)
                                                : profile?.banner
                                        }
                                        alt={"banner"}
                                        className="w-full h-[150px] object-cover opacity-100 hover:opacity-30 transition-opacity duration-300 hover:cursor-pointer"
                                    />
                                    <input
                                        type="file"
                                        accept="image/*,.png,.jpg,.jpeg"
                                        style={{ display: "none" }}
                                        onChange={(
                                            e: ChangeEvent<HTMLInputElement>
                                        ) => {
                                            handleBannerClick(e)
                                        }}
                                        ref={bannerInputRef}
                                    />
                                </div>

                                <h3 className="text-default-500 text-small select-none">
                                    Icon
                                </h3>
                                <div
                                    className="rounded-full h-[80px] hover:z-10 relative"
                                    onClick={handleAvatarFileSelect}
                                >
                                    <img
                                        src={
                                            avatar instanceof File
                                                ? URL.createObjectURL(avatar)
                                                : profile?.avatar ||
                                                  defaultIcon.src
                                        }
                                        alt={"avatar"}
                                        className="h-[80px] w-[80px] rounded-full object-cover absolute inset-0 transition-opacity duration-300 opacity-100 hover:opacity-30 hover:cursor-pointer"
                                    />
                                    <input
                                        type="file"
                                        accept="image/*,.png,.jpg,.jpeg"
                                        style={{ display: "none" }}
                                        onChange={(e) => {
                                            handleAvatarClick(e)
                                        }}
                                        ref={avatarInputRef}
                                    />
                                </div>

                                <h3 className="text-default-500 text-small select-none">
                                    {t("pages.profile.displayName")} (
                                    {displayName?.length ?? 0} / 64)
                                </h3>
                                <div className={"w-full"}>
                                    <Input
                                        size={"md"}
                                        defaultValue={profile?.displayName}
                                        onValueChange={setDisplayName}
                                    />
                                </div>
                                <h3 className="text-default-500 text-small select-none">
                                    {t("pages.profile.bio")} (
                                    {description?.length ?? 0} / 256)
                                </h3>
                                <div className={"w-full"}>
                                    <Textarea
                                        defaultValue={profile?.description}
                                        onValueChange={setDescription}
                                    />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    onClick={() => {
                                        setAvatar(profile?.avatar)
                                        setBanner(profile?.banner)
                                        setDisplayName(profile?.displayName)
                                        setDescription(profile?.description)
                                        onClose()
                                    }}
                                    color={
                                        banner === profile?.banner &&
                                        avatar === profile?.avatar &&
                                        displayName === profile?.displayName &&
                                        description === profile?.description
                                            ? "default"
                                            : "danger"
                                    }
                                    isDisabled={isUploading}
                                >
                                    {t("button.cancel")}
                                </Button>
                                <Button
                                    onClick={async () => {
                                        const result = await handleSaveClick()
                                        if (result) onClose()
                                    }}
                                    isDisabled={
                                        (banner === profile?.banner &&
                                            avatar === profile?.avatar &&
                                            displayName ===
                                                profile?.displayName &&
                                            description ===
                                                profile?.description) ||
                                        isUploading
                                    }
                                    color={
                                        (banner === profile?.banner &&
                                            avatar === profile?.avatar &&
                                            displayName ===
                                                profile?.displayName &&
                                            description ===
                                                profile?.description) ||
                                        isUploading
                                            ? "default"
                                            : "success"
                                    }
                                >
                                    {isUploading ? (
                                        <Spinner size={"sm"} />
                                    ) : (
                                        t("button.save")
                                    )}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
            <ReportModal
                isOpen={isOpenReport}
                onOpenChange={onOpenChangeReport}
                placement={isMobile ? "top" : "center"}
                className={"z-[100] max-w-[600px]"}
                target={"account"}
                profile={profile}
                nextQueryParams={nextQueryParams}
            />
            <Modal
                isOpen={isOpenCopy}
                onOpenChange={onOpenChangeCopy}
                placement={"bottom"}
                className={"z-[100] max-w-[600px] text-black dark:text-white"}
                hideCloseButton
            >
                <ModalContent>
                    {() => (
                        <>
                            <ModalHeader>Copy</ModalHeader>
                            <ModalBody>
                                <span>
                                    <div
                                        className={"mt-[15px] mb-[15px] w-full"}
                                        onClick={() => {
                                            if (!profile) return
                                            copyToClipboard(profile?.did, "did")
                                        }}
                                    >
                                        DID
                                    </div>
                                    <div
                                        className={"mt-[15px] mb-[15px] w-full"}
                                        onClick={() => {
                                            if (!profile) return
                                            copyToClipboard(
                                                profile?.handle,
                                                "handle"
                                            )
                                        }}
                                    >
                                        handle
                                    </div>
                                    <div
                                        className={"mt-[15px] mb-[15px] w-full"}
                                        onClick={() => {
                                            if (!profile) return
                                            copyToClipboard(
                                                profile?.displayName ??
                                                    profile?.handle,
                                                "displayName"
                                            )
                                        }}
                                    >
                                        Name
                                    </div>
                                </span>
                            </ModalBody>
                            <ModalFooter></ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
            <Modal
                isOpen={isOpenProperty}
                onOpenChange={onOpenChangeProperty}
                placement={"bottom"}
                className={"z-[100] max-w-[600px] text-black dark:text-white"}
                hideCloseButton
            >
                <ModalContent>
                    {() => (
                        <>
                            <ModalHeader>Actions</ModalHeader>
                            <ModalBody>
                                <span>
                                    <div
                                        className={
                                            "mt-[15px] mb-[15px] w-full text-red-600"
                                        }
                                        onClick={() => {
                                            void handleMute()
                                        }}
                                    >
                                        <FontAwesomeIcon
                                            icon={faVolumeXmark}
                                            className={"w-[40px]"}
                                        />
                                        {!isMuted ? (
                                            <span>
                                                {t("pages.profile.mute")}
                                            </span>
                                        ) : (
                                            <span>
                                                {t("pages.profile.unmute")}
                                            </span>
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
                                        {t("pages.profile.report")}
                                    </div>
                                </span>
                            </ModalBody>
                            <ModalFooter></ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
            <div className={ProfileContainer()}>
                <div className={HeaderImageContainer()}>
                    {!isSkeleton ? (
                        !!profile?.banner ? (
                            <img
                                className={ProfileHeaderImage()}
                                src={profile?.banner}
                                alt={"banner"}
                            />
                        ) : (
                            <div
                                className={`${ProfileHeaderImage()} bg-white dark:bg-gray-800`}
                            />
                        )
                    ) : (
                        <Skeleton className={`h-full w-full`} />
                    )}
                </div>
                <div className={ProfileInfoContainer()}>
                    <div
                        className={`flex flex-row items-center justify-center bg-white dark:bg-black h-[90px] w-[90px] rounded-full absolute top-[-30px]`}
                    >
                        {!isSkeleton ? (
                            <img
                                className={ProfileImage()}
                                src={profile?.avatar || defaultIcon.src}
                                alt={"avatar"}
                            />
                        ) : (
                            <div className={ProfileImage()}>
                                <Skeleton
                                    className={`h-[80px] w-[80px] rounded-full`}
                                />
                            </div>
                        )}
                    </div>
                    <div className={Buttons()}>
                        {!isSkeleton && (
                            <>
                                <div
                                    className={`${ProfileActionButton()} flex md:hidden`}
                                    onClick={() => {
                                        onOpenCopy()
                                    }}
                                >
                                    <FontAwesomeIcon
                                        icon={faCopy}
                                        className={PropertyButton()}
                                    />
                                </div>
                                <Dropdown
                                    isDisabled={isSkeleton}
                                    className={`${appearanceTextColor()} hidden md:flex`}
                                >
                                    <DropdownTrigger>
                                        <div
                                            className={`${ProfileCopyButton()} hidden md:flex`}
                                        >
                                            <FontAwesomeIcon
                                                icon={faCopy}
                                                className={PropertyButton()}
                                            />
                                        </div>
                                    </DropdownTrigger>
                                    <DropdownMenu aria-label={"copy-dropdown"}>
                                        <DropdownItem
                                            key="copydid"
                                            startContent={
                                                <FontAwesomeIcon icon={faD} />
                                            }
                                            onClick={() => {
                                                if (!profile) return
                                                void navigator.clipboard.writeText(
                                                    profile?.did
                                                )
                                            }}
                                        >
                                            {t("pages.profile.copyDID")}
                                        </DropdownItem>
                                        <DropdownItem
                                            key="copyhandle"
                                            startContent={
                                                <FontAwesomeIcon icon={faAt} />
                                            }
                                            onClick={() => {
                                                if (!profile) return
                                                void navigator.clipboard.writeText(
                                                    profile?.handle
                                                )
                                            }}
                                        >
                                            {t("pages.profile.copyHandle")}
                                        </DropdownItem>
                                        <DropdownItem
                                            key="copydisplayname"
                                            startContent={
                                                <FontAwesomeIcon icon={faN} />
                                            }
                                            onClick={() => {
                                                if (!profile) return
                                                void navigator.clipboard.writeText(
                                                    (profile?.displayName ??
                                                        profile?.handle) as string
                                                )
                                            }}
                                        >
                                            {t("pages.profile.copyDisplauName")}
                                        </DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            </>
                        )}
                        {!isProfileMine && !isSkeleton && (
                            <>
                                <div
                                    className={`${ProfileActionButton()} flex md:hidden`}
                                    onClick={() => {
                                        onOpenProperty()
                                    }}
                                >
                                    <FontAwesomeIcon
                                        icon={faEllipsis}
                                        className={PropertyButton()}
                                    />
                                </div>
                                <Dropdown
                                    isDisabled={isSkeleton}
                                    className={`${appearanceTextColor()} hidden md:flex`}
                                >
                                    <DropdownTrigger>
                                        <div
                                            className={`${ProfileActionButton()} hidden md:flex`}
                                        >
                                            <FontAwesomeIcon
                                                icon={faEllipsis}
                                                className={PropertyButton()}
                                            />
                                        </div>
                                    </DropdownTrigger>
                                    <DropdownMenu
                                        aria-label={"option-dropdown"}
                                    >
                                        <DropdownItem
                                            key="mute"
                                            className="text-danger"
                                            color="danger"
                                            startContent={
                                                <FontAwesomeIcon
                                                    icon={faVolumeXmark}
                                                />
                                            }
                                            onClick={() => {
                                                void handleMute()
                                            }}
                                        >
                                            {!isMuted
                                                ? t("pages.profile.mute")
                                                : t("pages.profile.unmute")}
                                        </DropdownItem>
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
                                                onOpenReport()
                                            }}
                                        >
                                            {t("pages.profile.report")}
                                        </DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            </>
                        )}
                        <Button
                            isDisabled={isSkeleton}
                            className={`${FollowButton()} `}
                            color={
                                isFollowing
                                    ? onHoverButton && !isProfileMine
                                        ? "danger"
                                        : "default"
                                    : "default"
                            }
                            variant={"ghost"}
                            onMouseLeave={() => {
                                if (isMobile) return
                                setOnHoverButton(false)
                            }}
                            onMouseEnter={() => {
                                if (isMobile) return
                                setOnHoverButton(true)
                            }}
                            onClick={async () => {
                                if (isProfileMine) {
                                    onOpen()
                                } else if (isFollowing) {
                                    if (!agent) return
                                    try {
                                        if (!profile?.viewer) return
                                        await agent.deleteFollow(
                                            profile?.viewer?.following as string
                                        )
                                        setIsFollowing(false)
                                        profile.viewer.following = undefined
                                    } catch (e) {}
                                    // unfollow
                                } else if (!isFollowing) {
                                    if (!agent) return
                                    // follow
                                    try {
                                        const res = await agent.follow(
                                            profile?.did as string
                                        )
                                        setIsFollowing(true)
                                        if (profile?.viewer)
                                            profile.viewer.following = res.cid
                                    } catch (e) {
                                        console.log(e)
                                    }
                                }
                            }}
                        >
                            {isProfileMine
                                ? t("pages.profile.editProfile")
                                : isFollowing
                                  ? !onHoverButton
                                      ? t("button.following")
                                      : t("button.unfollow")
                                  : t("button.follow")}
                        </Button>
                    </div>
                    <div className={ProfileDisplayName()}>
                        {!isSkeleton ? (
                            profile?.displayName
                        ) : (
                            <Skeleton
                                className={`h-[24px] w-[180px] rounded-[10px] mt-[8px]`}
                            />
                        )}
                    </div>
                    <div className={ProfileHandle()}>
                        {!isSkeleton ? (
                            `@${profile?.handle}`
                        ) : (
                            <Skeleton
                                className={`h-[16px] w-[130px] rounded-[10px] mt-[10px]`}
                            />
                        )}
                    </div>
                    <div className={ProfileBio()}>
                        {!isSkeleton ? (
                            renderTextWithLinks
                        ) : (
                            <>
                                <Skeleton
                                    className={`h-[16px] w-full rounded-[10px]`}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
