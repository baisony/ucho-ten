import { ViewUserProfileCard } from "."

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

    return isDummyHeader ? (
        <div className={"md:h-[100px] h-[85px]"} />
    ) : (
        <ViewUserProfileCard {...props} />
    )
}
