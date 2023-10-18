"use client"
// import { RichText, UnicodeString } from "@atproto/api"
// import { TabBar } from "@/app/components/TabBar"
import { ViewPostCard } from "@/app/components/ViewPostCard"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { isMobile } from "react-device-detect"
import { useAgent } from "@/app/_atoms/agent"
import InfiniteScroll from "react-infinite-scroller"
// import type { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import type { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { usePathname, useRouter } from "next/navigation"
import { viewProfilePage } from "./styles"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
// import { faImage, faTrashCan } from "@fortawesome/free-regular-svg-icons"
import {
    faAt,
    faCopy,
    faEllipsis,
    faFlag,
    faLink,
    faUser,
    faVolumeXmark,
} from "@fortawesome/free-solid-svg-icons"
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
import { useAppearanceColor } from "@/app/_atoms/appearanceColor"
import { AppBskyActorProfile, BlobRef, BskyAgent } from "@atproto/api"
import { useUserPreferencesAtom } from "@/app/_atoms/preferences"
import { ReportModal } from "@/app/components/ReportModal"

export default function Root() {
    const [agent, setAgent] = useAgent()
    const router = useRouter()
    const [appearanceColor] = useAppearanceColor()
    const pathname = usePathname()
    const username = pathname.replace("/profile/", "")

    const [loading, setLoading] = useState(true)
    const [hasMore, setHasMore] = useState(false)
    const [timeline, setTimeline] = useState<FeedViewPost[]>([])
    // const [availavleNewTimeline, setAvailableNewTimeline] = useState(false)
    // const [newTimeline, setNewTimeline] = useState<FeedViewPost[]>([])
    const [profile, setProfile] = useState<any>(null)
    // const [newCursor, setNewCursor] = useState<string | null>(null)
    // const [hasCursor, setHasCursor] = useState<string | null>(null)
    const [darkMode, setDarkMode] = useState(false)
    // const [isProfileMine, setIsProfileMine] = useState(false)
    const [isFollowing, setIsFollowing] = useState(profile?.viewer?.following)
    // const [isEditing, setIsEditing] = useState(false)
    // const [hasMoreLimit, setHasMoreLimit] = useState(false)
    const [now, setNow] = useState<Date>(new Date())

    const cursor = useRef<string>("")

    const color = darkMode ? "dark" : "light"

    const modeMe = (e: any) => {
        setDarkMode(!!e.matches)
    }

    useEffect(() => {
        const intervalId = setInterval(() => {
            setNow(new Date())
        }, 60 * 1000)

        return () => {
            clearInterval(intervalId)
        }
    }, [])

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

    // const handleRefresh = () => {
    //     console.log("refresh")

    //     // newtimelineとtimelineの差分を取得
    //     console.log(timeline)
    //     console.log(newTimeline)
    //     const diffTimeline = newTimeline.filter((newItem) => {
    //         return !timeline.some(
    //             (oldItem) => oldItem.post.uri === newItem.post.uri
    //         )
    //     })
    //     console.log(diffTimeline)
    //     // timelineに差分を追加
    //     setTimeline([...diffTimeline, ...timeline])
    //     setAvailableNewTimeline(false)
    // }

    const formattingTimeline = (timeline: FeedViewPost[]) => {
        const seenUris = new Set<string>()

        const filteredData = timeline.filter((item) => {
            const uri = item.post.uri
            if (item.reply) {
                if (item.reason) {
                    return true
                } else if (
                    //@ts-ignore
                    item.post.author.did === item.reply.parent.author.did &&
                    //@ts-ignore
                    item.reply.parent.author.did === item.reply.root.author.did
                ) {
                    return true
                } else {
                    return false
                }
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

    const fetchTimeline = async () => {
        if (!agent) {
            return
        }

        try {
            const { data } = await agent.getAuthorFeed({
                actor: username,
                cursor: cursor.current,
            })

            if (data) {
                if (data.cursor) {
                    cursor.current = data.cursor
                }

                const { feed } = data

                const filteredData = formattingTimeline(feed)

                setTimeline((currentTimeline) => {
                    if (currentTimeline !== null) {
                        const newTimeline = [
                            ...currentTimeline,
                            ...filteredData,
                        ]

                        return newTimeline
                    } else {
                        return [...filteredData]
                    }
                })

                if (data.cursor) {
                    cursor.current = data.cursor
                    setHasMore(true)
                }
            } else {
                console.log("Responseがundefinedです。")
                setHasMore(false)
            }
        } catch (e) {
            setHasMore(false)
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const fetchProfile = async () => {
        if (!agent) return
        try {
            const { data } = await agent.getProfile({ actor: username })
            console.log(data)
            setProfile(data)
        } catch (e) {
            console.error(e)
        }
    }

    const loadMore = async (page: any) => {
        await fetchTimeline()
    }

    // const loadMore = async (page: any) => {
    //     if (!agent) {
    //         return
    //     }
    //     if (!cursor) return
    //     try {
    //         setLoading2(true)
    //         const { data } = await agent.getAuthorFeed({
    //             cursor: !hasCursor ? cursor : hasCursor,
    //             actor: username,
    //         })
    //         const { feed } = data
    //         if (feed.length === 0) setHasMoreLimit(true)
    //         if (data.cursor) {
    //             setHasCursor(data.cursor)
    //         }
    //         const filteredData = FormattingTimeline(feed)
    //         const diffTimeline = filteredData.filter((newItem) => {
    //             return !timeline.some(
    //                 (oldItem) => oldItem.post.uri === newItem.post.uri
    //             )
    //         })

    //         //取得データをリストに追加
    //         setTimeline([...timeline, ...diffTimeline])
    //         setLoading2(false)
    //     } catch (e) {
    //         setLoading2(false)
    //         console.log(e)
    //     }
    // }

    // const checkNewTimeline = async () => {
    //     if (!agent) return
    //     try {
    //         const { data } = await agent?.getAuthorFeed({ actor: username })
    //         if (data) {
    //             const { feed } = data
    //             const filteredData = FormattingTimeline(feed)

    //             if (data.cursor && data.cursor !== cursor) {
    //                 setNewCursor(data.cursor)
    //                 setAvailableNewTimeline(true)
    //                 setNewTimeline(filteredData)
    //             }
    //         }
    //     } catch (e) {}
    // }

    // useEffect(() => {
    //     if (!agent) return
    //     fetchTimeline()
    // }, [agent])

    useEffect(() => {
        if (profile) {
            fetchTimeline()
        }
    }, [profile])

    useEffect(() => {
        if (!agent) return
        fetchProfile()
    }, [agent, username])

    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         checkNewTimeline()
    //     }, 15000)
    //     // クリーンアップ関数
    //     return () => {
    //         clearInterval(interval) // インターバルをクリーンアップ
    //     }
    // }, [agent, cursor])

    const onClickDomain = (domain: string) => {
        router.push(`/profile/${domain}`)
    }

    return (
        <InfiniteScroll
            loadMore={loadMore} //項目を読み込む際に処理するコールバック関数
            hasMore={hasMore} //読み込みを行うかどうかの判定
            loader={
                <div
                    key="spinner-profile"
                    className="flex justify-center mt-2 mb-2"
                >
                    <Spinner />
                </div>
            }
            threshold={700}
            useWindow={false}
        >
            {profile ? (
                <UserProfileComponent
                    agent={agent}
                    profile={profile}
                    color={color}
                    isProfileMine={profile.did === agent?.session?.did}
                    onClickDomain={onClickDomain}
                />
            ) : (
                <UserProfileComponent
                    agent={agent}
                    color={color}
                    isSkeleton={true}
                />
            )}
            {(loading || !agent) &&
                Array.from({ length: 15 }, (_, index) => (
                    <ViewPostCard
                        key={`skeleton-${index}`}
                        color={color}
                        isMobile={isMobile}
                        isSkeleton={true}
                    />
                ))}
            {!loading &&
                agent &&
                timeline.map((post, index) => (
                    <ViewPostCard
                        key={`post-${index}-${post.post.uri}`}
                        color={color}
                        postJson={post.post}
                        json={post}
                        isMobile={isMobile}
                        now={now}
                    />
                ))}
        </InfiniteScroll>
    )
}

interface userProfileProps {
    agent: BskyAgent | null
    profile?: any
    color: "light" | "dark"
    isProfileMine?: boolean
    onClickDomain?: (url: string) => void
    isSkeleton?: boolean
}

const UserProfileComponent = ({
    agent,
    profile,
    color,
    isProfileMine,
    onClickDomain,
    isSkeleton,
}: userProfileProps) => {
    const router = useRouter()
    const [userPreferences] = useUserPreferencesAtom()
    const [onHoverButton, setOnHoverButton] = useState(false)
    const { isOpen, onOpen, onOpenChange } = useDisclosure()
    const [displayName, setDisplayName] = useState(profile?.displayName)
    const [description, setDescription] = useState(profile?.description)
    const [avatar, setAvatar] = useState(profile?.avatar)
    const [banner, setBanner] = useState(profile?.banner)
    const [isUploading, setIsUploading] = useState(false)
    const [isFollowing, setIsFollowing] = useState(profile?.viewer?.following)
    const {
        isOpen: isOpenReport,
        onOpen: onOpenReport,
        onOpenChange: onOpenChangeReport,
    } = useDisclosure()
    const {
        background,
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
        PostContainer,
        dropdown,
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

    const handleBannerClick = (event: any) => {
        // 選択されたファイルを取得
        const selectedFile = event.target.files[0]

        // 選択されたファイルに対する処理を行うことができます
        console.log("選択されたファイル:", selectedFile)
        setBanner(selectedFile)
    }
    const handleAvatarClick = (event: any) => {
        // 選択されたファイルを取得
        const selectedFile = event.target.files[0]

        // 選択されたファイルに対する処理を行うことができます
        console.log("選択されたファイル:", selectedFile)
        setAvatar(selectedFile)
    }
    const handleSaveClick = async () => {
        if (!agent) {
            return
        }
        console.log(banner)
        console.log(avatar)

        try {
            setIsUploading(true)
            let avatarBlob: BlobRef | undefined

            if (avatar !== profile?.avatar) {
                const result = await agent.uploadBlob(
                    new Uint8Array(await avatar.arrayBuffer()),
                    {
                        encoding: avatar.type,
                    }
                )
                avatarBlob = result.data.blob
            }

            let bannerBlob: BlobRef | undefined

            if (banner !== profile?.banner) {
                const result = await agent.uploadBlob(
                    new Uint8Array(await banner.arrayBuffer()),
                    {
                        encoding: banner.type,
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
        } catch (e) {
            console.log(e)
        }
    }

    const renderTextWithLinks = useMemo(() => {
        if (!profile?.description) return
        const description = profile?.description
        if (true) {
            const post: any[] = []
            description.split("\n").map((line: string, i: number) => {
                const words = line.split(" ")
                const updatedLine = words.map((word, j: number) => {
                    if (word.includes("http://") || word.includes("https://")) {
                        const url = word.replace(/https?:\/\//, "") // http://またはhttps://を削除
                        return (
                            <Chip
                                className={color}
                                variant="faded"
                                key={i + "_" + j}
                                startContent={<FontAwesomeIcon icon={faLink} />}
                            >
                                {url.startsWith("bsky.app") ? (
                                    <span
                                        className={"cursor-pointer"}
                                        onClick={() => {
                                            router.push(
                                                url.replace(
                                                    "bsky.app",
                                                    `${location.protocol}//${window.location.host}`
                                                )
                                            )
                                        }}
                                    >
                                        {url}
                                    </span>
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
                                key={i + "_" + j}
                                className={`${color} cursor-pointer`}
                                variant="faded"
                                startContent={<FontAwesomeIcon icon={faAt} />}
                            >
                                <span
                                    key={j}
                                    onClick={() => {
                                        router.push(`/profile/${handle}`)
                                    }}
                                >
                                    {handle}
                                </span>
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
        }
    }, [profile?.description])

    return (
        <>
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                placement={isMobile ? "top" : "center"}
                className={`z-[100] max-w-[600px] ${color} ${
                    color === `dark` ? `text-white` : `text-black`
                }`}
                isDismissable={isUploading}
                hideCloseButton
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>
                                Edit Profile @{agent?.session?.handle}
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
                                        className="w-full h-[150px] object-cover opacity-100 hover:opacity-30 transition-opacity duration-300 hover:cursor-pointer"
                                    />
                                    <input
                                        type="file"
                                        accept="image/*,.png,.jpg,.jpeg"
                                        style={{ display: "none" }}
                                        onChange={(e) => {
                                            handleBannerClick(e)
                                        }}
                                        ref={bannerInputRef}
                                    />
                                </div>

                                <h3 className="text-default-500 text-small select-none">
                                    Icon
                                </h3>
                                <div
                                    className="rounded-[10px] h-[80px] hover:z-10 relative"
                                    onClick={handleAvatarFileSelect}
                                >
                                    <img
                                        src={
                                            avatar instanceof File
                                                ? URL.createObjectURL(avatar)
                                                : profile?.avatar
                                        }
                                        className="h-[80px] w-[80px] rounded-[10px] object-cover absolute inset-0 transition-opacity duration-300 opacity-100 hover:opacity-30 hover:cursor-pointer"
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
                                    Display Name
                                </h3>
                                <div className={"w-full"}>
                                    <Input
                                        size={"md"}
                                        defaultValue={profile?.displayName}
                                        onValueChange={setDisplayName}
                                    />
                                </div>
                                <h3 className="text-default-500 text-small select-none">
                                    Bio
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
                                    Cancel
                                </Button>
                                <Button
                                    onClick={async () => {
                                        console.log("hoge")
                                        await handleSaveClick()
                                        onClose()
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
                                        "Save"
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
                color={color}
                target={"account"}
                profile={profile}
            />
            <div className={ProfileContainer()}>
                <div className={HeaderImageContainer()}>
                    {!isSkeleton ? (
                        <img
                            className={ProfileHeaderImage()}
                            src={profile?.banner}
                        />
                    ) : (
                        <Skeleton className={`h-full w-full ${color}`} />
                    )}
                </div>
                <div className={ProfileInfoContainer({ color: color })}>
                    {!isSkeleton ? (
                        profile?.avatar ? (
                            <img
                                className={ProfileImage()}
                                src={profile.avatar}
                            />
                        ) : (
                            <div className={`${ProfileImage()} bg-white`}>
                                <FontAwesomeIcon
                                    icon={faUser}
                                    className={"w-full h-full"}
                                />
                            </div>
                        )
                    ) : (
                        <div className={ProfileImage()}>
                            <Skeleton
                                className={`h-[80px] w-[80px] rounded-[10px] ${color}`}
                            />
                        </div>
                    )}
                    <div className={Buttons()}>
                        <Dropdown
                            className={dropdown({ color: color })}
                            isDisabled={isSkeleton}
                        >
                            <DropdownTrigger>
                                <div className={ProfileCopyButton()}>
                                    <FontAwesomeIcon
                                        icon={faCopy}
                                        className={PropertyButton()}
                                    />
                                </div>
                            </DropdownTrigger>
                            <DropdownMenu aria-label={"copy-dropdown"}>
                                <DropdownItem
                                    key="new"
                                    onClick={() => {
                                        navigator.clipboard.writeText(
                                            profile.did
                                        )
                                    }}
                                >
                                    Copy DID
                                </DropdownItem>
                                <DropdownItem
                                    key="copy"
                                    onClick={() => {
                                        navigator.clipboard.writeText(
                                            profile.handle
                                        )
                                    }}
                                >
                                    Copy Handle
                                </DropdownItem>
                                <DropdownItem
                                    key="edit"
                                    onClick={() => {
                                        navigator.clipboard.writeText(
                                            profile.displayName
                                        )
                                    }}
                                >
                                    Copy DisplayName
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                        {!isProfileMine && !isSkeleton && (
                            <Dropdown
                                className={dropdown({ color: color })}
                                isDisabled={isSkeleton}
                            >
                                <DropdownTrigger>
                                    <div className={ProfileActionButton()}>
                                        <FontAwesomeIcon
                                            icon={faEllipsis}
                                            className={PropertyButton()}
                                        />
                                    </div>
                                </DropdownTrigger>
                                <DropdownMenu aria-label={"option-dropdown"}>
                                    <DropdownItem
                                        key="mute"
                                        startContent={
                                            <FontAwesomeIcon
                                                icon={faVolumeXmark}
                                            />
                                        }
                                    >
                                        Mute
                                    </DropdownItem>
                                    <DropdownItem
                                        key="report"
                                        className="text-danger"
                                        color="danger"
                                        startContent={
                                            <FontAwesomeIcon icon={faFlag} />
                                        }
                                        onClick={() => {
                                            onOpenReport()
                                        }}
                                    >
                                        Report
                                    </DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        )}
                        <Button
                            isDisabled={isSkeleton}
                            className={`${FollowButton({
                                color: color,
                                hover: onHoverButton,
                            })} `}
                            color={
                                isFollowing
                                    ? onHoverButton && !isProfileMine
                                        ? "danger"
                                        : "default"
                                    : "default"
                            }
                            variant={isProfileMine ? "ghost" : "solid"}
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
                                        const res = await agent.deleteFollow(
                                            profile.viewer.following
                                        )
                                        console.log(res)
                                        setIsFollowing(false)
                                    } catch (e) {}
                                    // unfollow
                                } else if (!isFollowing) {
                                    if (!agent) return
                                    // follow
                                    try {
                                        const res = await agent.follow(
                                            profile.did
                                        )
                                        console.log(res)
                                        setIsFollowing(true)
                                    } catch (e) {
                                        console.log(e)
                                    }
                                }
                            }}
                        >
                            {isProfileMine
                                ? "Edit Profile"
                                : isFollowing
                                ? !onHoverButton
                                    ? "Following"
                                    : "Un Follow"
                                : "Follow"}
                        </Button>
                    </div>
                    <div className={ProfileDisplayName()}>
                        {!isSkeleton ? (
                            profile.displayName
                        ) : (
                            <Skeleton
                                className={`h-[24px] w-[180px] rounded-[10px] mt-[8px] ${color}`}
                            />
                        )}
                    </div>
                    <div
                        className={ProfileHandle({
                            isMobile: isMobile,
                        })}
                    >
                        {!isSkeleton ? (
                            `@${profile.handle}`
                        ) : (
                            <Skeleton
                                className={`h-[16px] w-[130px] rounded-[10px] mt-[10px] ${color}`}
                            />
                        )}
                    </div>
                    <div className={ProfileBio({ isMobile: isMobile })}>
                        {!isSkeleton ? (
                            renderTextWithLinks
                        ) : (
                            <>
                                <Skeleton
                                    className={`h-[16px] w-full rounded-[10px] ${color}`}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
