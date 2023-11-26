"use client"

import React, { useCallback, useRef, useState } from "react"
import { createPostPage } from "./styles"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faImage } from "@fortawesome/free-regular-svg-icons"
import {
    faCirclePlus,
    faFaceLaughBeam,
    faPlus,
    faXmark,
} from "@fortawesome/free-solid-svg-icons"
import { buildStyles, CircularProgressbar } from "react-circular-progressbar"
import { useDropzone } from "react-dropzone"
import "react-circular-progressbar/dist/styles.css"
import data from "@emoji-mart/data"
import Picker from "@emoji-mart/react"
import {
    Button,
    Chip,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Image,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Selection,
    Spinner,
    Textarea as NextUITextarea,
    useDisclosure,
} from "@nextui-org/react"

import Textarea from "react-textarea-autosize" // 追加
import { useRouter, useSearchParams } from "next/navigation"
import { useAgent } from "@/app/_atoms/agent"
import { useUserProfileDetailedAtom } from "../_atoms/userProfileDetail"
// import Compressor from "compressorjs"
import imageCompression, {
    Options as ImageCompressionOptions,
} from "browser-image-compression"

import i18n from "@/app/_i18n/config"

import {
    AppBskyEmbedImages,
    AppBskyFeedPost,
    BlobRef,
    RichText,
} from "@atproto/api"

import { Linkcard } from "@/app/_components/Linkcard"
import { useTranslation } from "react-i18next"
import { useNextQueryParamsAtom } from "../_atoms/nextQueryParams"
import { LANGUAGES } from "../_constants/lanuages"
import LanguagesSelectionModal from "../_components/LanguageSelectionModal"

const MAX_ATTACHMENT_IMAGES: number = 4

interface AttachmentImage {
    blob: Blob
    type: string
    isFailed?: boolean
}

