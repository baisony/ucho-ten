import { atom, useAtom } from "jotai"

const unreadNotificationAtom = atom<number>(0)
export const useUnreadNotificationAtom = () => useAtom(unreadNotificationAtom)
