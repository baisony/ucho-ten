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
import { GeneratorView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import {
    useCurrentMenuType,
    useHeaderMenusByHeaderAtom,
    useMenuIndex,
} from "@/app/_atoms/headerMenu"
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
import { useFeedGeneratorsAtom } from "@/app/_atoms/feedGenerators"
import { useUpdateMenuWithFeedGenerators } from "@/app/_lib/useUpdateMenuWithFeedGenerators"

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
        <div className={"h-full"}>
            <MyFeedsPage />
        </div>
    )
}

export default PageClient

const MyFeedsPage = () => {
    const [agent] = useAgent()
    const { t } = useTranslation()
    const { background } = layout()
    const [isFetching, setIsFetching] = useState<boolean>(false)
    const [savedFeeds, setSavedFeeds] = useState<GeneratorView[]>([])
    const [pinnedFeeds, setPinnedFeeds] = useState<GeneratorView[]>([])
    const [onlySavedFeeds, setOnlySavedFeeds] = useState<
        GeneratorView[] | undefined
    >([])
    const [isLoading, setIsLoading] = useState<boolean | null>(null)
    const [selectedFeed] = useState<GeneratorView | null>(null)
    const { isOpen, onOpenChange } = useDisclosure()
    const [, setFeedGenerators] = useFeedGeneratorsAtom()
    const [headerMenusByHeader, setHeaderMenusByHeader] =
        useHeaderMenusByHeaderAtom()

    const fetchFeeds = async () => {
        if (!agent) {
            return
        }

        try {
            setIsFetching(true)
            const { feeds } = await agent.getPreferences()
            const saved = await agent.app.bsky.feed.getFeedGenerators({
                feeds: feeds.saved as string[],
            })
            const pinned = await agent.app.bsky.feed.getFeedGenerators({
                feeds: feeds.pinned as string[],
            })

            saved.data.feeds?.forEach((v) => {
                v.id = v.uri
            })
            console.log(saved.data.feeds)
            setSavedFeeds(saved.data.feeds || [])
            setPinnedFeeds(
                pinned.data.feeds.map((feed) => ({
                    ...feed,
                    id: feed.uri,
                }))
            )
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

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragEnd = async (event: DragEndEvent) => {
        if (!agent) return
        const { active, over } = event

        if (!over) {
            return
        }

        if (active.id !== over.id) {
            const oldIndex = pinnedFeeds.findIndex((v) => v.id === active.id)
            const newIndex = pinnedFeeds.findIndex((v) => v.id === over.id)
            setPinnedFeeds(arrayMove(pinnedFeeds, oldIndex, newIndex))
            await agent.setSavedFeeds(
                savedFeeds.map((v) => v.uri),
                arrayMove(pinnedFeeds, oldIndex, newIndex).map((v) => v.uri)
            )
            await handleUpdateMenuWithFeedGenerators()
        }
    }

    function isUriMatch(
        feedItem: GeneratorView[],
        uriToCheck: string
    ): boolean {
        return feedItem.some((item) => item.uri === uriToCheck)
    }

    const handleUpdateMenuWithFeedGenerators = async () => {
        if (!agent) return

        const data = await agent.getPreferences()
        if (!data?.feeds?.pinned) return
        const { data: feedsData } = await agent.app.bsky.feed.getFeedGenerators(
            {
                feeds: data.feeds.pinned,
            }
        )
        const feeds = feedsData.feeds
        useUpdateMenuWithFeedGenerators(
            feeds,
            headerMenusByHeader,
            setHeaderMenusByHeader
        )
    }

    useEffect(() => {
        const findDifference = () => {
            if (savedFeeds.length === 0) return
            // 現在のビューの uri をセットに格納
            const currentSet = new Set(pinnedFeeds.map((view) => view.uri))

            const addedViews: GeneratorView[] = []

            // 現在のビューをループ
            for (const current of savedFeeds) {
                // 現在のビューの uri が前回のビューのセットに含まれていない場合は追加されたビューとして追加
                if (!currentSet.has(current.uri)) {
                    addedViews.push(current)
                }
            }
            return addedViews
        }

        setOnlySavedFeeds(findDifference())
    }, [savedFeeds])

    const handlePinnedClick = async (
        pinnedStats: boolean,
        feed: GeneratorView
    ) => {
        if (!agent || isLoading) return
        try {
            if (pinnedStats) {
                await agent.removePinnedFeed(feed.uri)
                setPinnedFeeds(pinnedFeeds.filter((v) => v.uri !== feed.uri))
                setSavedFeeds([...savedFeeds, feed])
            } else {
                await agent.addPinnedFeed(feed.uri)
                setPinnedFeeds([...pinnedFeeds, feed])
                setSavedFeeds(savedFeeds.filter((v) => v.uri !== feed.uri))
            }
            await handleUpdateMenuWithFeedGenerators()
        } finally {
            setIsLoading(false)
        }
    }

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
            <div className={"overflow-y-auto h-full w-full"}>
                <DummyHeader />
                {pinnedFeeds.length === 0 && (
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
                {pinnedFeeds.length !== 0 && (
                    <>
                        <div className={"ml-[3px]"}>Pinned Feeds</div>
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                //@ts-ignore 仕方なくts-ignoreします
                                items={pinnedFeeds}
                                strategy={verticalListSortingStrategy}
                            >
                                <ul className={"p-1"}>
                                    {pinnedFeeds.map((item) => (
                                        <SortableItem
                                            key={item.uri}
                                            item={item}
                                            agent={agent}
                                            draggable={true}
                                            isPinned={isUriMatch(
                                                pinnedFeeds,
                                                item.uri
                                            )}
                                            setFeedGenerators={
                                                setFeedGenerators
                                            }
                                            handlePinnedClick={
                                                handlePinnedClick
                                            }
                                        />
                                    ))}
                                </ul>
                            </SortableContext>
                        </DndContext>
                    </>
                )}
                {onlySavedFeeds?.length !== 0 && (
                    <>
                        <div>Saved Feeds</div>
                        <ul className={"p-1"}>
                            {onlySavedFeeds?.map((item) => (
                                <SortableItem
                                    key={item.uri}
                                    item={item}
                                    agent={agent}
                                    isPinned={false}
                                    setFeedGenerators={setFeedGenerators}
                                    handlePinnedClick={handlePinnedClick}
                                    draggable={false}
                                />
                            ))}
                        </ul>
                    </>
                )}
            </div>
        </div>
    )
}
