import React, { FC, useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GeneratorView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBars, faGear } from "@fortawesome/free-solid-svg-icons"
import { AtUri, BskyAgent } from "@atproto/api"
import { useRouter } from "next/navigation"
import defaultFeedIcon from "@/../public/images/icon/default_feed_icon.svg"
import { faThumbtack } from "@fortawesome/free-solid-svg-icons/faThumbtack"
import { Button, Spinner } from "@nextui-org/react"

type Props = {
    item: GeneratorView
    isPinned: boolean
    agent: BskyAgent | null
    setFeedGenerators: (data: GeneratorView[]) => void
    draggable: boolean
    handlePinnedClick: (pinnedStats: boolean, feed: GeneratorView) => void
}

export const SortableItem: FC<Props> = ({
    item,
    isPinned,
    agent,
    setFeedGenerators,
    draggable,
    handlePinnedClick,
}: Props) => {
    const router = useRouter()
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: item.uri })
    const [isPinnedState, setIsPinnedState] = useState(isPinned)
    const [loading, setLoading] = useState(false)

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
    //console.log(AtURI)
    //console.log(item)

    const handlePinned = async (pinnedStats: boolean) => {
        if (!agent || loading) return
        try {
            setLoading(true)
            if (pinnedStats) {
                await agent.removePinnedFeed(item.uri)
            } else if (!pinnedStats) {
                await agent.addPinnedFeed(item.uri)
            }
            handlePinnedClick(pinnedStats, item)
            setIsPinnedState(!pinnedStats)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            onClick={(e) => {
                console.log(e)
                router.push(`/profile/${AtURI.host}/feed/${AtURI.rkey}`)
            }}
            className={"items-center justify-between"}
        >
            <div className={"flex items-center"}>
                <div
                    style={{ touchAction: "none" }}
                    {...listeners}
                    className={"items-center"}
                >
                    <FontAwesomeIcon
                        icon={faBars}
                        className={`text-black cursor-move ${!draggable && `invisible`}`}
                    />
                </div>
                <div className={"ml-[10px] text-black flex items-center"}>
                    <img
                        src={item?.avatar ?? defaultFeedIcon.src}
                        alt={item.displayName}
                        className={
                            "h-[40px] w-[40px] object-cover hover:cursor-pointer rounded-full overflow-hidden"
                        }
                    />
                    <div className={"ml-[10px] truncate"}>
                        {item.displayName}
                    </div>
                </div>
            </div>
            <div className={"flex items-center"}>
                <Button
                    isIconOnly
                    variant={"light"}
                    onClick={() => handlePinned(isPinnedState)}
                >
                    {!loading && (
                        <FontAwesomeIcon
                            icon={faThumbtack}
                            className={`h-[18px] ${isPinnedState ? "text-blue-700" : "text-gray-500"}`}
                        />
                    )}
                    {loading && <Spinner size={"sm"} />}
                </Button>
                <Button isIconOnly variant={"light"}>
                    <FontAwesomeIcon
                        icon={faGear}
                        className={"text-gray-500 h-[18px]"}
                    />
                </Button>
            </div>
        </div>
    )
}
