import { atom, useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"

export type translationLanguageType = string[]

const translationLanguage = atomWithStorage<translationLanguageType>(
    "translationLanguage",
    ["en-US"]
)

export const useTranslationLanguage = () => useAtom(translationLanguage)
