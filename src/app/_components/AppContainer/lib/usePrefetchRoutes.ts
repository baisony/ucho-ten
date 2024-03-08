import { useEffect } from "react"

export const usePrefetchRoutes = (router: any) => {
    useEffect(() => {
        router.prefetch("/search")
        router.prefetch("/u-tab")
        router.prefetch("/inbox")
        router.prefetch("/post")
        router.prefetch("/settings")
        router.prefetch("/feeds")
    }, [router])
}
