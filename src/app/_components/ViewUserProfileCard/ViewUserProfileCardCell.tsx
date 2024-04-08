import { ViewUserProfileCard } from "."
import { DummyHeader } from "@/app/_components/DummyHeader"
import { TFunction } from "i18next"
import { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs"

export interface ViewUserProfileCardCellProps {
    className?: string
    isMobile?: boolean
    isSkeleton?: boolean
    json: ProfileView | null
    isEmbedToModal?: boolean
    isDummyHeader?: boolean
    nextQueryParams: URLSearchParams
    t: TFunction
}

export const ViewUserProfileCardCell = (
    props: ViewUserProfileCardCellProps
) => {
    const { isDummyHeader } = props

    return isDummyHeader ? <DummyHeader /> : <ViewUserProfileCard {...props} />
}
