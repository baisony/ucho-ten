import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"

const fontsize = atomWithStorage<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10>(
    "fontsize",
    3
)

export const useContentFontSize = () => useAtom(fontsize)
