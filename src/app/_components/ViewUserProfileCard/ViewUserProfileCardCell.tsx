import { ViewUserProfileCard } from "."
import { HEADER_HEIGHT, MOBILE_HEADER_HEIGHT } from "@/app/_constants/styles"
import React from "react"

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
        <div
            className={`md:h-[${HEADER_HEIGHT}px] h-[${MOBILE_HEADER_HEIGHT}px]`}
        />
    ) : (
        <ViewUserProfileCard {...props} />
    )
}
