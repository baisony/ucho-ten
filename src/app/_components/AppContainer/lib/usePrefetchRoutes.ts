import { useEffect } from "react"

export const usePrefetchRoutes = (router: any) => {
    useEffect(() => {
        router.prefetch("/")
        router.prefetch("/home")
        router.prefetch("/login")
        router.prefetch("/search")
        router.prefetch("/u-tab")
        router.prefetch("/inbox")
        router.prefetch("/post")
        router.prefetch("/settings")
        router.prefetch("/bookmarks")
        router.prefetch("/feeds")
    }, [router])
}
