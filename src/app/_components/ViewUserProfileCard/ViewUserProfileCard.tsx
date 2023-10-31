import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs"
import { AppBskyEmbedImages, AppBskyEmbedRecordWithMedia } from "@atproto/api"
import { ViewImage } from "@atproto/api/dist/client/types/app/bsky/embed/images"
import defaultIcon from "@/../public/images/icon/default_icon.svg"
import { viewUserProfileCardStyle } from "./styles"
import "react-circular-progressbar/dist/styles.css"
import { ScrollShadow, Skeleton, useDisclosure } from "@nextui-org/react"
import { useAgent } from "@/app/_atoms/agent"

import "react-swipeable-list/dist/styles.css"
import { useUserPreferencesAtom } from "@/app/_atoms/preferences"
import Link from "next/link"

interface Props {
    className?: string
    isMobile?: boolean
    isSkeleton?: boolean
    json: any
    isEmbedToModal?: boolean
    isDummyHeader?: boolean
    nextQueryParams: URLSearchParams
    t: any
}

export const ViewUserProfileCard = (props: Props) => {
    const {
        // className,
        isMobile,
        // uploadImageAvailable,
        // open,
        // numbersOfImage,
        isSkeleton,
        json,
        isEmbedToModal,
        nextQueryParams,
        t,
    } = props

    const postView = useMemo((): ProfileView | null => {
        if (json) {
            return json
        } else {
            return null
        }
    }, [json])
    const [agent] = useAgent()
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
    } = viewUserProfileCardStyle()

    const [isDeleted, setIsDeleted] = useState<boolean>(false)

    useEffect(() => {
        if (!json?.viewer) {
            return
        }

        if (
            json.viewer?.blockedBy ||
            json.viewer?.muted ||
            json.viewer?.blocking
        ) {
            setIsDeleted(true)
        }
    }, [])

    return (
        !isDeleted && (
            <div>
                <main
                    className={`${PostCard({ isEmbedToModal })}`}
                    style={{
                        backgroundColor: isEmbedToModal ? "transparent" : "",
                    }}
                    onClick={(e) => {
                        e.stopPropagation()
                        if (isSkeleton) return
                        router.push(
                            `/profile/${json?.did}?${nextQueryParams.toString()}`
                        )
                    }}
                >
                    <div className={`${PostCardContainer({ isEmbedToModal })}`}>
                        <div
                            className={`${PostAuthor()} ${
                                isEmbedToModal ? `z-[2]` : `z-[0]`
                            }`}
                        >
                            <span className={"flex items-center"}>
                                <Link
                                    className={PostAuthorIcon({
                                        isEmbedToModal,
                                    })}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                    }}
                                    href={`/profile/${json?.did}?${nextQueryParams.toString()}`}
                                >
                                    {isSkeleton ? (
                                        <Skeleton className={skeletonIcon()} />
                                    ) : (
                                        <img
                                            src={
                                                json?.avatar || defaultIcon.src
                                            }
                                            //radius={"lg"}
                                            className={``}
                                            alt={json?.did}
                                        />
                                    )}
                                </Link>
                                <Link
                                    onClick={(e) => {
                                        e.stopPropagation()
                                    }}
                                    href={`/profile/${json?.did}?${nextQueryParams.toString()}`}
                                >
                                    {isSkeleton ? (
                                        <Skeleton className={skeletonName()} />
                                    ) : (
                                        <span
                                            className={`${PostAuthorDisplayName()} md:hover:underline`}
                                            style={{ fontSize: "13px" }}
                                        >
                                            {json?.displayName}
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
                                    href={`/profile/${json?.did}?${nextQueryParams.toString()}`}
                                >
                                    {isSkeleton ? (
                                        <Skeleton
                                            className={skeletonHandle()}
                                        />
                                    ) : (
                                        <span
                                            className={`${PostAuthorHandle()} md:hover:underline`}
                                        >
                                            {json?.handle}
                                        </span>
                                    )}
                                </Link>
                            </span>
                        </div>
                    </div>
                </main>
            </div>
        )
    )
}

export default ViewUserProfileCard
