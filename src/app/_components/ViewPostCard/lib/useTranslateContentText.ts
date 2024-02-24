// useTranslateContentText.ts
import { useState, useRef } from "react"
import { translateText } from "@/app/_lib/post/translate"
import { useTranslationLanguage } from "@/app/_atoms/translationLanguage"

const useTranslateContentText = (
    postJson: any, // postJson の型を適切に指定してください
    postView: any // postView の型を適切に指定してください
) => {
    const [translateTo] = useTranslationLanguage()
    const [viewTranslatedText, setViewTranslatedText] = useState(false)
    const [translatedJsonData, setTranslatedJsonData] = useState<any>(null)
    const isTranslated = useRef(false)

    const translateContentText = async () => {
        isTranslated.current = true
        setViewTranslatedText(true)
        const res = await translateText(translateTo, postJson, postView)
        setTranslatedJsonData(res)
    }

    return {
        viewTranslatedText,
        setViewTranslatedText,
        translatedJsonData,
        translateContentText,
    }
}

export default useTranslateContentText
