"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createPostPage } from "./styles"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faImage } from "@fortawesome/free-regular-svg-icons"
import {
    faCirclePlus,
    faFaceLaughBeam,
    faPlus,
    faShieldHalved,
    faTrash,
    faXmark,
} from "@fortawesome/free-solid-svg-icons"
import { buildStyles, CircularProgressbar } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"
import { useDropzone } from "react-dropzone"
import data from "@emoji-mart/data"
import Picker from "@emoji-mart/react"
import {
    Button,
    Chip,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Radio,
    RadioGroup,
    Selection,
    Spinner,
    Textarea as NextUITextarea,
    useDisclosure,
} from "@nextui-org/react"

import Textarea from "react-textarea-autosize" // 追加
import { useRouter, useSearchParams } from "next/navigation"
import { useAgent } from "@/app/_atoms/agent"
import { useUserProfileDetailedAtom } from "../_atoms/userProfileDetail"
import imageCompression, {
    Options as ImageCompressionOptions,
} from "browser-image-compression"

import i18n from "@/app/_i18n/config"

import {
    AppBskyEmbedImages,
    AppBskyEmbedRecord,
    AppBskyFeedPost,
    BlobRef,
    RichText,
} from "@atproto/api"

import { Linkcard } from "@/app/_components/Linkcard"
import { useTranslation } from "react-i18next"
import { useNextQueryParamsAtom } from "../_atoms/nextQueryParams"
import { LANGUAGES } from "../_constants/lanuages"
import LanguagesSelectionModal from "../_components/LanguageSelectionModal"
import { useQueryClient } from "@tanstack/react-query"
import { usePostLanguage } from "@/app/_atoms/postLanguage"
import { ViewFeedCard } from "@/app/_components/ViewFeedCard"
import { ViewMuteListCard } from "@/app/_components/ViewMuteListCard"

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
    const queryClient = useQueryClient()

    const [userProfileDetailed] = useUserProfileDetailedAtom()
    const [agent] = useAgent()
    const router = useRouter()
    const [nextQueryParams] = useNextQueryParamsAtom()

    const [PostLanguage, setPostLanguage] = usePostLanguage()

    useEffect(() => {
        if (
            Array.from(PostLanguage).length === 1 &&
            Array.from(PostLanguage)[0] === "" &&
            !localStorage.getItem("postLanguage")
        ) {
            let defaultLanguage

            if (
                window &&
                window.navigator.languages &&
                window.navigator.languages[0]
            ) {
                defaultLanguage = [window.navigator.languages[0]]
            } else {
                defaultLanguage = ["en"]
            }
            setPostLanguage(defaultLanguage)
        }
    }, [PostLanguage])

    const inputId = Math.random().toString(32).substring(2)
    const [contentText, setContentText] = useState(postParam ? postParam : "")
    const [contentImages, setContentImages] = useState<AttachmentImage[]>([])
    const [loading, setLoading] = useState(false)
    const [isDetectedURL, setIsDetectURL] = useState(false)
    const [detectedURLs, setDetectURLs] = useState<string[]>([])
    const [selectedURL, setSelectedURL] = useState<string>("")
    const [isOGPGetProcessing, setIsOGPGetProcessing] = useState(false)
    const [getOGPData, setGetOGPData] = useState<any>(null)
    const [getFeedData, setGetFeedData] = useState<any>(null)
    const [getListData, setGetListData] = useState<any>(null)
    const [, setIsGetOGPFetchError] = useState(false)
    const [isCompressing, setIsCompressing] = useState(false)
    const [OGPImage, setOGPImage] = useState<any>([])
    const [adultContent, setAdultContent] = useState<
        boolean | "suggestive" | "nudity" | "porn"
    >(false)

    const [selectedAdultContent, setSelectedAdultContent] = useState<
        boolean | "suggestive" | "nudity" | "porn"
    >(false)

    const textareaRef = useRef<HTMLTextAreaElement>(null)
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
    const {
        isOpen: isOpenModerations,
        onOpen: onOpenModerations,
        onOpenChange: onOpenChangeModerations,
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

    const handleDrop = (e: any) => {
        e.preventDefault()
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
            !getOGPData &&
            !getFeedData &&
            !getListData
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
                langs: PostLanguage,
            }

            if (getFeedData || getListData) {
                postObj.embed = {
                    $type: "app.bsky.embed.record",
                    record: getFeedData ?? getListData,
                } as AppBskyEmbedRecord.Main
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
                            : "",
                    },
                } as any
            }

            if (blobRefs.length > 0) {
                const images: AppBskyEmbedImages.Image[] = []

                for (const [index, blobRef] of blobRefs.entries()) {
                    const image: AppBskyEmbedImages.Image = {
                        image: blobRef,
                        alt: altOfImageList[index],
                    }

                    images.push(image)
                }

                if (getOGPData && OGPImage.length > 0 && postObj.embed) {
                    postObj.embed.thumb = {
                        $type: "blob",
                        ref: {
                            $link: uploadBlobRes?.data?.blob.ref.toString(),
                        },
                        mimeType: uploadBlobRes?.data?.blob.mimeType,
                        size: uploadBlobRes?.data?.blob.size,
                    }
                } else {
                    postObj.embed = {
                        $type: "app.bsky.embed.images",
                        images,
                    } as AppBskyEmbedImages.Main
                }
            }

            if (adultContent && (getOGPData || contentImages.length > 0)) {
                postObj.labels = {
                    $type: "com.atproto.label.defs#selfLabels",
                    values: [
                        {
                            val: adultContent,
                        },
                    ],
                }
            }
            await agent.post(postObj)

            //queryClient.clear() 動く
            await queryClient.refetchQueries({
                queryKey: ["getFeed", "following"],
            })
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

    function isFeedURL(url: string): boolean {
        const regex = /^https:\/\/bsky\.app\/profile\/[^/]+\/feed\/[^/]+$/
        return regex.test(url)
    }

    function isListURL(url: string): boolean {
        const regex = /^https:\/\/bsky\.app\/profile\/[^/]+\/lists\/[^/]+$/
        return regex.test(url)
    }

    const getListInfo = async (url: string) => {
        if (!agent) return
        const regex = /\/([^/]+)\/lists\/([^/]+)/
        const matches = url.match(regex)
        console.log("hogehoge")
        if (matches) {
            const did = matches[1]
            const feedName = matches[2]
            try {
                setIsOGPGetProcessing(true)
                const { data } = await agent.app.bsky.graph.getList({
                    list: `at://${did}/app.bsky.graph.list/${feedName}`,
                })
                console.log(data)
                setGetListData(data.list)
            } catch (e) {
                console.log(e)
            } finally {
                setIsOGPGetProcessing(false)
            }
        }
    }

    const getFeedInfo = async (url: string) => {
        if (!agent) return
        const regex = /\/([^/]+)\/feed\/([^/]+)/
        const matches = url.match(regex)
        console.log(matches)
        if (matches) {
            const did = matches[1]
            const feedName = matches[2]
            try {
                setIsOGPGetProcessing(true)
                const { data } = await agent.app.bsky.feed.getFeedGenerator({
                    feed: `at://${did}/app.bsky.feed.generator/${feedName}`,
                })
                console.log(data)
                setGetFeedData(data.view)
            } catch (e) {
            } finally {
                setIsOGPGetProcessing(false)
            }
        }
    }

    const getOGP = async (url: string) => {
        console.log(url)
        setIsOGPGetProcessing(true)
        try {
            const res = await fetch(
                `/api/getOGPData/${encodeURIComponent(url)}`,
                {
                    method: "GET",
                }
            )
            if (res.status === 200) {
                const ogp = await res.json()
                const thumb =
                    (ogp["image:secure_url"] ||
                        (ogp?.ogImage && ogp?.ogImage[0]?.url)) ??
                    undefined
                const uri = url
                const json = {
                    title: ogp?.ogTitle,
                    description: ogp?.ogDescription,
                    uri: url,
                    alt: ogp?.ogDescription || "",
                }
                if (json && thumb) {
                    const generatedURL = thumb?.startsWith("http")
                        ? thumb
                        : uri && thumb?.startsWith("/")
                          ? `${uri.replace(/\/$/, "")}${thumb}`
                          : `${uri}${uri?.endsWith("/") ? "" : "/"}${thumb}`
                    //@ts-ignore
                    json.thumb = generatedURL
                    const image = await fetch(
                        `https://ucho-ten-image-api.vercel.app/api/image?url=${generatedURL}`
                    )
                    setOGPImage([{ blob: image, type: "image/jpeg" }])
                }
                setGetOGPData(json)
                setIsOGPGetProcessing(false)
            } else {
                const json = {
                    title: url,
                    description: "",
                    thumb: "",
                    uri: url,
                    alt: "",
                }
                setGetOGPData(json)
                setIsOGPGetProcessing(false)
            }
            return res
        } catch (e) {
            setIsOGPGetProcessing(false)
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
            setPostLanguage(Array.from(keys) as string[])
        }
    }

    return (
        <>
            <LanguagesSelectionModal
                isOpen={isOpenLangs}
                onOpenChange={onOpenChangeLangs}
                onSelectionChange={handleLanguagesSelectionChange}
                PostLanguage={PostLanguage}
            />

            <Modal isOpen={isOpenALT} onOpenChange={onOpenChangeALT}>
                <ModalContent>
                    {(onCloseALT) => (
                        <>
                            <ModalHeader>{t("modal.post.editALT")}</ModalHeader>
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
                                    {t("button.cancel")}
                                </Button>
                                <Button
                                    color={"primary"}
                                    onClick={() => {
                                        onCloseALT()
                                        handleALTClick()
                                    }}
                                >
                                    {t("button.save")}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
            <Modal
                isOpen={isOpenModerations}
                onOpenChange={onOpenChangeModerations}
            >
                <ModalContent>
                    {(onCloseModerations) => (
                        <>
                            <ModalHeader>
                                {t("modal.contentWarnings.title")}
                            </ModalHeader>
                            <ModalBody>
                                <RadioGroup
                                    label={t(
                                        "modal.contentWarnings.selectDetail"
                                    )}
                                    color="warning"
                                    //@ts-ignore
                                    onValueChange={setSelectedAdultContent}
                                    //@ts-ignore
                                    defaultValue={adultContent}
                                >
                                    <Radio value="sexual">
                                        {t("modal.contentWarnings.suggestive")}
                                    </Radio>
                                    <Radio value="nudity">
                                        {t("modal.contentWarnings.nudity")}
                                    </Radio>
                                    <Radio value="porn">
                                        {t("modal.contentWarnings.porn")}
                                    </Radio>
                                </RadioGroup>
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    color="danger"
                                    variant="light"
                                    onClick={() => {
                                        setSelectedAdultContent(false)
                                        setAdultContent(false)
                                        onCloseModerations()
                                    }}
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </Button>
                                <Button
                                    color={"danger"}
                                    onClick={() => {
                                        onCloseModerations()
                                    }}
                                >
                                    {t("button.cancel")}
                                </Button>
                                <Button
                                    color={"primary"}
                                    onClick={() => {
                                        setAdultContent(selectedAdultContent)
                                        console.log(selectedAdultContent)
                                        onCloseModerations()
                                    }}
                                >
                                    {t("button.add")}
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
                <div className={backgroundColor()} />
                {isOpen && window.prompt("Please enter link", "Harry Potter")}
                <div className={PostModal()}>
                    <div className={header()}>
                        <Button
                            variant="light"
                            className={headerCancelButton()}
                            isDisabled={loading}
                            onClick={() => {
                                router.back()
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
                                    !getOGPData &&
                                    !getFeedData)
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
                                        getOGPData !== null ||
                                        getFeedData !== null ||
                                        getListData !== null,
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
                                            <img
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
                                !getFeedData &&
                                !getListData &&
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
                                                        if (isFeedURL(url)) {
                                                            getFeedInfo(url)
                                                        } else if (
                                                            isListURL(url)
                                                        ) {
                                                            console.log("list")
                                                            getListInfo(url)
                                                        } else {
                                                            void getOGP(url)
                                                        }
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
                            {(getFeedData || getOGPData || getListData) && (
                                <div
                                    className={`${contentRightUrlCard()} flex relative`}
                                >
                                    <div
                                        className={`${contentRightUrlCardDeleteButton()} absolute z-10 right-[10px] top-[10px]`}
                                        onClick={() => {
                                            setGetFeedData(undefined)
                                            setGetListData(undefined)
                                            setGetOGPData(undefined)
                                        }}
                                    >
                                        <FontAwesomeIcon
                                            icon={faXmark}
                                            size={"lg"}
                                        />
                                    </div>
                                    {getOGPData && (
                                        <Linkcard ogpData={getOGPData} />
                                    )}
                                    {getFeedData && (
                                        <ViewFeedCard feed={getFeedData} />
                                    )}
                                    {getListData && (
                                        <ViewMuteListCard list={getListData} />
                                    )}
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
                                        getOGPData ||
                                        getFeedData ||
                                        getListData ||
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
                                        getOGPData ||
                                        getFeedData ||
                                        getListData ||
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
                                PostLanguage
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
                                            PostLanguage
                                        )}`}
                                    </DropdownTrigger>
                                    <DropdownMenu
                                        disallowEmptySelection
                                        aria-label="Multiple selection actions"
                                        selectionMode="single"
                                        selectedKeys={PostLanguage}
                                        defaultSelectedKeys={PostLanguage}
                                        onSelectionChange={(e) => {
                                            console.log(Array.from(e))
                                            if (Array.from(e).length < 4) {
                                                setPostLanguage(
                                                    Array.from(e) as string[]
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
                                        selectionMode="single"
                                        selectedKeys={PostLanguage}
                                        onSelectionChange={(e) => {
                                            console.log(e)
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
                            <div className={`${footerTooltipStyle()}`}>
                                <Button
                                    isIconOnly
                                    variant="light"
                                    className={"h-[24px] text-white"}
                                    onClick={() => {
                                        onOpenModerations()
                                    }}
                                    isDisabled={
                                        !getOGPData &&
                                        !getFeedData &&
                                        !getListData &&
                                        contentImages.length === 0
                                    }
                                >
                                    <FontAwesomeIcon
                                        icon={faShieldHalved}
                                        className={`h-[20px] mb-[4px] ${adultContent && `text-[#18C965]`}`}
                                    />
                                </Button>
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
