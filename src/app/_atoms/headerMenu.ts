import { atom, useAtom } from "jotai"
import { HEADER_MENUS, HeaderMenuType } from "../_constants/headerMenus"

export interface HeaderMenu {
    displayText: string
    info: string
}

const menuIndexByHeader = atom<{ [k in HeaderMenuType]: number }>({
    login: 0,
    home: 0,
    searchTop: 0,
    search: 0,
    utab: 0,
    inbox: 0,
    profile: 0,
    onlyPost: 0,
    settings: 0,
    bookmarks: 0,
    myFeeds: 0,
    list: 0,
    feed: 0,
    about: 0,
    notFound: 0,
})

const headerMenusByHeader = atom<{ [k in HeaderMenuType]: HeaderMenu[] }>({
    login: HEADER_MENUS.login,
    home: HEADER_MENUS.home,
    searchTop: HEADER_MENUS.searchTop,
    search: HEADER_MENUS.search,
    utab: HEADER_MENUS.utab,
    inbox: HEADER_MENUS.inbox,
    profile: HEADER_MENUS.profile,
    onlyPost: HEADER_MENUS.onlyPost,
    settings: HEADER_MENUS.settings,
    bookmarks: HEADER_MENUS.bookmarks,
    myFeeds: HEADER_MENUS.myFeeds,
    list: HEADER_MENUS.list,
    feed: HEADER_MENUS.feed,
    about: HEADER_MENUS.about,
    notFound: HEADER_MENUS.notFound,
})

export const useHeaderMenusByHeaderAtom = () => useAtom(headerMenusByHeader)

const currentMenuType = atom<HeaderMenuType>("home")
export const useCurrentMenuType = () => useAtom(currentMenuType)

export const menuIndexAtom = atom(
    (get) => {
        const currentType = get(currentMenuType)
        return get(menuIndexByHeader)[currentType]
    },
    (get, set, newMenuIndex) => {
        const currentType = get(currentMenuType)
        const currentIndex = get(menuIndexByHeader)
        const updatedIndex = { ...currentIndex, [currentType]: newMenuIndex }
        return set(menuIndexByHeader, updatedIndex)
    }
)

export const useMenuIndex = () => useAtom(menuIndexAtom)

const menuIndexChangedByMenu = atom<boolean>(false)
export const useMenuIndexChangedByMenu = () => useAtom(menuIndexChangedByMenu)
