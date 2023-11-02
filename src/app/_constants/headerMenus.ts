import { HeaderMenu } from "@/app/_atoms/headerMenu"

const defaultHomeMenus: HeaderMenu[] = [
    {
        displayText: "Following",
        info: "following",
    },
]

const defaultSearchTopMenus: HeaderMenu[] = [
    {
        displayText: "Search",
        info: "search",
    },
]

const defaultSearchMenus: HeaderMenu[] = [
    {
        displayText: "Posts",
        info: "posts",
    },
    {
        displayText: "Users",
        info: "users",
    },
    {
        displayText: "Feeds",
        info: "feeds",
    },
]

const defaultInboxMenus: HeaderMenu[] = [
    {
        displayText: "Inbox",
        info: "inbox",
    },
]

const defaultProfileMenus: HeaderMenu[] = [
    {
        displayText: "Profile / Posts",
        info: "profile",
    },
    {
        displayText: "Replies",
        info: "replies",
    },
    {
        displayText: "Media",
        info: "media",
    },
    {
        displayText: "Feed",
        info: "media",
    },
]

const defaultOnlyPostMenus: HeaderMenu[] = [
    {
        displayText: "Author's",
        info: "authors",
    },
    {
        displayText: "Other's",
        info: "others",
    },
]

const defaultSettingsMenus: HeaderMenu[] = [
    {
        displayText: "Settings",
        info: "settings",
    },
    {
        displayText: "General",
        info: "general",
    },
    {
        displayText: "Content Filtering",
        info: "contentfiltering",
    },
]

const defaultBookmarksMenus: HeaderMenu[] = [
    {
        displayText: "Bookmark",
        info: "bookmark",
    },
]

const defaultMyFeedsMenus: HeaderMenu[] = [
    {
        displayText: "My Feeds",
        info: "myfeeds",
    },
    {
        displayText: "Search",
        info: "search",
    },
]

const defaultListMenus: HeaderMenu[] = [
    {
        displayText: "List",
        info: "list",
    },
]

const defaultAboutMenus: HeaderMenu[] = [
    {
        displayText: "About",
        info: "about",
    },
]

export type HeaderMenuType =
    | "home"
    | "searchTop"
    | "search"
    | "inbox"
    | "profile"
    | "onlyPost"
    | "settings"
    | "list"
    | "bookmarks"
    | "myFeeds"
    | "about"

type HeaderMenus = { [k in HeaderMenuType]: HeaderMenu[] }

export const HEADER_MENUS: HeaderMenus = {
    home: defaultHomeMenus,
    searchTop: defaultSearchTopMenus,
    search: defaultSearchMenus,
    inbox: defaultInboxMenus,
    profile: defaultProfileMenus,
    onlyPost: defaultOnlyPostMenus,
    settings: defaultSettingsMenus,
    bookmarks: defaultBookmarksMenus,
    myFeeds: defaultMyFeedsMenus,
    list: defaultListMenus,
    about: defaultAboutMenus,
}
