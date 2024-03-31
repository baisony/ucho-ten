import { useAgent } from "@/app/_atoms/agent"
import { MuteWord, useWordMutes } from "@/app/_atoms/wordMute"
import { useBookmarks } from "@/app/_atoms/bookmarks"
import { useCallback, useState } from "react"
import {
    Button,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Select,
    SelectItem,
    Switch,
    useDisclosure,
} from "@nextui-org/react"
import { DummyHeader } from "@/app/_components/DummyHeader"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronRight } from "@fortawesome/free-solid-svg-icons"
import { BskyAgent } from "@atproto/api"
import { TFunction } from "i18next"

interface SettingsMutePageProps {
    t: TFunction
    nextQueryParams: URLSearchParams
    agent: BskyAgent | null
}

export const SettingsMutePage = ({ t }: SettingsMutePageProps) => {
    const [agent] = useAgent()
    const [muteWords, setMuteWords] = useWordMutes()
    const [bookmarks] = useBookmarks()
    const [editMode, setEditMode] = useState<boolean>(false)
    const [inputMuteWord, setInputMuteWord] = useState<string>("")
    const [inputMuteCategory] = useState<string>("")
    ///const [inputTimePeriod, setInputTimePeriod] = useState<string>("")
    const [selectMuteWord, setSelectMuteWord] = useState<any>(null)
    const [, setSwitchIsActive] = useState<boolean>(false)
    const [modalEditMode, setModalEditMode] = useState<boolean>(false)
    const {
        isOpen: isOpenEdit,
        onOpen: onOpenEdit,
        onOpenChange: onOpenChangeEdit,
    } = useDisclosure()

    const syncMuteWords = async (mutelist: any[]) => {
        if (!agent) return
        const syncData = {
            bookmarks: bookmarks,
            muteWords: mutelist,
        }
        try {
            const syncData_string = JSON.stringify(syncData)
            const data = localStorage.getItem("session")
            if (!data) return
            const res = await fetch(`/api/setSettings/post`, {
                method: "POST",
                body: JSON.stringify({
                    syncData: syncData_string,
                    authorization: data,
                }),
            })
            if (res.status !== 200) {
                console.log("sync error")
            }
        } catch (e) {
            console.log(e)
        }
    }

    const handleAddMuteWordClick = useCallback(() => {
        if (!agent) return
        console.log("add")
        console.log(muteWords)
        const createdAt = new Date().getTime()
        const json: MuteWord = {
            category: null,
            word: inputMuteWord,
            selectPeriod: null,
            end: null,
            isActive: true,
            updatedAt: createdAt,
            createdAt: createdAt,
            deletedAt: null,
        }
        const index = muteWords.find(
            (muteWord: any) => muteWord.word === inputMuteWord
        )
        if (index) return
        setMuteWords((prevMutewords) => [...prevMutewords, json])
        void syncMuteWords([...muteWords, json])
    }, [agent, muteWords, setMuteWords, inputMuteWord, syncMuteWords])

    const handleSaveClick = useCallback(() => {
        if (!agent) return
        console.log("save")
        const updatedAt = new Date().getTime()
        const json: MuteWord = selectMuteWord
        const index = muteWords.findIndex(
            (muteWord: any) => muteWord.word === inputMuteWord
        )
        if (muteWords[index] === json) return
        json.updatedAt = updatedAt

        const newMuteWords = [...muteWords]
        newMuteWords[index] = json

        setMuteWords((prevMuteWords) => {
            const newMuteWords = [...prevMuteWords] // 前の状態のコピーを作成
            newMuteWords[index] = json // 特定のインデックスの要素を編集
            return newMuteWords // 新しい状態を返す
        })
        void syncMuteWords(newMuteWords)
    }, [
        selectMuteWord,
        agent,
        muteWords,
        setMuteWords,
        inputMuteWord,
        syncMuteWords,
    ])

    const handleDelete = useCallback(() => {
        if (!agent) return
        console.log("delete")
        const index = muteWords.findIndex(
            (muteWord: any) => muteWord.word === selectMuteWord.word
        )
        const newMuteWords = muteWords
        newMuteWords.splice(index, 1)
        setMuteWords(newMuteWords)
        void syncMuteWords(newMuteWords)
    }, [agent, muteWords, selectMuteWord, setMuteWords, syncMuteWords])

    const getNowTime = () => {
        const now = new Date()
        console.log(now)
        return now.getTime()
    }

    const getEndTime = () => {
        const now = new Date()
        const year = now.getFullYear()
        const month = now.getMonth() + 1
        const date = now.getDate()
        return `${year}-${month}-${date}`
    }

    const mutePeriods = {
        day: "a day",
        week: "a week",
        month: "a month",
        year: "a year",
    }
    return (
        agent && (
            <>
                <Modal
                    isOpen={isOpenEdit}
                    onOpenChange={onOpenChangeEdit}
                    hideCloseButton
                    className={"text-black dark:text-white"}
                >
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader
                                    className={
                                        "flex justify-between lg:justify-center"
                                    }
                                >
                                    <Button
                                        className={"lg:hidden"}
                                        variant={"light"}
                                        onClick={() => {
                                            onClose()
                                        }}
                                    >
                                        {t("button.cancel")}
                                    </Button>
                                    <div>{t("pages.mute.editMuteText")}</div>
                                    <Button
                                        className={"lg:hidden"}
                                        variant={"light"}
                                        onClick={() => {
                                            if (inputMuteWord.length === 0)
                                                return
                                            if (modalEditMode) {
                                                handleSaveClick()
                                            } else {
                                                handleAddMuteWordClick()
                                            }
                                            onClose()
                                        }}
                                        isDisabled={
                                            inputMuteWord.length === 0 ||
                                            inputMuteWord.length >= 21
                                        }
                                    >
                                        {t("button.save")}
                                    </Button>
                                </ModalHeader>
                                <ModalBody>
                                    <div>
                                        <div>
                                            <div
                                                className={
                                                    "flex justify-between"
                                                }
                                            >
                                                <div>
                                                    {t("pages.mute.text")}
                                                </div>
                                                <div
                                                    className={`${
                                                        inputMuteWord.length >=
                                                            21 && `text-red-600`
                                                    }`}
                                                >
                                                    {modalEditMode
                                                        ? selectMuteWord.word
                                                              .length
                                                        : inputMuteWord.length}{" "}
                                                    / 20
                                                </div>
                                            </div>
                                            <Input
                                                onValueChange={(e) => {
                                                    console.log(e)
                                                    setInputMuteWord(e)
                                                }}
                                                isDisabled={modalEditMode}
                                                defaultValue={
                                                    modalEditMode
                                                        ? selectMuteWord.word
                                                        : inputMuteWord
                                                }
                                            ></Input>
                                        </div>
                                        <div className={"flex justify-between"}>
                                            <div>{t("pages.mute.enable")}</div>
                                            <Switch
                                                defaultSelected={
                                                    modalEditMode
                                                        ? selectMuteWord.isActive
                                                        : true
                                                }
                                                onValueChange={
                                                    setSwitchIsActive
                                                }
                                            />
                                        </div>
                                        <div className={"mt-[10px]"}>
                                            <div>
                                                {t(
                                                    "pages.mute.durationUntilUnmute"
                                                )}
                                            </div>
                                            <div
                                                className={
                                                    "flex justify-between items-center"
                                                }
                                            >
                                                <div>
                                                    {t("pages.mute.period")}
                                                </div>
                                                <Select
                                                    size={"sm"}
                                                    label=""
                                                    className={`md:max-w-xs max-w-[200px] w-full`}
                                                    onChange={(e) =>
                                                        console.log(e)
                                                    }
                                                    defaultSelectedKeys={
                                                        inputMuteCategory
                                                    }
                                                    labelPlacement={
                                                        "outside-left"
                                                    }
                                                    isDisabled={true}
                                                >
                                                    {Object.entries(
                                                        mutePeriods
                                                    ).map(([key, value]) => (
                                                        <SelectItem
                                                            key={key}
                                                            value={key}
                                                        >
                                                            {value}
                                                        </SelectItem>
                                                    ))}
                                                </Select>
                                            </div>
                                        </div>
                                        <div
                                            className={
                                                "flex justify-center items-center mt-[20px]"
                                            }
                                        >
                                            <div
                                                className={"cursor-pointer"}
                                                onClick={() => {
                                                    handleDelete()
                                                    onClose()
                                                }}
                                            >
                                                {t("button.delete")}
                                            </div>
                                        </div>
                                    </div>
                                </ModalBody>
                                <ModalFooter className={"md:flex md:items-end"}>
                                    <Button
                                        onClick={() => {
                                            onClose()
                                        }}
                                        className={"hidden lg:block"}
                                    >
                                        {t("button.cancel")}
                                    </Button>
                                    <Button
                                        color={"primary"}
                                        onClick={() => {
                                            if (inputMuteWord.length === 0)
                                                return
                                            if (modalEditMode) {
                                                handleSaveClick()
                                            } else {
                                                handleAddMuteWordClick()
                                            }
                                            onClose()
                                        }}
                                        className={"hidden lg:block"}
                                        isDisabled={
                                            inputMuteWord.length === 0 ||
                                            inputMuteWord.length >= 21
                                        }
                                    >
                                        {t("button.save")}
                                    </Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>
                <div className="text-black dark:text-white w-full h-full">
                    <DummyHeader />
                    <div className={"font-bold flex "}>
                        <div>{t("pages.mute.title")}</div>
                        <div className={"ml-[15px]"}>
                            {muteWords.length} / 30
                        </div>
                    </div>
                    <div className={"w-full h-fulll"}>
                        {muteWords.map((muteWord: MuteWord, index: number) => {
                            return (
                                <div
                                    key={index}
                                    className={
                                        "w-full h-[50px] border-b-[1px] border-t-[1px] border-[#E8E8E8] dark:text-[#D7D7D7] dark:border-[#292929] bg-white dark:bg-[#16191F] flex justify-between items-center px-[10px] cursor-pointer"
                                    }
                                    onClick={() => {
                                        setSelectMuteWord(muteWord)
                                        setModalEditMode(true)
                                        onOpenEdit()
                                    }}
                                >
                                    <div>{muteWord?.word}</div>
                                    <div className={"flex"}>
                                        <div>
                                            {muteWord.end === null
                                                ? t("pages.mute.forever")
                                                : muteWord.end < getNowTime()
                                                  ? getEndTime()
                                                  : t("pages.mute.expired")}
                                        </div>
                                        <div className={"w-[14px] ml-[10px]"}>
                                            <FontAwesomeIcon
                                                icon={faChevronRight}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div
                        className={
                            "absolute bottom-0 left-0 h-[50px] w-full bg-white dark:bg-black flex items-center justify-between"
                        }
                    >
                        {editMode ? (
                            <>
                                <div
                                    onClick={() => {
                                        setEditMode(false)
                                    }}
                                >
                                    {"button.cancel"}
                                </div>
                                <Button>{"button.delete"}</Button>
                            </>
                        ) : (
                            <>
                                <div
                                    onClick={() => {
                                        //setEditMode(true)
                                    }}
                                ></div>
                                <Button
                                    onClick={() => {
                                        setModalEditMode(false)
                                        onOpenEdit()
                                    }}
                                    isDisabled={muteWords.length >= 30}
                                >
                                    {t("pages.mute.add")}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </>
        )
    )
}

export default SettingsMutePage
