import { memo } from "react"

interface ViewFillPageBackgroundProps {
    isSearchScreen?: boolean
}

export const ViewFillPageBackground = memo(
    (props: ViewFillPageBackgroundProps) => {
        return (
            <div className="absolute top-[env(safe-area-inset-top)] left-0 flex justify-center w-full h-full lg:hidden">
                <div
                    className={`bg-white dark:bg-[#16191F] w-full max-w-[600px] ${
                        props.isSearchScreen ? `lg:mt-[100px]` : `lg:mt-[50px]`
                    } md:mt-[100px] mt-[85px] lg:h-[calc(100%-50px)] md:h-[calc(100%-100px)] h-[calc(100%-85px)]`}
                />
            </div>
        )
    }
)

export default ViewFillPageBackground
