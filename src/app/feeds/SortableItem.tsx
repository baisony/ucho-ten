import React, { FC } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GeneratorView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBars } from "@fortawesome/free-solid-svg-icons"

type Props = {
    item: GeneratorView
}

export const SortableItem: FC<Props> = ({ item }: Props) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: item.uri })

    const style = {
        border: "1px solid #ddd",
        padding: "0.5rem 1rem",
        marginBottom: "0.5rem",
        backgroundColor: "#fafafa",
        cursor: "move",
        listStyle: "none",
        transform: CSS.Transform.toString(transform),
        transition,
        display: "flex",
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            onClick={(e) => {
                console.log(e)
            }}
        >
            <div style={{ touchAction: "none" }} {...listeners}>
                <FontAwesomeIcon icon={faBars} />
            </div>
            <div className={"ml-[10px] text-black"}>{item.displayName}</div>
        </div>
    )
}
