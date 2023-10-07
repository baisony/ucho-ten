"use client"
import { isMobile } from "react-device-detect"
import { useEffect, useState } from "react"

import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Select,
    SelectItem,
} from "@nextui-org/react"
import { Accordion, AccordionItem, Tooltip } from "@nextui-org/react"
import { viewMutewordsPage } from "@/app/settings/mute/words/styles"
import {
    LeadingActions,
    SwipeableList,
    SwipeableListItem,
    SwipeAction,
    TrailingActions,
} from "react-swipeable-list"
import "react-swipeable-list/dist/styles.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faTrash,
    faEllipsis,
    faChevronRight,
} from "@fortawesome/free-solid-svg-icons"
import { faEye, faEyeSlash, faEdit } from "@fortawesome/free-regular-svg-icons"

import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    useDisclosure,
    Switch,
} from "@nextui-org/react"
import { useAppearanceColor } from "@/app/_atoms/appearanceColor"
import {useWordMutes} from "@/app/_atoms/wordMute";

interface MuteWord {
    category: string | null
    word: string
    end: string | null
    isActive: boolean
    targets: string[]
    muteAccountIncludesFollowing: boolean
}


export default function Root() {
    const [appearanceColor] = useAppearanceColor()
    const [muteWords, setMuteWords] = useWordMutes()
    const [darkMode, setDarkMode] = useState(false)
    const color = darkMode ? "dark" : "light"
    const { background, accordion, button } = viewMutewordsPage()
    const { isOpen, onOpen, onOpenChange } = useDisclosure()
    const [muteText, setMuteText] = useState<string>("")

    const modeMe = (e: any) => {
        setDarkMode(!!e.matches)
    }

    const handleAddMuteWordClick = () => {
        const json = {
            category: null,
            word: muteText,
            end: null,
            isActive: true,
            targets: [],
            muteAccountIncludesFollowing: false,
        }

        // 他の連想配列のwordが同じでないか確認する
        const isDuplicate = muteWords.some((muteWord) => muteWord.word === json.word);

        // 重複がない場合のみ追加
        if (!isDuplicate) {
            console.log('add')
            setMuteWords([...muteWords, json]);
        } else {
            // 重複する場合の処理をここに追加する（エラーメッセージを表示、何か特定のアクションを実行、など）
            console.log('この単語は既に存在します');
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

    console.log(muteWords)
    return (
        <>
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                placement={"auto"}
                className={color}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                Modal Title
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
                                    <Switch size={"lg"} />
                                </div>
                                <div
                                    className={
                                        "flex items-center justify-between"
                                    }
                                >
                                    <div>Notification</div>
                                    <Switch size={"lg"} />
                                </div>
                                <div
                                    className={
                                        "flex items-center justify-between"
                                    }
                                >
                                    <div>All Accounts</div>
                                    <Switch size={"lg"} />
                                </div>
                                <div
                                    className={
                                        "flex items-center justify-between"
                                    }
                                >
                                    <div>Not Followee</div>
                                    <Switch size={"lg"} />
                                </div>
                                <div>Mute Duration</div>
                                <div
                                    className={
                                        "flex items-center justify-between"
                                    }
                                >
                                    <div>period</div>
                                    <Select size={"sm"} className={"w-[150px]"}>
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
                                    </Select>
                                </div>
                                <div>Mute Category</div>
                                <div
                                    className={
                                        "flex items-center justify-between"
                                    }
                                >
                                    <div>List</div>
                                    <Select size={"sm"} className={"w-[200px]"}>
                                        <SelectItem key={"hoge"}>
                                            hoge
                                        </SelectItem>
                                    </Select>
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
                                <Button color="primary" onPress={onClose}>
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
                                    <AccordionItem
                                        aria-label="hogehoge"
                                        title="hogehoge"
                                    >
                                        <Table
                                            removeWrapper
                                            aria-label="Example static collection table"
                                            className={`${color} w-full`}
                                            hideHeader
                                        >
                                            <TableHeader>
                                                <TableColumn>
                                                    Forever Mute Words
                                                </TableColumn>
                                                <TableColumn> </TableColumn>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow
                                                    key="1"
                                                    className={""}
                                                >
                                                    <TableCell>
                                                        hogehoge
                                                    </TableCell>
                                                    <TableCell>
                                                        <FontAwesomeIcon
                                                            icon={
                                                                faChevronRight
                                                            }
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </AccordionItem>
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
                        <TableRow key="1" className={"cursor-pointer"}>
                            <TableCell>イーロン</TableCell>
                            <TableCell>~ 23/12/26</TableCell>
                            <TableCell>
                                <FontAwesomeIcon icon={faChevronRight} />
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
                        <TableColumn>Forever Mute Words</TableColumn>
                        <TableColumn> </TableColumn>
                    </TableHeader>
                    <TableBody>
                        <TableRow key="1" className={"cursor-pointer "}>
                            <TableCell>イーロン</TableCell>
                            <TableCell>
                                <FontAwesomeIcon icon={faChevronRight} />
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <div className={'w-full h-[50px] flex absolute bottom-[50px] items-center'}>
                    <input className={'w-full pl-[20px] pr-[20px] text-black h-[40px] outline-none'}
                           placeholder={'Mute Words'}
                           onChange={(e) => {
                               setMuteText(e.target.value)
                           }}
                    />
                    <Button
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
