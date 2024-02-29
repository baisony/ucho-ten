import React, { FC } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GeneratorView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBars } from "@fortawesome/free-solid-svg-icons"
import { AtUri } from "@atproto/api"
import { useRouter } from "next/navigation"

type Props = {
    item: GeneratorView
}

export const SortableItem: FC<Props> = ({ item }: Props) => {
    const router = useRouter()
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: item.uri })

    const AtURI = new AtUri(item.uri)
    const style = {
        border: "1px solid #ddd",
        padding: "0.5rem 1rem",
        marginBottom: "0.5rem",
        backgroundColor: "#fafafa",
        listStyle: "none",
        transform: CSS.Transform.toString(transform),
        transition,
        display: "flex",
    }
    console.log(AtURI)

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            onClick={(e) => {
                console.log(e)
                router.push(`/profile/${AtURI.host}/feed/${AtURI.rkey}`)
            }}
        >
            <div style={{ touchAction: "none" }} {...listeners}>
                <FontAwesomeIcon
                    icon={faBars}
                    className={"text-black cursor-move"}
                />
            </div>
            <div className={"ml-[10px] text-black"}>{item.displayName}</div>
        </div>
    )
}
