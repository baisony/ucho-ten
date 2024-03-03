// useLongPress.ts
import { useCallback, useRef, useEffect } from "react"

const useLongPress = (handleLongPress: () => void, duration: number = 500) => {
    const longPressTimerRef = useRef<number | null>(null)

    const handleTouchStart = useCallback(() => {
        longPressTimerRef.current = window.setTimeout(() => {
            handleLongPress()
        }, duration)

        const clearTimer = () => {
            if (longPressTimerRef.current !== null) {
                clearTimeout(longPressTimerRef.current)
                longPressTimerRef.current = null
            }
        }

        const handleTouchEnd = () => {
            clearTimer()
        }

        const handleTouchMove = () => {
            clearTimer()
        }

        const handleTouchCancel = () => {
            clearTimer()
        }

        const handleContextMenu = () => {
            clearTimer()
        }

        document.addEventListener("touchend", handleTouchEnd)
        document.addEventListener("touchmove", handleTouchMove)
        document.addEventListener("touchcancel", handleTouchCancel)
        document.addEventListener("contextmenu", handleContextMenu)

        return () => {
            // Clean up event listeners when the component unmounts
            document.removeEventListener("touchend", handleTouchEnd)
            document.removeEventListener("touchmove", handleTouchMove)
            document.removeEventListener("touchcancel", handleTouchCancel)
            document.removeEventListener("contextmenu", handleContextMenu)
            clearTimer()
        }
    }, [handleLongPress, duration])

    useEffect(() => {
        return () => {
            if (longPressTimerRef.current !== null) {
                clearTimeout(longPressTimerRef.current)
                longPressTimerRef.current = null
            }
        }
    }, [])

    return handleTouchStart
}

export default useLongPress
