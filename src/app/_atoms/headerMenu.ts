import { atom, useAtom } from "jotai"
import { HEADER_MENUS, HeaderMenuType } from "../_constants/headerMenus"

export interface HeaderMenu {
    displayText: string
    info: string
}

// const headerMenus = atom<HeaderMenu[]>([])
// export const useHeaderMenusAtom = () => useAtom(headerMenus)

const menuIndexByHeader = atom<{ [k in HeaderMenuType]: number }>({
    home: 0,
    searchTop: 0,
    search: 0,
    inbox: 0,
    profile: 0,
    onlyPost: 0,
    settings: 0,
    bookmarks: 0,
    myFeeds: 0,
    list: 0,
    about: 0,
})

const headerMenusByHeader = atom<{ [k in HeaderMenuType]: HeaderMenu[] }>({
    home: HEADER_MENUS.home,
    searchTop: HEADER_MENUS.searchTop,
    search: HEADER_MENUS.search,
    inbox: HEADER_MENUS.inbox,
    profile: HEADER_MENUS.profile,
    onlyPost: HEADER_MENUS.onlyPost,
    settings: HEADER_MENUS.settings,
    bookmarks: HEADER_MENUS.bookmarks,
    myFeeds: HEADER_MENUS.myFeeds,
    list: HEADER_MENUS.list,
    about: HEADER_MENUS.about,
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
