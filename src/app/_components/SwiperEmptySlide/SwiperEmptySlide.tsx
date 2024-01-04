import React from "react"
import { useTranslation } from "react-i18next"

export const SwiperEmptySlide = () => {
    const { t } = useTranslation()
    return (
        <div className={"w-full h-full flex items-center justify-center"}>
            <div>{t("pages.swiperEmptySlide.text")}</div>
        </div>
    )
}

export default SwiperEmptySlide
