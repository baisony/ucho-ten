"use client"
import { useEffect, useState } from "react"

import {
    Accordion,
    AccordionItem,
    Button,
    Dropdown,
    DropdownMenu,
    DropdownTrigger,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Radio,
    RadioGroup,
    Select,
    SelectItem,
    SelectSection,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    useDisclosure,
} from "@nextui-org/react"
import { viewMutewordsPage } from "@/app/settings/mute/words/styles"
import "react-swipeable-list/dist/styles.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronRight } from "@fortawesome/free-solid-svg-icons"
import { useAppearanceColor } from "@/app/_atoms/appearanceColor"
import { MuteWord, useWordMutes } from "@/app/_atoms/wordMute"

export default function Root() {
    const [appearanceColor] = useAppearanceColor()
    const [muteWords, setMuteWords] = useWordMutes()
    const [darkMode, setDarkMode] = useState(false)
    const color = darkMode ? "dark" : "light"
    const { background, accordion, button, modal } = viewMutewordsPage()
    const { isOpen, onOpen, onOpenChange } = useDisclosure()
    const [muteText, setMuteText] = useState<string>("")
    const [selectedMuteWord, setSelectedMuteWord] = useState<MuteWord | null>()
    const [newCategoryName, setNewCategoryName] = useState<string>("")

    function groupMuteWordsByCategory(muteWords: MuteWord[]) {
        const categories: { [key: string]: MuteWord[] } = {} // Type annotation added

        for (const muteWord of muteWords) {
            const category =
                muteWord.category !== null ? muteWord.category : "null" // Convert null to "null"
            if (!categories[category]) {
                categories[category] = []
            }
            categories[category].push(muteWord)
        }

        return categories
    }

    // Usage:
    const categorizedMuteWords = groupMuteWordsByCategory(muteWords)

    const modeMe = (e: any) => {
        setDarkMode(!!e.matches)
    }

    const onSave = () => {
        if (selectedMuteWord) {
            const updatedMuteWords = muteWords.map((muteWord) => {
                if (muteWord.word === selectedMuteWord.word) {
                    return selectedMuteWord // 一致する要素を上書き
                } else {
                    return muteWord
                }
            })
            setMuteWords(updatedMuteWords)
        }
        // モーダルを閉じるなどの処理をここに追加
    }

    const handleAddMuteWordClick = () => {
        const createdAt = new Date().getTime()
        const json: MuteWord = {
            category: null,
            word: muteText,
            end: null,
            isActive: true,
            targets: ["timeline"],
            muteAccountIncludesFollowing: true,
            updatedAt: createdAt,
            createdAt: createdAt,
            deletedAt: null,
        }

        // 他の連想配列のwordが同じでないか確認する
        const isDuplicate = muteWords.some(
            (muteWord) => muteWord.word === json.word
        )

        // 重複がない場合のみ追加
        if (!isDuplicate) {
            console.log("add")
            setMuteWords([...muteWords, json])
        } else {
            // 重複する場合の処理をここに追加する（エラーメッセージを表示、何か特定のアクションを実行、など）
            console.log("この単語は既に存在します")
        }
    }

    useEffect(() => {
        if (appearanceColor === "system") {
            const matchMedia = window.matchMedia("(prefers-color-scheme: dark)")

            setDarkMode(matchMedia.matches)
            matchMedia.addEventListener("change", modeMe)

            return () => matchMedia.removeEventListener("change", modeMe)
        } else if (appearanceColor === "dark") {
            setDarkMode(true)
        } else if (appearanceColor === "light") {
            setDarkMode(false)
        }
    }, [appearanceColor])
    const handleMuteAccountIncludesFollowingChange = (value: boolean) => {
        setSelectedMuteWord((prevSelectedMuteWord) => {
            if (!prevSelectedMuteWord) return
            return {
                ...prevSelectedMuteWord,
                muteAccountIncludesFollowing: value,
            }
        })
    }
    const handleTimelineTargetChange = (value: boolean) => {
        setSelectedMuteWord((prevSelectedMuteWord) => {
            if (!prevSelectedMuteWord) return
            return {
                ...prevSelectedMuteWord,
                targets: value
                    ? [...prevSelectedMuteWord.targets, "timeline"]
                    : prevSelectedMuteWord.targets.filter(
                          (target) => target !== "timeline"
                      ),
            }
        })
    }

    const handleNotificationTargetChange = (value: boolean) => {
        setSelectedMuteWord((prevSelectedMuteWord) => {
            if (!prevSelectedMuteWord) return
            return {
                ...prevSelectedMuteWord,
                targets: value
                    ? [...prevSelectedMuteWord.targets, "notification"]
                    : prevSelectedMuteWord.targets.filter(
                          (target) => target !== "notification"
                      ),
            }
        })
    }

    const handleCategoryChange = (value: string) => {
        console.log(value)
        setSelectedMuteWord((prevSelectedMuteWord) => {
            if (!prevSelectedMuteWord) return
            return {
                ...prevSelectedMuteWord,
                category: value,
            }
        })
    }

    // Rootコンポーネント内のuseStateの初期化部分に以下を追加
    const [muteWordCategories, setMuteWordCategories] = useState<string[]>([])
    console.log(muteWordCategories)

    // Rootコンポーネント内のuseEffect内で、muteWordCategoriesを設定する
    useEffect(() => {
        const categories = muteWords
            .filter((muteWord) => muteWord.category !== null)
            .map((muteWord) => muteWord.category as string)
            .filter((value, index, self) => self.indexOf(value) === index) // 重複を除外する

        setMuteWordCategories(categories)
    }, [muteWords])
    return (
        <>
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                placement={"auto"}
                className={modal({ color: color })}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                {selectedMuteWord?.word}
                            </ModalHeader>
                            <ModalBody>
                                <div>
                                    <div>Mute Target</div>
                                </div>
                                <div
                                    className={
                                        "flex items-center justify-between"
                                    }
                                >
                                    <div>Timeline</div>
                                    <Switch
                                        size={"lg"}
                                        defaultSelected={selectedMuteWord?.targets.includes(
                                            "timeline"
                                        )}
                                        onValueChange={(value) => {
                                            handleTimelineTargetChange(value)
                                        }}
                                    />
                                </div>
                                <div
                                    className={
                                        "flex items-center justify-between"
                                    }
                                >
                                    <div>Notification</div>
                                    <Switch
                                        size={"lg"}
                                        defaultSelected={selectedMuteWord?.targets.includes(
                                            "notification"
                                        )}
                                        onValueChange={(value) => {
                                            handleNotificationTargetChange(
                                                value
                                            )
                                        }}
                                    />
                                </div>
                                <div>Target Account</div>
                                <RadioGroup
                                    label=""
                                    description=""
                                    className={
                                        "justify-between, flex-row-reverse"
                                    }
                                    defaultValue={selectedMuteWord?.muteAccountIncludesFollowing.toString()}
                                    onValueChange={(value) => {
                                        handleMuteAccountIncludesFollowingChange(
                                            JSON.parse(value.toLowerCase())
                                        )
                                    }}
                                >
                                    <Radio
                                        value={"true"}
                                        className={
                                            "justify-between, flex-row-reverse"
                                        }
                                    >
                                        All Accounts
                                    </Radio>
                                    <Radio
                                        value={"false"}
                                        className={
                                            "justify-between, flex-row-reverse"
                                        }
                                    >
                                        Not Following Accounts
                                    </Radio>
                                </RadioGroup>
                                <div>Mute Duration</div>
                                <div
                                    className={
                                        "flex items-center justify-between"
                                    }
                                >
                                    <div>period</div>
                                    <Dropdown
                                        className={`${modal({
                                            color: color,
                                        })}`}
                                    >
                                        <DropdownTrigger>
                                            <Button>Select times</Button>
                                        </DropdownTrigger>
                                        <DropdownMenu>
                                            <SelectItem key={"day"}>
                                                24 hours
                                            </SelectItem>
                                            <SelectItem key={"week"}>
                                                7 days
                                            </SelectItem>
                                            <SelectItem key={"month"}>
                                                1 month
                                            </SelectItem>
                                            <SelectItem key={"year"}>
                                                1 year
                                            </SelectItem>
                                        </DropdownMenu>
                                    </Dropdown>
                                </div>
                                <div>Mute Category</div>
                                <div
                                    className={
                                        "flex items-center justify-between"
                                    }
                                >
                                    <div>List</div>
                                    <Select
                                        size={"sm"}
                                        className={"w-[200px]"}
                                        defaultSelectedKeys={[
                                            selectedMuteWord?.category || "",
                                        ]}
                                        onChange={(e) => {
                                            if (
                                                e.target.value ===
                                                "newcategoryselection"
                                            )
                                                return
                                            handleCategoryChange(e.target.value)
                                        }}
                                    >
                                        <SelectSection className={"bg-black"}>
                                            {newCategoryName !== "" && (
                                                <SelectItem
                                                    value={newCategoryName}
                                                    key={`${newCategoryName}`}
                                                >
                                                    {newCategoryName}
                                                </SelectItem>
                                            )}
                                            {muteWordCategories.map(
                                                (category) => (
                                                    <SelectItem
                                                        value={category}
                                                        key={`${category}`}
                                                    >
                                                        {category}
                                                    </SelectItem>
                                                )
                                            )}
                                            <SelectItem
                                                key={"newcategoryselection"}
                                                onClick={() => {
                                                    const name = prompt(
                                                        "Enter a category name"
                                                    )
                                                    setNewCategoryName("")
                                                    if (!name) return
                                                    if (
                                                        muteWordCategories.includes(
                                                            name
                                                        )
                                                    )
                                                        return
                                                    setNewCategoryName(name)
                                                }}
                                            >
                                                Create new category
                                            </SelectItem>
                                        </SelectSection>
                                    </Select>
                                </div>
                                <div
                                    className={
                                        "w-full h-[40px] cursor-pointer flex items-center justify-center bg-red-500 rounded-[10px] mt-[10px] text-white"
                                    }
                                    onClick={() => {
                                        setMuteWords(
                                            muteWords.filter(
                                                (muteWord) =>
                                                    muteWord.word !==
                                                    selectedMuteWord?.word
                                            )
                                        )
                                        onClose()
                                    }}
                                >
                                    delete
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    color="danger"
                                    variant="light"
                                    onPress={onClose}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={onClose}
                                    onClick={() => {
                                        onSave()
                                    }}
                                >
                                    Save
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
            <div className={background({ color: color })}>
                <Table
                    removeWrapper
                    aria-label="Example static collection table"
                    onRowAction={(key) => onOpen()}
                    className={color}
                >
                    <TableHeader>
                        <TableColumn>Mute Words Categories</TableColumn>
                    </TableHeader>
                    <TableBody>
                        <TableRow key="1" className={"cursor-pointer"}>
                            <TableCell>
                                <Accordion>
                                    {Object.keys(categorizedMuteWords).map(
                                        (category) => {
                                            return (
                                                <AccordionItem
                                                    key={category}
                                                    aria-label={category}
                                                    title={category}
                                                >
                                                    <Table
                                                        removeWrapper
                                                        aria-label={`Mute Words in ${category}`}
                                                        className={`${color} w-full`}
                                                        hideHeader
                                                        onRowAction={(key) => {
                                                            setSelectedMuteWord(
                                                                categorizedMuteWords[
                                                                    category
                                                                ][Number(key)]
                                                            )
                                                            onOpen()
                                                        }}
                                                    >
                                                        <TableHeader>
                                                            <TableColumn>
                                                                Forever Mute
                                                                Words
                                                            </TableColumn>
                                                            <TableColumn>
                                                                {" "}
                                                            </TableColumn>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {categorizedMuteWords[
                                                                category
                                                            ].map(
                                                                (
                                                                    muteWord,
                                                                    index
                                                                ) => (
                                                                    <TableRow
                                                                        key={
                                                                            index
                                                                        }
                                                                        className={
                                                                            ""
                                                                        }
                                                                    >
                                                                        <TableCell>
                                                                            {
                                                                                muteWord.word
                                                                            }
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <FontAwesomeIcon
                                                                                icon={
                                                                                    faChevronRight
                                                                                }
                                                                            />
                                                                        </TableCell>
                                                                    </TableRow>
                                                                )
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                </AccordionItem>
                                            )
                                        }
                                    )}
                                </Accordion>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <Table
                    removeWrapper
                    aria-label="Example static collection table"
                    onRowAction={(key) => onOpen()}
                    className={color}
                >
                    <TableHeader>
                        <TableColumn>Time Limit Mute Words</TableColumn>
                        <TableColumn>period</TableColumn>
                        <TableColumn> </TableColumn>
                    </TableHeader>
                    <TableBody>
                        {muteWords
                            .filter(
                                (muteWord) =>
                                    muteWord.end !== null &&
                                    muteWord.category === null
                            )
                            .map((muteWord, index) => (
                                <TableRow
                                    key={index}
                                    className="cursor-pointer"
                                >
                                    <TableCell>{muteWord.word}</TableCell>
                                    <TableCell>
                                        <FontAwesomeIcon
                                            icon={faChevronRight}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
                <Table
                    removeWrapper
                    aria-label="Example static collection table"
                    onRowAction={(key) => {
                        setSelectedMuteWord(muteWords[Number(key)])
                        onOpen()
                    }}
                    className={color}
                >
                    <TableHeader>
                        <TableColumn>Forever Mute Words</TableColumn>
                        <TableColumn> </TableColumn>
                    </TableHeader>
                    <TableBody>
                        {
                            muteWords.map((muteWord, index) => {
                                // muteWord.endがnullの場合のみTableRowを出力
                                if (
                                    muteWord.end === null &&
                                    muteWord.category === null
                                ) {
                                    return (
                                        <TableRow
                                            key={index}
                                            className={"cursor-pointer "}
                                        >
                                            <TableCell>
                                                {muteWord.word}
                                            </TableCell>
                                            <TableCell>
                                                <FontAwesomeIcon
                                                    icon={faChevronRight}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    )
                                }
                                // 条件を満たさない場合はnullを返す
                                return null
                            }) as JSX.Element[]
                        }
                    </TableBody>
                </Table>
                <div
                    className={
                        "w-full h-[50px] flex absolute bottom-[50px] items-center"
                    }
                >
                    <input
                        className={
                            "w-full pl-[20px] pr-[20px] text-black h-[40px] outline-none bg-[#E9E9E9] rounded-[10px] ml-[10px] mr-[10px]"
                        }
                        placeholder={"Mute Words"}
                        onChange={(e) => {
                            setMuteText(e.target.value)
                        }}
                    />
                    <Button
                        className={"mr-[10px]"}
                        color={"primary"}
                        onClick={() => {
                            //alert(muteText)
                            handleAddMuteWordClick()
                        }}
                    >
                        Add
                    </Button>
                </div>
            </div>
        </>
    )
}
