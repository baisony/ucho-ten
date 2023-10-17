import { atom, useAtom } from "jotai"

import { HeaderMenu } from "@/app/_atoms/headerMenu"

const defaultHomeMenus: HeaderMenu[] = []
const defaultSearchMenus: HeaderMenu[] = [
    {
        displayText: "Search",
        info: "Search",
    },
    {
        displayText: "Posts",
        info: "Posts",
    },
    {
        displayText: "Users",
        info: "Users",
    },
    {
        displayText: "Feeds",
        info: "Feeds",
    },
]
const defaultInboxMenus: HeaderMenu[] = [
    {
        displayText: "Inbox",
        info: "Inbox",
    },
]
const defaultProfileMenus: HeaderMenu[] = [
    {
        displayText: "Profile",
        info: "Profile",
    },
    {
        displayText: "Replies",
        info: "Replies",
    },
    {
        displayText: "Media",
        info: "Media",
    },
]

interface AllOfHeaderMenus {
    home: HeaderMenu[]
    search: HeaderMenu[]
    inbox: HeaderMenu[]
}

const initialHeaderMenus: AllOfHeaderMenus = {
    home: defaultHomeMenus,
    search: defaultSearchMenus,
    inbox: defaultSearchMenus,
}

const allOfHeaderMenus = atom<AllOfHeaderMenus>(initialHeaderMenus)
export const useAllOfHeaderMenusAtom = () => useAtom(allOfHeaderMenus)
