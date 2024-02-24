import { HeaderMenu } from "@/app/_atoms/headerMenu"
import { GeneratorView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"

export const updateMenuWithFeedGenerators = (
    feeds: GeneratorView[],
    headerMenusByHeader: any, // 適切な型に置き換えてください
    setHeaderMenusByHeader: (headerMenus: any) => void // 適切な型に置き換えてください
) => {
    if (feeds.length === 0) {
        return
    }

    const newHeaderMenusByHeader = { ...headerMenusByHeader }
    const menus: HeaderMenu[] = feeds.map((feed) => {
        return {
            displayText: feed.displayName,
            info: feed.uri,
        }
    })

    const hoge = localStorage.getItem("zenMode")
    console.log(hoge)
    if (!hoge || hoge === "false") {
        console.log(hoge)
        menus.unshift({
            displayText: "Following",
            info: "following",
        })
    }

    newHeaderMenusByHeader.home = menus

    setHeaderMenusByHeader((prevHeaderMenus: any) => ({
        ...prevHeaderMenus,
        home: menus,
    }))
}
