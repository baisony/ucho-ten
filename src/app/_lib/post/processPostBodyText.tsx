import { viewPostCard } from "@/app/_components/ViewPostCard/styles"
import { AppBskyFeedPost } from "@atproto/api"
import { ViewRecord } from "@atproto/api/dist/client/types/app/bsky/embed/record"
import { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import {
    faCheckCircle,
    faCircleQuestion,
    faCircleXmark,
    faHashtag,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Chip, Tooltip } from "@nextui-org/react"
import Link from "next/link"

const deletehttp = (text: string) => {
    return text.replace(/^https?:\/\//, "")
}

const addParamsToUrl = (hashtag: string, nextQueryParams: URLSearchParams) => {
    const queryParams = new URLSearchParams(nextQueryParams)
    queryParams.set("word", `${hashtag.replace("#", "")}`)
    queryParams.set("target", "posts")
    return `/search?${queryParams.toString()}` as string
}

export const processPostBodyText = (
    nextQueryParams: URLSearchParams,
    postJson?: PostView | null,
    quoteJson?: ViewRecord | null
): React.ReactNode => {
    const { chip } = viewPostCard()
    const postJsonData: PostView | ViewRecord | null =
        quoteJson || postJson || null

    if (!postJsonData?.record && !quoteJson?.value) {
        return null
    }

    const record = (quoteJson?.value ||
        postJsonData?.record) as AppBskyFeedPost.Record

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    if (!record?.facets && record?.text) {
        return record.text.split("\n").map((line, i) => (
            <p key={i}>
                {line}
                <br />
            </p>
        ))
    }

    const { text, facets } = record
    const text_bytes = encoder.encode(text)
    const result: React.ReactNode[] = []

    let lastOffset = 0

    const addTextChunks = (textChunk: string, key: string) => (
        <span key={key}>
            {textChunk}
            <br />
        </span>
    )

    const addLink = (linkElement: React.ReactNode, key: string) => (
        <span key={key}>
            <Chip
                className={chip()}
                size={"sm"}
                variant="faded"
                color="primary"
            >
                {linkElement}
            </Chip>
        </span>
    )

    ;(facets || []).forEach((facet: any, index: number) => {
        const { byteStart, byteEnd } = facet.index
        const facetText = decoder.decode(text_bytes.slice(byteStart, byteEnd))

        // Add non-link text
        if (byteStart > lastOffset) {
            const nonLinkText = decoder.decode(
                text_bytes.slice(lastOffset, byteStart)
            )
            const textChunks = nonLinkText
                .split("\n")
                .map((line, i) => addTextChunks(line, `text-${byteStart}-${i}`))
            result.push(textChunks)
        }

        switch (facet.features[0].$type) {
            case "app.bsky.richtext.facet#mention":
                result.push(
                    <Link
                        key={`link-${index}-${byteStart}`}
                        className={"text-blue-500"}
                        onClick={(e) => {
                            e.stopPropagation()
                        }}
                        href={`/profile/${
                            facet.features[0].did
                        }?${nextQueryParams.toString()}`}
                    >
                        {facetText}
                    </Link>
                )
                break

            case "app.bsky.richtext.facet#link":
                result.push(
                    <span key={`link-${index}-${byteStart}`}>
                        <Chip
                            className={chip()}
                            size={"sm"}
                            startContent={
                                <Tooltip
                                    showArrow={true}
                                    color={"foreground"}
                                    content={
                                        deletehttp(facetText) ===
                                        deletehttp(facet.features[0].uri)
                                            ? "リンク偽装の心配はありません。" // TODO: i18n
                                            : facet.features[0].uri.includes(
                                                  facetText.replace("...", "")
                                              )
                                            ? "URL短縮の可能性があります。" // TODO: i18n
                                            : "リンク偽装の可能性があります。" // TODO: i18n
                                    }
                                >
                                    <FontAwesomeIcon
                                        icon={
                                            deletehttp(facetText) ===
                                            deletehttp(facet.features[0].uri)
                                                ? faCheckCircle
                                                : facet.features[0].uri.includes(
                                                      facetText.replace(
                                                          "...",
                                                          ""
                                                      )
                                                  )
                                                ? faCircleQuestion
                                                : faCircleXmark
                                        }
                                        className={"w-[14px] h-[14px]"}
                                    />
                                </Tooltip>
                            }
                            variant="faded"
                            color={
                                deletehttp(facetText) ===
                                deletehttp(facet.features[0].uri)
                                    ? "success"
                                    : facet.features[0].uri.includes(
                                          facetText.replace("...", "")
                                      )
                                    ? "default"
                                    : "danger"
                            }
                        >
                            {facet.features[0].uri.startsWith(
                                "https://bsky.app"
                            ) ? (
                                <Link
                                    key={`a-${index}-${byteStart}`}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                    }}
                                    href={
                                        facet.features[0].uri.replace(
                                            "https://bsky.app",
                                            `${location.protocol}//${window.location.host}`
                                        ) + `?${nextQueryParams.toString()}`
                                    }
                                >
                                    {facetText}
                                </Link>
                            ) : (
                                <a
                                    onClick={(e) => e.stopPropagation()}
                                    key={`a-${index}-${byteStart}`}
                                    href={facet.features[0].uri}
                                    target={"_blank"}
                                    rel={"noopener noreferrer"}
                                >
                                    {facetText}
                                </a>
                            )}
                        </Chip>
                    </span>
                )
                break

            case "app.bsky.richtext.facet#tag":
                result.push(
                    <span key={`link-${index}-${byteStart}`}>
                        <Chip
                            size={"sm"}
                            startContent={
                                <FontAwesomeIcon
                                    icon={faHashtag}
                                    className={"w-[13px] h-[13px]"}
                                />
                            }
                            variant="faded"
                            color="primary"
                        >
                            <Link
                                key={`a-${index}-${byteStart}`}
                                onClick={(e) => {
                                    e.stopPropagation()
                                }}
                                href={addParamsToUrl(
                                    facet.features[0].tag,
                                    nextQueryParams
                                )}
                            >
                                {facetText.replace("#", "")}
                            </Link>
                        </Chip>
                    </span>
                )
                break
        }
        lastOffset = byteEnd
    })

    if (lastOffset < text_bytes.length) {
        const nonLinkText = decoder.decode(text_bytes.slice(lastOffset))
        const textWithLineBreaks = nonLinkText
            .split("\n")
            .map((line, i) => addTextChunks(line, `div-${lastOffset}-${i}`))
        result.push(textWithLineBreaks)
    }

    return <>{result}</>
}
