import { memo } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronUp } from "@fortawesome/free-solid-svg-icons"

/**
 * SetttingsModal props.
 */
export type ScrollToTopButtonProps = {
    scrollRef: any
    scrollIndex: number
}

/**
 * SetttingsModal component.
 */
export const ScrollToTopButton = memo((props: ScrollToTopButtonProps) => {
    const { scrollRef, scrollIndex } = props
    return (
        <div
            className={`absolute bottom-[20px] ml-[20px] h-[50px] w-[50px] rounded-full overflow-hidden bg-white dark:bg-[#16191F] shadow-md border-1 border-[#E8E8E8] dark:border-[#292929] flex items-center justify-center cursor-pointer ${scrollIndex >= 5 ? "block" : "hidden"}`}
            onClick={() => {
                scrollRef.current?.scrollTo({
                    top: 0,
                    behavior: "smooth",
                })
            }}
        >
            <FontAwesomeIcon icon={faChevronUp} />
        </div>
    )
})
