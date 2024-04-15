// useTranslateContentText.ts
import { useCallback, useRef, useState } from "react"
import { translateText } from "@/app/_lib/post/translate"
import { useTranslationLanguage } from "@/app/_atoms/translationLanguage"
import { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"

const useTranslateContentText = (
    postJson: PostView | undefined, // postJson の型を適切に指定してください
    postView: PostView | null // postView の型を適切に指定してください
) => {
    const [translateTo] = useTranslationLanguage()
    const [viewTranslatedText, setViewTranslatedText] = useState(false)
    const [translatedJsonData, setTranslatedJsonData] =
        useState<PostView | null>(null)
    const isTranslated = useRef(false)

    const translateContentText = useCallback(async () => {
        isTranslated.current = true
        setViewTranslatedText(true)
        const res = await translateText(translateTo, postJson, postView)
        setTranslatedJsonData(res)
    }, [])

    return {
        viewTranslatedText,
        setViewTranslatedText,
        translatedJsonData,
        translateContentText,
    }
}

export default useTranslateContentText
