import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"

const fontsize = atomWithStorage<1 | 2 | 3 | 4 | 5>("fontsize", 3)

export const useContentFontSize = () => useAtom(fontsize)
