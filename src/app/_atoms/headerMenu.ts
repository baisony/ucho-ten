import { atom, useAtom } from "jotai"

export interface HeaderMenu {
    displayText: string
    info: string
}

const headerMenus = atom<HeaderMenu[]>([])
export const useHeaderMenusAtom = () => useAtom(headerMenus)

export type HeaderMenuType =
    | "home"
    | "search"
    | "inbox"
    | "profile"
    | "onlyPost"
    | "settings"
    | "bookmarks"
    | "myFeed"

const menuIndexByHeader = atom<{ [key in HeaderMenuType]: number }>({
    home: 0,
    search: 0,
    inbox: 0,
    profile: 0,
    onlyPost: 0,
    settings: 0,
    bookmarks: 0,
    myFeed: 0,
})

// export const useMenuIndexByHeader = () => useAtom(menuIndexByHeader)

const currentMenuType = atom<HeaderMenuType>("home")
export const useCurrentMenuType = () => useAtom(currentMenuType)

export const menuIndexAtom = atom<number>((get) => {
    const currentType = get(currentMenuType)
    return get(menuIndexByHeader)[currentType]
})

export const setMenuIndexAtom = atom(null, (get, set, newMenuIndex) => {
    const currentType = get(currentMenuType)
    const currentIndex = get(menuIndexByHeader)
    const updatedIndex = { ...currentIndex, [currentType]: newMenuIndex }
    set(menuIndexByHeader, updatedIndex)
})

const menuIndexChangedByMenu = atom<boolean>(false)
export const useMenuIndexChangedByMenu = () => useAtom(menuIndexChangedByMenu)
