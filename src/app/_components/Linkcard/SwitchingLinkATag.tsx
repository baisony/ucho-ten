import React from "react"
import Link from "next/link"

interface Props {
    children?: React.ReactNode
    link: string
}

export const SwitchingLinkATag: React.FC<Props> = (props: Props) => {
    const bskyLink = props.link.startsWith("https://bsky.app/")
    const url = new URL(props.link)
    return bskyLink ? (
        <Link
            href={url.pathname}
            onClick={(e) => e.stopPropagation()}
            className={"w-full"}
        >
            {props.children}
        </Link>
    ) : (
        <a
            href={props.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={"w-full"}
        >
            {props.children}
        </a>
    )
}
