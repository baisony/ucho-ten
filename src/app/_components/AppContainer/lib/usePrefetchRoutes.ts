import { useEffect } from "react"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"

export const usePrefetchRoutes = (router: AppRouterInstance) => {
    useEffect(() => {
        router.prefetch("/search")
        router.prefetch("/u-tab")
        router.prefetch("/inbox")
        router.prefetch("/post")
    }, [router])
}
