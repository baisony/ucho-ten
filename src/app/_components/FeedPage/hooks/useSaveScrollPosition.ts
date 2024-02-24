import { useCallback } from "react"

export const useSaveScrollPosition = (
    isActive: boolean,
    virtuosoRef: React.RefObject<any>, // 適切な型に置き換えてください
    pageName: string,
    feedKey: string,
    scrollPositions: any, // 適切な型に置き換えてください
    setScrollPositions: (positions: any) => void // 適切な型に置き換えてください
) => {
    const handleSaveScrollPosition = useCallback(() => {
        if (!isActive) return

        virtuosoRef?.current?.getState((state: any) => {
            if (
                state.scrollTop !==
                scrollPositions[`${pageName}-${feedKey}`]?.scrollTop
            ) {
                const updatedScrollPositions = { ...scrollPositions }
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

    return handleSaveScrollPosition
}
