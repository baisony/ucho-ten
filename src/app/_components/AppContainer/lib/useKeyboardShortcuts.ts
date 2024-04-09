import { useEffect } from "react"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"

export const useKeyboardShortcuts = (
    router: AppRouterInstance,
    pathName: string,
    nextQueryParams: URLSearchParams,
    isMobile: boolean
) => {
    useEffect(() => {
        if (isMobile) {
            return
        }
        console.log("useKeyboardShortcuts")

        const handleKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement

            if (event.key === "Escape" && pathName === "/post") {
                event.preventDefault()
                router.back()
                return
            }
            if (!target) return
            if (
                target.tagName.toLowerCase() === "textarea" ||
                target.tagName.toLowerCase() === "input"
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
