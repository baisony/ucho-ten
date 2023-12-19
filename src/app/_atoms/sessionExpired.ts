import { atom, useAtom } from "jotai"

const isSessionExpired = atom<boolean>(false)

export const useIsSessionExpired = () => useAtom(isSessionExpired)
