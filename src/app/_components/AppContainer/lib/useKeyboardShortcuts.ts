import { useEffect } from "react"

export const useKeyboardShortcuts = (
    router: any,
    pathName: string,
    nextQueryParams: URLSearchParams,
    isMobile: boolean
) => {
    useEffect(() => {
        if (isMobile) {
            return
        }

        const handleKeyDown = (event: any) => {
            if (event.key === "Escape" && pathName === "/post") {
                event.preventDefault()
                router.back()
                return
            }

            if (
                event.target.tagName.toLowerCase() === "textarea" ||
                event.target.tagName.toLowerCase() === "input"
            ) {
                return
            }

            if (
                !event.ctrlKey &&
                !event.metaKey &&
                (event.key === "n" || event.key === "N") &&
                pathName !== "/post"
            ) {
                event.preventDefault()
                router.push(`/post?${nextQueryParams.toString()}`)
                return
            }
        }

        window.addEventListener("keydown", handleKeyDown)

        return () => {
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [router, pathName, nextQueryParams, isMobile])
}
