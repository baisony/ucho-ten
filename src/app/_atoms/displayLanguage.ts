import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"

export type displayLanguageType = string[]

const displayLanguage = atomWithStorage<displayLanguageType>(
    "displayLanguage",
    ["en-US"]
)

export const useDisplayLanguage = () => useAtom(displayLanguage)
