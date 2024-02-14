"use client"
import { useAgent } from "@/app/_atoms/agent"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { layout } from "./styles"
import {
    Button,
    Modal,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Spinner,
    useDisclosure,
} from "@nextui-org/react"
import { AtUri } from "@atproto/api"
import { GeneratorView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { useNextQueryParamsAtom } from "../_atoms/nextQueryParams"
import { useCurrentMenuType, useMenuIndex } from "../_atoms/headerMenu"
import SwiperCore from "swiper/core"

import "swiper/css"
import "swiper/css/pagination"
import { useTranslation } from "react-i18next"

import {
    closestCenter,
    DndContext,
    DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { SortableItem } from "./SortableItem"
import { DummyHeader } from "@/app/_components/DummyHeader"

const PageClient = () => {
    const [currentMenuType, setCurrentMenuType] = useCurrentMenuType()
    const [menuIndex] = useMenuIndex()

    const swiperRef = useRef<SwiperCore | null>(null)

    useLayoutEffect(() => {
        setCurrentMenuType("myFeeds")
    }, [])

    useEffect(() => {
        if (
            currentMenuType === "myFeeds" &&
            swiperRef.current &&
            menuIndex !== swiperRef.current.activeIndex
        ) {
            swiperRef.current.slideTo(menuIndex)
        }
    }, [currentMenuType, menuIndex, swiperRef.current])

    return (
        <div style={{ display: "flex" }}>
            <MyFeedsPage />
        </div>
    )
}

export default PageClient

const MyFeedsPage = () => {
    const [agent] = useAgent()
    const { t } = useTranslation()
    const [nextQueryParams] = useNextQueryParamsAtom()
    const { background, FeedCard } = layout()
    const [userPreferences, setUserPreferences] = useState<any>(undefined)
    const [isFetching, setIsFetching] = useState<boolean>(false)
    const [savedFeeds, setSavedFeeds] = useState<GeneratorView[]>([])
    const [, setPinnedFeeds] = useState<GeneratorView[]>([])
    const [isLoading, setIsLoading] = useState<boolean | null>(null)
    const [selectedFeed, setSelectedFeed] = useState<GeneratorView | null>(null)
    const { isOpen, onOpen, onOpenChange } = useDisclosure()

    const fetchFeeds = async () => {
        if (!agent) {
            return
        }

        try {
            setIsFetching(true)
            const { feeds } = await agent.getPreferences()
            setUserPreferences(feeds)
            const saved = await agent.app.bsky.feed.getFeedGenerators({
                feeds: feeds.saved as string[],
            })
            const pinned = await agent.app.bsky.feed.getFeedGenerators({
                feeds: feeds.pinned as string[],
            })

            saved.data.feeds?.forEach((v: any) => {
                v.id = v.uri
            })
            console.log(saved.data.feeds)
            setSavedFeeds((saved.data as any).feeds || [])
            setPinnedFeeds((pinned.data as any).feeds || [])
            setIsFetching(false)
        } catch (e) {
            setIsFetching(false)
            console.error(e)
        }
    }
    const handleFeedDelete = async () => {
        if (!agent) {
            return
        }
        if (!selectedFeed) {
            return
        }

        try {
            setIsLoading(true)
            const res = await agent.removeSavedFeed(selectedFeed.uri)
            await fetchFeeds()
            setIsLoading(false)
            console.log(res)
        } catch (e) {
            setIsLoading(false)
            console.log(e)
        }
    }

    useEffect(() => {
        void fetchFeeds()
    }, [agent])

    const uriToURL = (uri: string) => {
        const transform_uri = new AtUri(uri)
        return `/profile/${transform_uri.hostname}/feed/${
            transform_uri.rkey
        }?${nextQueryParams.toString()}` as string
    }

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (!over) {
            return
        }

        if (active.id !== over.id) {
            const oldIndex = savedFeeds.findIndex((v) => v.id === active.id)
            const newIndex = savedFeeds.findIndex((v) => v.id === over.id)
            setSavedFeeds(arrayMove(savedFeeds, oldIndex, newIndex))
        }
    }

    console.log(savedFeeds)

    return (
        <div className={"h-full w-full z-[1]"}>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>
                                {t("pages.feeds.deleteFeed?")}
                                {`"${selectedFeed?.displayName}" ?`}
                            </ModalHeader>
                            <ModalFooter>
                                <Button
                                    color="danger"
                                    variant="light"
                                    onClick={onClose}
                                >
                                    {t("button.no")}
                                </Button>
                                <Button
                                    color="primary"
                                    onClick={async () => {
                                        await handleFeedDelete()
                                        onClose()
                                    }}
                                >
                                    {t("button.yes")}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
            <div className={"overflow-hidden overflow-y-auto"}>
                <DummyHeader />
                {savedFeeds.length === 0 && (
                    <div
                        className={`${background()} w-full h-full flex items-center justify-center`}
                    >
                        {isFetching ? (
                            <div>
                                <Spinner />
                            </div>
                        ) : (
                            !isFetching ?? (
                                <div className={`text-white dark:text-black`}>
                                    {/* FIXME: WTF is this? */}
                                    {t("pages.feeds.notFound")}
                                </div>
                            )
                        )}
                    </div>
                )}
                {savedFeeds.length !== 0 && (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={savedFeeds}
                            strategy={verticalListSortingStrategy}
                        >
                            <ul className={"p-1"}>
                                {savedFeeds.map((item) => (
                                    <SortableItem key={item.uri} item={item} />
                                ))}
                            </ul>
                        </SortableContext>
                    </DndContext>
                )}
            </div>
        </div>
    )
}
