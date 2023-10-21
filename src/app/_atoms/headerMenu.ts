import { atom, useAtom } from "jotai"

export interface HeaderMenu {
    displayText: string
    info: string
}

const menuIndex = atom<number>(0)
export const useMenuIndexAtom = () => useAtom(menuIndex)

const menuIndexChangedByMenu = atom<boolean>(false)
export const useMenuIndexChangedByMenu = () => useAtom(menuIndexChangedByMenu)

const headerMenus = atom<HeaderMenu[]>([])
export const useHeaderMenusAtom = () => useAtom(headerMenus)
