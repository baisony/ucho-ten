import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"

const postLanguage = atomWithStorage<string[]>("postLanguage", [""])

export const usePostLanguage = () => useAtom(postLanguage)
