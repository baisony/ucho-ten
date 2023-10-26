import { atom, useAtom } from "jotai"
import { HEADER_MENUS } from "../_constants/headerMenus"

export interface HeaderMenu {
    displayText: string
    info: string
}

// const headerMenus = atom<HeaderMenu[]>([])
// export const useHeaderMenusAtom = () => useAtom(headerMenus)

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

const headerMenusByHeader = atom<{ [key in HeaderMenuType]: HeaderMenu[] }>({
    home: HEADER_MENUS.home,
    search: HEADER_MENUS.search,
    inbox: HEADER_MENUS.inbox,
    profile: HEADER_MENUS.onlyPost,
    onlyPost: HEADER_MENUS.onlyPost,
    settings: HEADER_MENUS.settings,
    bookmarks: HEADER_MENUS.bookmarks,
    myFeed: HEADER_MENUS.myFeed,
})

export const useHeaderMenusByHeaderAtom = () => useAtom(headerMenusByHeader)

// export const headerMenusByHeaderAtom = atom<HeaderMenu[]>((get) => {
//     const currentHeaderMenusByHeader = get(headerMenusByHeader);
//     const currentType = get(currentMenuType)
//     return currentHeaderMenusByHeader[currentType]
// })

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
