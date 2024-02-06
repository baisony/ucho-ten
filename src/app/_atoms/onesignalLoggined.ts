import { atom, useAtom } from "jotai"

const oneSignalLogin = atom<boolean>(false)

export const useOneSignalLogin = () => useAtom(oneSignalLogin)
