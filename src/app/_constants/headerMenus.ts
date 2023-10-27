import { HeaderMenu } from "@/app/_atoms/headerMenu"

const defaultHomeMenus: HeaderMenu[] = [
    {
        displayText: "Following",
        info: "following",
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
        displayText: "Profile",
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
const defaultMytFeedMenus: HeaderMenu[] = [
    {
        displayText: "My Feeds",
        info: "myfeeds",
    },
    {
        displayText: "Search",
        info: "search",
    },
]

interface HeaderMenus {
    home: HeaderMenu[]
    search: HeaderMenu[]
    inbox: HeaderMenu[]
    profile: HeaderMenu[]
    onlyPost: HeaderMenu[]
    settings: HeaderMenu[]
    bookmarks: HeaderMenu[]
    myFeed: HeaderMenu[]
}

export const HEADER_MENUS: HeaderMenus = {
    home: defaultHomeMenus,
    search: defaultSearchMenus,
    inbox: defaultInboxMenus,
    profile: defaultProfileMenus,
    onlyPost: defaultOnlyPostMenus,
    settings: defaultSettingsMenus,
    bookmarks: defaultBookmarksMenus,
    myFeed: defaultMytFeedMenus,
}
