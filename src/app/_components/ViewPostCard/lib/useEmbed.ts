// useEmbed.ts
import { useMemo } from "react"
import {
    GeneratorView,
    PostView,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs"

import { ViewRecord } from "@atproto/api/dist/client/types/app/bsky/embed/record"
import { ListView } from "@atproto/api/dist/client/types/app/bsky/graph/defs"

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
            embedImages: extractEmbedOfType("app.bsky.embed.images#view"),
            embedMedia: extractEmbedOfType(
                "app.bsky.embed.recordWithMedia#view"
            ),
            embedExternal: extractEmbedOfType("app.bsky.embed.external#view"),
            embedRecord: extractEmbedOfType("app.bsky.embed.record#view"),
            embedRecordBlocked: extractEmbedOfType(
                "app.bsky.embed.record#viewBlocked"
            ),
            embedRecordViewRecord: extractEmbedOfType(
                "app.bsky.embed.record#view"
            )?.record as ViewRecord,
            embedFeed: extractEmbedOfType("app.bsky.feed.defs#generatorView")
                ?.record as GeneratorView,
            embedMuteList: extractEmbedOfType("app.bsky.graph.defs#listView")
                ?.record as ListView,
            notfoundEmbedRecord: extractEmbedOfType(
                "app.bsky.embed.record#viewNotFound"
            ),
        }
    }, [postJson, quoteJson])
}

export default useEmbed
