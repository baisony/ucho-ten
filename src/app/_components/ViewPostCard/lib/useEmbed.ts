// useEmbed.ts
import { useMemo } from "react"
import {
    GeneratorView,
    PostView,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs"

import { ViewRecord } from "@atproto/api/dist/client/types/app/bsky/embed/record"
import { ListView } from "@atproto/api/dist/client/types/app/bsky/graph/defs"
import { View } from "@atproto/api/src/client/types/app/bsky/embed/images"
import { AppBskyEmbedRecordWithMedia } from "@atproto/api"
import { External } from "@atproto/api/src/client/types/app/bsky/embed/external"

interface Embed {
    $type: string
    record?: PostView | ViewRecord | GeneratorView | ListView | null
}

const useEmbed = (
    postJson: PostView | undefined,
    quoteJson: ViewRecord | undefined
) => {
    return useMemo(() => {
        const extractEmbedOfType = (type: string) => {
            const quoteEmbed =
                quoteJson?.embeds?.length && quoteJson?.embeds?.length > 0
                    ? quoteJson?.embeds[0]
                    : null
            const embed = quoteEmbed || postJson?.embed || null

            if (!embed || !embed.$type) return null

            if ((embed?.record as PostView)?.$type === type)
                return embed as Embed

            return embed.$type === type ? (embed as Embed) : null
        }

        return {
            embedImages: extractEmbedOfType(
                "app.bsky.embed.images#view"
            ) as View | null,
            embedMedia: extractEmbedOfType(
                "app.bsky.embed.recordWithMedia#view"
            ) as AppBskyEmbedRecordWithMedia.View | null,
            embedExternal: extractEmbedOfType(
                "app.bsky.embed.external#view"
            ) as External | null,
            embedRecord: extractEmbedOfType("app.bsky.embed.record#view"),
            embedRecordBlocked: extractEmbedOfType(
                "app.bsky.embed.record#viewBlocked"
            ),
            embedRecordViewRecord: extractEmbedOfType(
                "app.bsky.embed.record#view"
            )?.record as ViewRecord | null,
            embedFeed: extractEmbedOfType("app.bsky.feed.defs#generatorView")
                ?.record as GeneratorView | null,
            embedMuteList: extractEmbedOfType("app.bsky.graph.defs#listView")
                ?.record as ListView | null,
            notfoundEmbedRecord: extractEmbedOfType(
                "app.bsky.embed.record#viewNotFound"
            ),
        }
    }, [postJson, quoteJson])
}

export default useEmbed
