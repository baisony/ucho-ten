import { useMemo } from "react"

export const useShouldFillPageBackground = (
    pathName: string,
    searchParams: URLSearchParams
): boolean => {
    return useMemo(() => {
        if (pathName.startsWith("/login") || pathName === "/") {
            return false
        } else if (
            pathName.startsWith("/search") &&
            !searchParams.get("word")
        ) {
            return false
        } else return !pathName.startsWith("/post")
    }, [pathName, searchParams])
}
