import { useCallback } from "react"
import { VirtuosoHandle } from "react-virtuoso"
import { ScrollPosition } from "@/app/_atoms/scrollPosition"

export const useSaveScrollPosition = (
    isActive: boolean,
    virtuosoRef: React.RefObject<VirtuosoHandle | null>, // 適切な型に置き換えてください
    pageName: string,
    feedKey: string,
    scrollPositions: ScrollPosition, // 適切な型に置き換えてください
    setScrollPositions: (positions: ScrollPosition) => void // 適切な型に置き換えてください
) => {
    return useCallback(() => {
        if (!isActive) return

        virtuosoRef?.current?.getState((state) => {
            if (
                state.scrollTop !==
                scrollPositions[`${pageName}-${feedKey}`]?.scrollTop
            ) {
                const updatedScrollPositions = { ...scrollPositions }
                updatedScrollPositions[`${pageName}-${feedKey}`] = state
                setScrollPositions(updatedScrollPositions)
            }
        })
    }, [])
}
