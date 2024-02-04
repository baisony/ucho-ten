import { useTranslation } from "react-i18next"

const NOW = 5
const MINUTE = 60
const HOUR = MINUTE * 60

export function formattedSimpleDate(
    dateStr: string,
    now: Date = new Date(),
    useRelativeTime: boolean = true
): string {
    const { t } = useTranslation()
    const date = new Date(dateStr)
    const today = new Date()
    const ms = Number(date)
    const diffSeconds = Math.floor((Number(now) - ms) / 1000)

    if (useRelativeTime) {
        if (diffSeconds < NOW) {
            return `now`
        } else if (diffSeconds < MINUTE) {
            return `${diffSeconds}s`
        } else if (diffSeconds < HOUR) {
            return `${Math.floor(diffSeconds / MINUTE)}m`
        }
    }

    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()

    const hours = `${date.getHours()}`
    const zeroIfNeeded = date.getMinutes() < 10 ? "0" : ""
    const minutes = date.getMinutes()

    if (date.toDateString() === now.toDateString()) {
        return `${hours}:${zeroIfNeeded}${minutes}`
    }

    const twentyFourHoursAgo = new Date(now)
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

    if (date.toDateString() === twentyFourHoursAgo.toDateString()) {
        return `${t("components.ViewPostCard.Yesterday")} ${hours}:${zeroIfNeeded}${minutes}`
    }

    return `${year !== today.getFullYear() ? `${year}/` : ``}${month}/${day} ${hours}:${zeroIfNeeded}${minutes}`
}
