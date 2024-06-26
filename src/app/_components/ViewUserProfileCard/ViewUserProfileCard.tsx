import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import defaultIcon from "@/../public/images/icon/default_icon.svg"
import { viewUserProfileCardStyle } from "./styles"
import { Skeleton } from "@nextui-org/react"

import Link from "next/link"
import { TFunction } from "i18next"
import { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs"

interface Props {
    className?: string
    isMobile?: boolean
    isSkeleton?: boolean
    json: ProfileView | null
    isEmbedToModal?: boolean
    isDummyHeader?: boolean
    nextQueryParams: URLSearchParams
    t: TFunction
}

export const ViewUserProfileCard = (props: Props) => {
    const {
        // className,
        // uploadImageAvailable,
        // open,
        // numbersOfImage,
        isSkeleton,
        json,
        isEmbedToModal,
        nextQueryParams,
    } = props
    const router = useRouter()
    const {
        PostCard,
        PostAuthor,
        PostCardContainer,
        PostAuthorIcon,
        PostAuthorDisplayName,
        PostAuthorHandle,
        skeletonIcon,
        skeletonName,
        skeletonHandle,
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
                                            className={`${PostAuthorHandle()} md:hover:underline ml-[5px]`}
                                        >
                                            @{json?.handle}
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
