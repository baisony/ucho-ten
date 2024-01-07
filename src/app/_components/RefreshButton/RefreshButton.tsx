import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowsRotate } from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from "react-i18next"

interface RefreshButtonProps {
    handleRefresh: () => void
}

const RefreshButton = (props: RefreshButtonProps) => {
    const { t } = useTranslation()
    return (
        <div
            className={
                "absolute flex justify-center z-[10] left-16 right-16 md:top-[120px] top-[calc(100px+env(safe-area-inset-top))] lg:top-[70px]"
            }
        >
            <div
                className={
                    "text-white bg-blue-500/50 backdrop-blur-[15px] rounded-full cursor-pointer pl-[10px] pr-[10px] pt-[5px] pb-[5px] text-[14px]"
                }
                onClick={props.handleRefresh}
            >
                <FontAwesomeIcon icon={faArrowsRotate} /> {t("button.newPosts")}
            </div>
        </div>
    )
}

export default RefreshButton
