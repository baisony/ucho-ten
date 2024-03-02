// useEmojiOpenChangeHandler.ts

export const useEmojiOpenChangeHandler = (
    isOpen: boolean,
    textareaRef: React.RefObject<HTMLTextAreaElement>,
    currentCursorPosition: React.MutableRefObject<number>
) => {
    if (isOpen) {
        currentCursorPosition.current = textareaRef.current?.selectionStart || 0
    } else {
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.setSelectionRange(
                    currentCursorPosition.current,
                    currentCursorPosition.current
                )
                textareaRef.current.focus()
            }
        }, 500)
    }
}
