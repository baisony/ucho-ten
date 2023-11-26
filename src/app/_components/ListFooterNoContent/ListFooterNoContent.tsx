import { useTranslation } from "react-i18next"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const ListFooterNoContent = ({ context: { hasMore } }) => {
    const { t } = useTranslation()

    return (
        hasMore && (
            <div className="flex justify-center mt-4 mb-4">
                {t("text.noMoreContent")}
            </div>
        )
    )
}
