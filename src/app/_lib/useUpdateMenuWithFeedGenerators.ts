// menuUtils.ts
import { HeaderMenu } from "@/app/_atoms/headerMenu"
import { GeneratorView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"

export const useUpdateMenuWithFeedGenerators = (
    feeds: GeneratorView[],
    headerMenusByHeader: any, // 必要な型情報に基づいて適切な型をインポートするか、任意の型を使う
    setHeaderMenusByHeader: any // 必要な型情報に基づいて適切な型をインポートするか、任意の型を使う
) => {
    if (feeds.length === 0) {
        return
    }

    const menus: HeaderMenu[] = feeds.map((feed) => {
        return {
            displayText: feed.displayName,
            info: feed.uri,
        }
    })

    const zenMode = localStorage.getItem("zenMode")
    if (!zenMode || zenMode === "false") {
        menus.unshift({
            displayText: "Following",
            info: "following",
        })
    }

    headerMenusByHeader.home = menus
    setHeaderMenusByHeader((prevHeaderMenus: any) => ({
        ...prevHeaderMenus,
        home: menus,
    }))
}