export default function Root() {
    const { t } = useTranslation()
    const searchParams = useSearchParams()
    const postParam = searchParams.get("text")

    const [userProfileDetailed] = useUserProfileDetailedAtom()
    const [agent] = useAgent()
    const router = useRouter()
    const [nextQueryParams] = useNextQueryParamsAtom()
    let defaultLanguage

    if (window) {
        defaultLanguage = [
            (window.navigator.languages && window.navigator.languages[0]) ||
                window.navigator.language,
        ]
    } else {
        defaultLanguage = ["en"]
    }

    const [postContentLanguages, setPostContentLanguages] = useState(
        new Set<string>(defaultLanguage)
    )

    const inputId = Math.random().toString(32).substring(2)
    const [contentText, setContentText] = useState(postParam ? postParam : "")
    const [contentImages, setContentImages] = useState<AttachmentImage[]>([])
    const [loading, setLoading] = useState(false)
    const [isDetectedURL, setIsDetectURL] = useState(false)
    const [detectedURLs, setDetectURLs] = useState<string[]>([])
    const [selectedURL, setSelectedURL] = useState<string>("")
    const [isOGPGetProcessing, setIsOGPGetProcessing] = useState(false)
    const [, setIsSetURLCard] = useState(false)
    const [getOGPData, setGetOGPData] = useState<any>(null)
    const [, setIsGetOGPFetchError] = useState(false)
    const [isCompressing, setIsCompressing] = useState(false)
    // const [compressingLength, setCompressingLength] = useState(0)
    const [OGPImage, setOGPImage] = useState<any>([])

    const textareaRef = useRef<HTMLTextAreaElement>(null)
    //const hiddenInput = useRef<HTMLDivElement>(null)
    const currentCursorPostion = useRef<number>(0)
    const isEmojiAdding = useRef<boolean>(false)

    const {
        background,
        backgroundColor,
        PostModal,
        header,
        headerTitle,
        headerPostButton,
        headerCancelButton,
        content,
        contentLeft,
        contentLeftAuthorIcon,
        contentLeftAuthorIconImage,
        contentRight,
        contentRightTextArea,
        contentRightImagesContainer,
        contentRightUrlCard,
        contentRightUrlCardDeleteButton,
        footer,
        footerTooltip,
        footerCharacterCount,
        footerCharacterCountText,
        footerTooltipStyle,
        ImageDeleteButton,
        ImageAddALTButton,
        appearanceTextColor,
    } = createPostPage()
    const { isOpen } = useDisclosure()

    // const [darkMode, setDarkMode] = useState(false)

    const {
        isOpen: isOpenALT,
        onOpen: onOpenALT,
        onOpenChange: onOpenChangeALT,
    } = useDisclosure()
    const {
        isOpen: isOpenLangs,
        onOpen: onOpenLangs,
        onOpenChange: onOpenChangeLangs,
    } = useDisclosure()
    const [altOfImageList, setAltOfImageList] = useState(["", "", "", ""])

    const [editALTIndex, setEditALTIndex] = useState(0)
    const [altText, setAltText] = useState("")

    const trimedContentText = (): string => {
        return contentText.trim()
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            void handlePostClick()
        }
    }

    const onDrop = useCallback(async (files: File[]) => {
        await addImages(files)
    }, [])

    const { getRootProps, isDragActive } = useDropzone({ onDrop })

    //const filesUpdated: FileWithPath[] = acceptedFiles;

    const handleDrop = (e: any) => {
        e.preventDefault()
        //const file = e.dataTransfer.files[0];
        // ファイルの処理を行う
    }

    const handleDragOver = (e: any) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = "copy"
    }

    const handlePostClick = async () => {
        if (!agent) return
        if (
            trimedContentText() === "" &&
            contentImages.length === 0 &&
            !getOGPData
        )
            return
        setLoading(true)
        try {
            const blobRefs: BlobRef[] = []

            const images = contentImages.length > 0 ? contentImages : OGPImage

            let uploadBlobRes

            for (const image of images) {
                const uint8array = new Uint8Array(
                    await image.blob.arrayBuffer()
                )
                uploadBlobRes = await agent.uploadBlob(uint8array, {
                    encoding: "image/jpeg",
                })

                const blobRef = uploadBlobRes.data.blob
                blobRefs.push(blobRef)
            }

            const rt = new RichText({ text: trimedContentText() })
            await rt.detectFacets(agent)
            const postObj: Partial<AppBskyFeedPost.Record> &
                Omit<AppBskyFeedPost.Record, "createdAt"> = {
                text: rt.text.trimStart().trimEnd(),
                facets: rt.facets,
                langs: Array.from(postContentLanguages),
            }

            if (blobRefs.length > 0) {
                const images: AppBskyEmbedImages.Image[] = []

                for (const [index, blobRef] of blobRefs.entries()) {
                    console.log(index)
                    console.log(altOfImageList)
                    const image: AppBskyEmbedImages.Image = {
                        image: blobRef,
                        alt: altOfImageList[index],
                    }

                    images.push(image)

                    // indexを使用する
                }

                if (getOGPData) {
                    postObj.embed = {
                        $type: "app.bsky.embed.external",
                        external: {
                            uri: getOGPData?.uri ? getOGPData.uri : selectedURL,
                            title: getOGPData?.title
                                ? getOGPData.title
                                : selectedURL,
                            description: getOGPData?.description
                                ? getOGPData.description
                                : "No Description.",
                            thumb: {
                                $type: "blob",
                                ref: {
                                    $link: uploadBlobRes?.data?.blob.ref.toString(),
                                },
                                mimeType: uploadBlobRes?.data?.blob.mimeType,
                                size: uploadBlobRes?.data?.blob.size,
                            },
                        },
                    } as any
                } else {
                    postObj.embed = {
                        $type: "app.bsky.embed.images",
                        images,
                    } as AppBskyEmbedImages.Main
                }
            }

            await agent.post(postObj)

            console.log("hoge")

            setLoading(false)

            router.push(`/home?${nextQueryParams.toString()}`)
        } catch (e) {
            console.log(e)
        } finally {
            setLoading(false)
        }
    }

    const handleOnRemoveImage = (index: number) => {
        const newImages = [...contentImages]
        newImages.splice(index, 1)
        setContentImages(newImages)
    }

    const handleOnAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const currentImagesCount = contentImages.length
        console.log("add image")
        if (!e.target.files) {
            return
        }

        const imageFiles = Array.from(e.target.files)
        console.log(imageFiles)
        if (!(imageFiles.length + currentImagesCount > 4)) {
            void addImages(imageFiles)
        }
    }

    const addImages = async (imageFiles: File[]) => {
        const currentImagesCount = contentImages.length

        if (currentImagesCount + imageFiles.length > 4) {
            imageFiles.slice(0, 4 - currentImagesCount)
        }
        console.log(imageFiles)

        const maxFileSize = 975 * 1024 // 975KB

        const imageBlobs: AttachmentImage[] = await Promise.all(
            imageFiles.map(async (file) => {
                if (file.size > maxFileSize) {
                    try {
                        setIsCompressing(true)
                        const options: ImageCompressionOptions = {
                            maxSizeMB: maxFileSize / 1024 / 1024,
                            maxWidthOrHeight: 4096,
                            useWebWorker: true,
                            maxIteration: 20,
                        }

                        const compressedFile = await imageCompression(
                            file,
                            options
                        )

                        console.log("圧縮後", compressedFile.size)

                        if (compressedFile.size > maxFileSize) {
                            throw new Error("Image compression failure")
                        }
                        setIsCompressing(false)

                        return {
                            blob: compressedFile,
                            type: file.type,
                        }
                    } catch (error) {
                        setIsCompressing(false)
                        console.log("圧縮失敗", file.size)
                        console.error(error)

                        return {
                            blob: file,
                            type: file.type,
                            isFailed: true,
                        }
                    }
                } else {
                    console.log("圧縮しなーい", file.size)
                    return {
                        blob: file,
                        type: file.type,
                    }
                }
            })
        )

        const addingImages: AttachmentImage[] = imageBlobs.filter(
            (imageBlob) => {
                return !imageBlob.isFailed
            }
        )

        setContentImages((currentImages) => [...currentImages, ...addingImages])
    }

    const onEmojiClick = (emoji: any) => {
        if (isEmojiAdding.current) {
            return
        }

        isEmojiAdding.current = true

        if (textareaRef.current) {
            // const target = textareaRef.current
            // const cursorPosition = target.selectionStart

            setContentText((prevContentText) => {
                return `${prevContentText.slice(
                    0,
                    currentCursorPostion.current
                )}${emoji.native}${prevContentText.slice(
                    currentCursorPostion.current
                )}`
            })

            currentCursorPostion.current += emoji.native.length
        } else {
            setContentText((prevContentText) => prevContentText + emoji.native)
        }

        isEmojiAdding.current = false
    }

    // ドラッグをキャンセルする
    const handleDragStart = (e: any) => {
        e.preventDefault()
    }

    // const userList = [
    //     {
    //         name: "John Doe",
    //         avatar: "https://i.pravatar.cc/100?img=1",
    //         did: "did:plc:txandrhc7afdozk6a2itgltm",
    //     },
    //     {
    //         name: "Jane Doe",
    //         avatar: "https://i.pravatar.cc/100?img=2",
    //         did: "did:plc:txandrhc7afdozk6a2itgltm",
    //     },
    //     {
    //         name: "Kate Doe",
    //         avatar: "https://i.pravatar.cc/100?img=3",
    //         did: "did:plc:txandrhc7afdozk6a2itgltm",
    //     },
    //     {
    //         name: "Mark Doe",
    //         avatar: "https://i.pravatar.cc/100?img=4",
    //         did: "did:plc:txandrhc7afdozk6a2itgltm",
    //     },
    // ]

    const detectURL = (text: string) => {
        // URLを検出する正規表現パターン
        const urlPattern =
            /(?:https?|ftp):\/\/[\w-]+(?:\.[\w-]+)+(?:[\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/g
        const urls = text.match(urlPattern)
        setDetectURLs([])

        if (urls && urls.length > 0) {
            setIsDetectURL(true)
            urls.forEach((url) => {
                setDetectURLs((prevURLs) => [...prevURLs, url])
                console.log(url)
            })
        }
    }
    const getOGP = async (url: string) => {
        console.log(url)
        setIsOGPGetProcessing(true)
        try {
            const response = await fetch(
                `https://ucho-ten-ogp-api.vercel.app/api/ogp?url=` + url
            )
            if (!response.ok) {
                throw new Error("HTTP status " + response.status)
            }
            const res = await response.json()
            const thumb = res["image:secure_url"] || res?.image
            const uri = url
            const generatedURL = thumb?.startsWith("http")
                ? thumb
                : uri && thumb?.startsWith("/")
                ? `${uri.replace(/\/$/, "")}${thumb}`
                : `${uri}${uri?.endsWith("/") ? "" : "/"}${thumb}`
            const json = {
                title: res?.title,
                description: res?.description,
                thumb: generatedURL,
                uri: url,
                alt: "",
            }
            setGetOGPData(json)
            const image = await fetch(
                `https://ucho-ten-image-api.vercel.app/api/image?url=${generatedURL}`
            )
            setOGPImage([{ blob: image, type: "image/jpeg" }])
            setIsOGPGetProcessing(false)
            return res
        } catch (e) {
            setIsOGPGetProcessing(false)
            setIsSetURLCard(false)
            setIsGetOGPFetchError(true)
            console.log(e)
            return e
        }
    }

    const handlePaste = async (event: React.ClipboardEvent) => {
        const items = event.clipboardData.items
        const imageFiles: File[] = []

        for (const item of items) {
            if (item.type.startsWith("image/")) {
                const file = item.getAsFile()

                if (file !== null) {
                    if (
                        contentImages.length + imageFiles.length <
                        MAX_ATTACHMENT_IMAGES
                    ) {
                        imageFiles.push(file)
                    }
                }
            }
        }

        if (imageFiles.length > 0) {
            await addImages(imageFiles)
        }
    }

    const handleOnEmojiOpenChange = (isOpen: boolean) => {
        if (isOpen) {
            currentCursorPostion.current =
                textareaRef.current?.selectionStart || 0
        } else {
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.setSelectionRange(
                        currentCursorPostion.current,
                        currentCursorPostion.current
                    )

                    textareaRef.current?.focus()
                }
            }, 500)
        }
    }

    const handleALTClick = useCallback(() => {
        const updatedAltOfImageList = [...altOfImageList]
        updatedAltOfImageList[editALTIndex] = altText
        setAltOfImageList(updatedAltOfImageList)
    }, [altOfImageList, editALTIndex, altText])

    const handleLanguagesSelectionChange = (keys: Selection) => {
        if (Array.from(keys).length < 4) {
            setPostContentLanguages(keys as Set<string>)
        }
    }

    return (
        <>
            <LanguagesSelectionModal
                isOpen={isOpenLangs}
                onOpenChange={onOpenChangeLangs}
                onSelectionChange={handleLanguagesSelectionChange}
                postContentLanguages={postContentLanguages}
            />

            <Modal isOpen={isOpenALT} onOpenChange={onOpenChangeALT}>
                <ModalContent>
                    {(onCloseALT) => (
                        <>
                            <ModalHeader>Edit ALT</ModalHeader>
                            <ModalBody>
                                <img
                                    className={
                                        "w-full h-full object-cover object-center"
                                    }
                                    src={URL.createObjectURL(
                                        contentImages[editALTIndex].blob
                                    )}
                                    alt={"updateImage"}
                                />
                                <div>
                                    <NextUITextarea
                                        placeholder={"ALTを入力"}
                                        onValueChange={(e) => {
                                            setAltText(e)
                                        }}
                                    ></NextUITextarea>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color={"danger"} onClick={onCloseALT}>
                                    Cancel
                                </Button>
                                <Button
                                    color={"primary"}
                                    onClick={() => {
                                        onCloseALT()
                                        handleALTClick()
                                        console.log(altText)
                                        console.log(altOfImageList)
                                    }}
                                >
                                    Save
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
            <main
                className={`${background()}
            md:relative md:flex md:justify-center md:items-center
        `}
            >
                <div className={backgroundColor()}></div>
                {isOpen && window.prompt("Please enter link", "Harry Potter")}
                <div className={PostModal()}>
                    <div className={header()}>
                        <Button
                            variant="light"
                            className={headerCancelButton()}
                            isDisabled={loading}
                            onClick={() => {
                                // if (history[0] === "/post" || history[0] === "") {
                                //     router.push(`/?${nextQueryParams.toString()}`)
                                // } else {
                                router.back()
                                // }
                            }}
                        >
                            {t("button.cancel")}
                        </Button>
                        <div className={headerTitle()}>
                            {t("modal.post.title")}
                        </div>
                        <Button
                            className={headerPostButton()}
                            size={"sm"}
                            radius={"full"}
                            color={"primary"}
                            onPress={handlePostClick}
                            isDisabled={
                                loading ||
                                isOGPGetProcessing ||
                                isCompressing ||
                                ((trimedContentText().length === 0 ||
                                    trimedContentText().length > 300) &&
                                    contentImages.length === 0 &&
                                    !getOGPData)
                            }
                            isLoading={loading}
                        >
                            {loading ? "" : t("button.post")}
                        </Button>
                    </div>
                    <div
                        className={content({ isDragActive: isDragActive })}
                        {...getRootProps({
                            onDrop: handleDrop,
                            onDragOver: handleDragOver,
                            onClick: (e) => {
                                e.stopPropagation()
                                e.preventDefault()
                            },
                        })}
                    >
                        <div className={contentLeft()}>
                            <div className={contentLeftAuthorIcon()}>
                                <img
                                    className={contentLeftAuthorIconImage()}
                                    alt={"author icon"}
                                    onDragStart={handleDragStart}
                                    src={userProfileDetailed?.avatar || ""}
                                />
                            </div>
                        </div>
                        <div className={contentRight()}>
                            <Textarea
                                ref={textareaRef}
                                className={contentRightTextArea({
                                    uploadImageAvailable:
                                        contentImages.length !== 0 ||
                                        isCompressing ||
                                        detectedURLs.length !== 0 ||
                                        getOGPData !== null,
                                })}
                                aria-label="post input area"
                                placeholder={t("modal.post.placeholder")}
                                value={contentText}
                                maxLength={10000}
                                autoFocus={true}
                                onChange={(e) => {
                                    setContentText(e.target.value)
                                    detectURL(e.target.value)
                                    currentCursorPostion.current =
                                        textareaRef.current?.selectionStart || 0
                                }}
                                onKeyDown={handleKeyDown}
                                disabled={loading}
                                // onFocus={(e) =>
                                //     e.currentTarget.setSelectionRange(
                                //         e.currentTarget.value.length,
                                //         e.currentTarget.value.length
                                //     )
                                // }
                                onPaste={handlePaste}
                            />
                            {(contentImages.length > 0 || isCompressing) && (
                                <div className={contentRightImagesContainer()}>
                                    {isCompressing && (
                                        <div
                                            className={
                                                "relative w-full h-full z-10 flex justify-center items-center"
                                            }
                                        >
                                            {t("modal.post.compressing")}...
                                            <Spinner />
                                        </div>
                                    )}
                                    {contentImages.map((image, index) => (
                                        <div
                                            key={index}
                                            className={
                                                "relative w-1/4 h-full flex"
                                            }
                                        >
                                            <Image
                                                src={URL.createObjectURL(
                                                    image.blob
                                                )}
                                                alt="image"
                                                style={{
                                                    borderRadius: "10px",
                                                    objectFit: "cover",
                                                }}
                                                className={
                                                    "h-[105px] w-[95px] object-cover object-center"
                                                }
                                            />
                                            <div
                                                style={{
                                                    zIndex: "10",
                                                    position: "absolute",
                                                    top: 5,
                                                    left: 5,
                                                }}
                                            >
                                                <button
                                                    className={ImageDeleteButton()}
                                                    onClick={() =>
                                                        handleOnRemoveImage(
                                                            index
                                                        )
                                                    }
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faXmark}
                                                        size="sm"
                                                        className={" mb-[2px]"}
                                                    />
                                                </button>
                                            </div>
                                            <div
                                                style={{
                                                    zIndex: "10",
                                                    position: "absolute",
                                                    bottom: 5,
                                                    left: 5,
                                                }}
                                            >
                                                <button
                                                    className={`${ImageAddALTButton()} flex justify-center items-center`}
                                                    onClick={() => {
                                                        setEditALTIndex(index)
                                                        setAltText("")
                                                        onOpenALT()
                                                    }}
                                                >
                                                    ALT
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {isDetectedURL &&
                                !getOGPData &&
                                !isOGPGetProcessing && (
                                    <div className={"w-full"}>
                                        {detectedURLs.map((url, index) => (
                                            <div className={"mb-[5px]"}>
                                                <Chip
                                                    key={index}
                                                    className={`w-full `}
                                                    style={{
                                                        textAlign: "left",
                                                        cursor: "pointer",
                                                    }}
                                                    startContent={
                                                        <FontAwesomeIcon
                                                            icon={faPlus}
                                                        />
                                                    }
                                                    onClick={() => {
                                                        setSelectedURL(url)
                                                        setIsSetURLCard(true)
                                                        void getOGP(url)
                                                    }}
                                                >
                                                    {url}
                                                </Chip>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            {isOGPGetProcessing && (
                                <div className={contentRightUrlCard()}>
                                    <Linkcard skeleton={true} />
                                </div>
                            )}
                            {getOGPData && !isOGPGetProcessing && (
                                <div
                                    className={`${contentRightUrlCard()} flex relative`}
                                >
                                    <div
                                        className={`${contentRightUrlCardDeleteButton()} absolute z-10 right-[10px] top-[10px]`}
                                        onClick={() => {
                                            setIsSetURLCard(false)
                                            setGetOGPData(undefined)
                                        }}
                                    >
                                        <FontAwesomeIcon
                                            icon={faXmark}
                                            size={"lg"}
                                        />
                                    </div>
                                    <Linkcard ogpData={getOGPData} />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={footer()}>
                        <div className={footerTooltip()}>
                            <label
                                htmlFor={inputId}
                                className={footerTooltipStyle()}
                            >
                                <Button
                                    isDisabled={
                                        loading ||
                                        isCompressing ||
                                        contentImages.length >= 4 ||
                                        // isImageMaxLimited ||
                                        getOGPData ||
                                        isOGPGetProcessing
                                    }
                                    as={"span"}
                                    isIconOnly
                                    variant="light"
                                    className={"h-[24px] text-white"}
                                    disableAnimation
                                    disableRipple
                                >
                                    <FontAwesomeIcon
                                        icon={faImage}
                                        className={"h-[20px] mb-[5px]"}
                                    />
                                </Button>

                                <input
                                    hidden
                                    id={inputId}
                                    multiple
                                    type="file"
                                    accept="image/*,.png,.jpg,.jpeg"
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>
                                    ) => {
                                        void handleOnAddImage(e)
                                    }}
                                    disabled={
                                        loading ||
                                        isCompressing ||
                                        contentImages.length >= 4 ||
                                        // isImageMaxLimited ||
                                        getOGPData ||
                                        isOGPGetProcessing
                                    }
                                />
                            </label>
                            <div
                                className={`${footerTooltipStyle()}  md:hidden`}
                                style={{ bottom: "5%" }}
                                onClick={() => {
                                    onOpenLangs()
                                }}
                            >{`${t("modal.post.lang")}:${Array.from(
                                postContentLanguages
                            ).join(",")}`}</div>
                            <div
                                className={`${footerTooltipStyle()} hidden md:flex`}
                                style={{ bottom: "5%" }}
                            >
                                <Dropdown
                                    backdrop="blur"
                                    className={appearanceTextColor()}
                                >
                                    <DropdownTrigger>
                                        {`${t("modal.post.lang")}:${Array.from(
                                            postContentLanguages
                                        ).join(",")}`}
                                    </DropdownTrigger>
                                    <DropdownMenu
                                        disallowEmptySelection
                                        aria-label="Multiple selection actions"
                                        selectionMode="multiple"
                                        selectedKeys={postContentLanguages}
                                        defaultSelectedKeys={
                                            postContentLanguages
                                        }
                                        onSelectionChange={(e) => {
                                            if (Array.from(e).length < 4) {
                                                setPostContentLanguages(
                                                    e as Set<string>
                                                )
                                            }
                                        }}
                                    >
                                        {LANGUAGES.map((item) => {
                                            return (
                                                <DropdownItem key={item.code}>
                                                    {item.name}
                                                </DropdownItem>
                                            )
                                        })}
                                    </DropdownMenu>
                                </Dropdown>
                            </div>
                            <div className={`${footerTooltipStyle()} hidden`}>
                                <Dropdown backdrop="blur">
                                    <DropdownTrigger>
                                        <FontAwesomeIcon
                                            icon={faCirclePlus}
                                            className={
                                                "md:h-[20px] h-[10px] mb-[4px] text-white"
                                            }
                                            size={"xs"}
                                        />
                                    </DropdownTrigger>
                                    <DropdownMenu
                                        disallowEmptySelection
                                        aria-label="Multiple selection actions"
                                        selectionMode="multiple"
                                        selectedKeys={postContentLanguages}
                                        onSelectionChange={(e) => {
                                            if (Array.from(e).length < 4) {
                                                //setPostContentLanguage(e as Set<string>);
                                            }
                                        }}
                                    >
                                        <DropdownItem key="split">
                                            {t("modal.post.splitSentence")}
                                        </DropdownItem>
                                        <DropdownItem
                                            key="linkcard"
                                            onPress={() => {
                                                window.prompt(
                                                    "Please enter link",
                                                    ""
                                                )
                                            }}
                                        >
                                            {t("modal.post.addLinkcard")}
                                        </DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            </div>
                            <div
                                className={`${footerTooltipStyle()} invisible md:visible`}
                            >
                                <Popover
                                    placement="right-end"
                                    onOpenChange={handleOnEmojiOpenChange}
                                >
                                    <PopoverTrigger>
                                        <Button
                                            isIconOnly
                                            variant="light"
                                            className={"h-[24px] text-white"}
                                        >
                                            <FontAwesomeIcon
                                                icon={faFaceLaughBeam}
                                                className={"h-[20px] mb-[4px]"}
                                            />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                        <Picker
                                            data={data}
                                            locale={i18n.language}
                                            onEmojiSelect={onEmojiClick}
                                            previewPosition="none"
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            {/*<div
                                className={`${footerTooltipStyle()} top-[-3px] h-full ${
                                    contentImages.length > 4 && "text-red"
                                }`}
                            >
                                {contentImages.length}/4
                            </div>*/}
                            <div className={footerCharacterCount()}>
                                <div
                                    className={footerCharacterCountText()}
                                    style={{
                                        color:
                                            trimedContentText().length >= 300
                                                ? "red"
                                                : "white",
                                    }}
                                >
                                    {300 - trimedContentText().length}
                                </div>
                                <div
                                    style={{
                                        width: "20px",
                                        height: "20px",
                                        marginLeft: "5px",
                                    }}
                                >
                                    <CircularProgressbar
                                        value={trimedContentText().length}
                                        maxValue={300}
                                        styles={buildStyles({
                                            pathColor:
                                                trimedContentText().length >=
                                                300
                                                    ? "red"
                                                    : "deepskyblue",
                                        })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}
