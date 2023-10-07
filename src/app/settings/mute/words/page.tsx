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

export default function Root() {
    const [appearanceColor] = useAppearanceColor()
    const [darkMode, setDarkMode] = useState(false)
    const color = darkMode ? "dark" : "light"
    const { background, accordion, button } = viewMutewordsPage()
    const { isOpen, onOpen, onOpenChange } = useDisclosure()

    const modeMe = (e: any) => {
        setDarkMode(!!e.matches)
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
            </div>
        </>
    )
}
