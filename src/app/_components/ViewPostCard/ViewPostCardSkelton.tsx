import { viewPostCard } from "./styles"
import { Skeleton } from "@nextui-org/react"
import { memo } from "react"
import { useZenMode } from "@/app/_atoms/zenMode"

export const ViewPostCardSkelton = memo(() => {
    const [zenMode] = useZenMode()
    const getRandomNumber = () => Math.floor(Math.random() * 2)
    const {
        PostCard,
        PostAuthor,
        PostContent,
        PostCardContainer,
        PostAuthorIcon,
        skeletonIcon,
        skeletonName,
        skeletonHandle,
        skeletonText1line,
        skeletonText2line,
    } = viewPostCard()

    return (
        <div>
            <main className={PostCard()}>
                <div className={PostCardContainer()}>
                    <div className={PostAuthor()}>
                        <span className={"flex items-center"}>
                            <span
                                className={PostAuthorIcon({
                                    zenMode: zenMode,
                                })}
                            >
                                <Skeleton className={skeletonIcon()} />
                            </span>
                            <span>
                                <Skeleton className={skeletonName()} />
                            </span>
                            <span>
                                <Skeleton className={skeletonHandle()} />
                            </span>
                        </span>
                    </div>
                    <div className={PostContent({ zenMode: zenMode })}>
                        <div className="w-full flex flex-col gap-2">
                            <Skeleton className={skeletonText1line()} />
                            <Skeleton className={skeletonText2line()} />
                            {getRandomNumber() === 0 && (
                                <Skeleton
                                    className={
                                        "w-full max-w-[350px] h-[300px] rounded-[10px] overflow-hidden"
                                    }
                                />
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
})

export default ViewPostCardSkelton
