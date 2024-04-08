// useEmojiClickHandler.ts

export const useEmojiClickHandler = (
    emoji: { native: string },
    isEmojiAdding: React.MutableRefObject<boolean>,
    textareaRef: React.RefObject<HTMLTextAreaElement>,
    setContentText: React.Dispatch<React.SetStateAction<string>>,
    currentCursorPosition: React.MutableRefObject<number>
) => {
    if (isEmojiAdding.current) {
        return
    }

    isEmojiAdding.current = true

    if (textareaRef.current) {
        setContentText((prevContentText) => {
            return `${prevContentText.slice(
                0,
                currentCursorPosition.current
            )}${emoji.native}${prevContentText.slice(
                currentCursorPosition.current
            )}`
        })

        currentCursorPosition.current += emoji.native.length
    } else {
        setContentText((prevContentText) => prevContentText + emoji.native)
    }

    isEmojiAdding.current = false
}
