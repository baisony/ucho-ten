import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"

const zenModeAtom = atomWithStorage<boolean | undefined>("zenMode", undefined)

export const useZenMode = () => useAtom(zenModeAtom)
