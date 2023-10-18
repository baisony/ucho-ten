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

const defaultOnlyPostMenus: HeaderMenu[] = [
    {
        displayText: "Author's",
        info: "Author's",
    },
    {
        displayText: "Other's",
        info: "Other's",
    },
]

const defaultSettingsMenus: HeaderMenu[] = [
    {
        displayText: "Settings",
        info: "Settings",
    },
    {
        displayText: "General",
        info: "General",
    },
    {
        displayText: "Content Filtering",
        info: "Content Filtering",
    },
]
const defaultBookmarksMenus: HeaderMenu[] = [
    {
        displayText: "Bookmark",
        info: "Bookmark",
    },
]
const defaultMytFeedMenus: HeaderMenu[] = [
    {
        displayText: "My Feeds",
        info: "My Feeds",
    },
    {
        displayText: "Search",
        info: "Search",
    },
]

interface AllOfHeaderMenus {
    home: HeaderMenu[]
    search: HeaderMenu[]
    inbox: HeaderMenu[]
    profile: HeaderMenu[]
    onlyPost: HeaderMenu[]
    settings: HeaderMenu[]
    bookmarks: HeaderMenu[]
    myFeed: HeaderMenu[]
}

const initialHeaderMenus: AllOfHeaderMenus = {
    home: defaultHomeMenus,
    search: defaultSearchMenus,
    inbox: defaultInboxMenus,
    profile: defaultProfileMenus,
    onlyPost: defaultOnlyPostMenus,
    settings: defaultSettingsMenus,
    bookmarks: defaultBookmarksMenus,
    myFeed: defaultMytFeedMenus,
}

const allOfHeaderMenus = atom<AllOfHeaderMenus>(initialHeaderMenus)
export const useAllOfHeaderMenusAtom = () => useAtom(allOfHeaderMenus)
