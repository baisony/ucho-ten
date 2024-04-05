import { useCallback } from "react"
import { VirtuosoHandle } from "react-virtuoso"
import { ScrollPosition } from "@/app/_atoms/scrollPosition"

export const useSaveScrollPosition = (
    isActive: boolean,
    virtuosoRef: React.RefObject<VirtuosoHandle | null>, // 適切な型に置き換えてください
    pageName: string,
    feedKey: string,
    scrollPositions: ScrollPosition[], // 適切な型に置き換えてください
    setScrollPositions: (positions: any) => void // 適切な型に置き換えてください
) => {
    return useCallback(() => {
        if (!isActive) return

        virtuosoRef?.current?.getState((state: any) => {
            if (
                state.scrollTop !==
                //@ts-ignore
                scrollPositions[`${pageName}-${feedKey}`]?.scrollTop
            ) {
                const updatedScrollPositions = { ...scrollPositions }
                //@ts-ignore
                updatedScrollPositions[`${pageName}-${feedKey}`] = state
                setScrollPositions(updatedScrollPositions)
            }
        })
    }, [
        isActive,
        virtuosoRef,
        pageName,
        feedKey,
        scrollPositions,
        setScrollPositions,
    ])
}
