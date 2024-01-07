import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"

const hideRepost = atomWithStorage<boolean>("hideRepost", false)

export const useHideRepost = () => useAtom(hideRepost)
