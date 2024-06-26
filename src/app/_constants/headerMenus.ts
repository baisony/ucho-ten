import { HeaderMenu } from "@/app/_atoms/headerMenu"

const defaultLoginPageMenus: HeaderMenu[] = [
    {
        displayText: "Login",
        info: "login",
    },
]

const defaultHomeMenus: HeaderMenu[] = []

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

const defaultUTabMenus: HeaderMenu[] = [
    {
        displayText: "U-feed",
        info: "at://did:plc:pwlfo4w6auzwihryxik32t6d/app.bsky.feed.generator/ufeed",
    },
    {
        displayText: "My Likes",
        info: "at://did:plc:vc7f4oafdgxsihk4cry2xpze/app.bsky.feed.generator/likes",
    },
    {
        displayText: "Random Bookmark",
        info: "random-bookmark",
    },
    {
        displayText: "Random Post",
        info: "at://did:plc:pwlfo4w6auzwihryxik32t6d/app.bsky.feed.generator/random",
    },
    {
        displayText: "Tutorial",
        info: "at://did:plc:metxzqysekddoeuepe7inggd/app.bsky.feed.generator/aaajpbgtmzqya",
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
        displayText: "Posts",
        info: "posts",
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
        displayText: "General",
        info: "general",
    },
    {
        displayText: "Content Filtering",
        info: "contentfiltering",
    },
    {
        displayText: "Mute",
        info: "mute",
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
]

const defaultListMenus: HeaderMenu[] = [
    {
        displayText: "List",
        info: "list",
    },
]

const defaultFeedMenus: HeaderMenu[] = [
    {
        displayText: "Feed",
        info: "feed",
    },
]

const defaultAboutMenus: HeaderMenu[] = [
    {
        displayText: "About",
        info: "about",
    },
]
const defaultNotFoundMenus: HeaderMenu[] = [
    {
        displayText: "NotFound",
        info: "notFound",
    },
]

export type HeaderMenuType =
    | "login"
    | "home"
    | "searchTop"
    | "search"
    | "utab"
    | "inbox"
    | "profile"
    | "onlyPost"
    | "settings"
    | "list"
    | "bookmarks"
    | "myFeeds"
    | "feed"
    | "about"
    | "notFound"

type HeaderMenus = { [k in HeaderMenuType]: HeaderMenu[] }

export const HEADER_MENUS: HeaderMenus = {
    login: defaultLoginPageMenus,
    home: defaultHomeMenus,
    searchTop: defaultSearchTopMenus,
    search: defaultSearchMenus,
    utab: defaultUTabMenus,
    inbox: defaultInboxMenus,
    profile: defaultProfileMenus,
    onlyPost: defaultOnlyPostMenus,
    settings: defaultSettingsMenus,
    bookmarks: defaultBookmarksMenus,
    myFeeds: defaultMyFeedsMenus,
    list: defaultListMenus,
    feed: defaultFeedMenus,
    about: defaultAboutMenus,
    notFound: defaultNotFoundMenus,
}
