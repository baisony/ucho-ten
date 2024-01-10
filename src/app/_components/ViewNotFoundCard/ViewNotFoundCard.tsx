import { viewNotFoundCard } from "@/app/_components/ViewNotFoundCard/styles"
import { memo } from "react"

interface Props {
    className?: string
}

export const ViewNotFoundCard: React.FC<Props> = memo(() => {
    const { PostCard } = viewNotFoundCard()

    return (
        <main className={`${PostCard()} cursor-pointer`}>
            <div className={"w-full h-[50px] flex items-center ml-[20px]"}>
                Content not found
            </div>
        </main>
    )
})

export default ViewNotFoundCard
