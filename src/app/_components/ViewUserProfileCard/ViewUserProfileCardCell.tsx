import { ViewUserProfileCard } from "."
import { DummyHeader } from "@/app/_components/DummyHeader"

export interface ViewUserProfileCardCellProps {
    className?: string
    isMobile?: boolean
    isSkeleton?: boolean
    json: any
    isEmbedToModal?: boolean
    isDummyHeader?: boolean
    nextQueryParams: URLSearchParams
    t: any
}

export const ViewUserProfileCardCell = (
    props: ViewUserProfileCardCellProps
) => {
    const { isDummyHeader } = props

    return isDummyHeader ? <DummyHeader /> : <ViewUserProfileCard {...props} />
}
