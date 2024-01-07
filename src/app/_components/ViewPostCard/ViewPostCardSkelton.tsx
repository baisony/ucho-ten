import { viewPostCard } from "./styles"
import { Skeleton } from "@nextui-org/react"

export interface ViewPostCardSkeltonProps {
    isTop?: boolean
}

const ViewPostCardSkelton = ({ isTop }: ViewPostCardSkeltonProps) => {
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
                            <span className={PostAuthorIcon()}>
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
                    <div className={PostContent()}>
                        <div className="w-full flex flex-col gap-2">
                            <Skeleton className={skeletonText1line()} />
                            <Skeleton className={skeletonText2line()} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default ViewPostCardSkelton
