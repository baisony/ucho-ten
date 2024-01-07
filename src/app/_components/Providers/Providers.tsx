"use client"

import { NextUIProvider } from "@nextui-org/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactNode, useState } from "react"
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental"

export function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        retry: false,
                        refetchOnWindowFocus: false,
                    },
                },
            })
    )
    return (
        <NextUIProvider>
            <QueryClientProvider client={queryClient}>
                <ReactQueryStreamedHydration>
                    {children}
                </ReactQueryStreamedHydration>
            </QueryClientProvider>
        </NextUIProvider>
    )
}
