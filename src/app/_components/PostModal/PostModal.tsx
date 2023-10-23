import {
    AppBskyEmbedImages,
    AppBskyEmbedRecord,
    AppBskyFeedPost,
    BlobRef,
    BskyAgent,
    RichText,
} from "@atproto/api"
import React, {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react"
import { postModal } from "./styles"
import { BrowserView, isMobile } from "react-device-detect"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faImage } from "@fortawesome/free-regular-svg-icons"
import {
    faCirclePlus,
    faFaceLaughBeam,
    faPen,
    faPlus,
    faXmark,
} from "@fortawesome/free-solid-svg-icons"
import "react-circular-progressbar/dist/styles.css"
import {
    Button,
    Chip,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Image,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Spinner,
    useDisclosure,
} from "@nextui-org/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAgent } from "@/app/_atoms/agent"
import Textarea from "react-textarea-autosize"
import Picker from "@emoji-mart/react"
import data from "@emoji-mart/data"
import { buildStyles, CircularProgressbar } from "react-circular-progressbar"
import { useDropzone } from "react-dropzone"
import { ViewPostCard } from "@/app/_components/ViewPostCard"
import { useUserProfileDetailedAtom } from "@/app/_atoms/userProfileDetail"
import { Linkcard } from "@/app/_components/Linkcard"
import imageCompression, {
    Options as ImageCompressionOptions,
} from "browser-image-compression"
import { useTranslation } from "react-i18next"
import { useNextQueryParamsAtom } from "@/app/_atoms/nextQueryParams"

export type PostRecordPost = Parameters<BskyAgent["post"]>[0]

interface AttachmentImage {
    blob: Blob
    type: string
    isFailed?: boolean
}

interface Props {
    children?: React.ReactNode
    color: "light" | "dark"
    type?: "Post" | "Reply" | `Quote`
    postData?: any
    onClose: (isClosed: boolean) => void
}

export const PostModal: React.FC<Props> = (props: Props) => {
    const { color, type, postData } = props
    const [userProfileDetailedAtom, setUserProfileDetailedAtom] =
        useUserProfileDetailedAtom()
    const { t } = useTranslation()
    const [agent, setAgent] = useAgent()
    const [nextQueryParams] = useNextQueryParamsAtom()
    const searchParams = useSearchParams()
    const postParam = searchParams.get("text")
    const reg =
        /^[\u0009-\u000d\u001c-\u0020\u11a3-\u11a7\u1680\u180e\u2000-\u200f\u202f\u205f\u2060\u3000\u3164\ufeff\u034f\u2028\u2029\u202a-\u202e\u2061-\u2063]*$/
    const [PostContentLanguage, setPostContentLanguage] = useState(
        new Set<string>([])
    )
    const inputId = Math.random().toString(32).substring(2)
    const [contentText, setContentText] = useState(postParam ? postParam : "")
    const [contentImages, setContentImages] = useState<AttachmentImage[]>([])
    const [loading, setLoading] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const hiddenInput = useRef<HTMLDivElement>(null)
    const [isDetectedURL, setIsDetectURL] = useState(false)
    const [detectedURLs, setDetectURLs] = useState<string[]>([])
    const [selectedURL, setSelectedURL] = useState<string>("")
    const [isOGPGetProcessing, setIsOGPGetProcessing] = useState(false)
    const [isSetURLCard, setIsSetURLCard] = useState(false)
    const [getOGPData, setGetOGPData] = useState<any>(null)
    const [isGetOGPFetchError, setIsGetOGPFetchError] = useState(false)
    const [compressProcessing, setCompressProcessing] = useState(false)
    const [isCompressing, setIsCompressing] = useState(false)
    const [OGPImage, setOGPImage] = useState<any>([])
    const {
        PostModal,
        header,
        headerTitle,
        headerPostButton,
        headerCancelButton,
        content,
        contentContainer,
        contentLeft,
        contentLeftAuthorIcon,
        contentLeftAuthorIconImage,
        contentRight,
        contentRightTextArea,
        contentRightImagesContainer,
        contentRightUrlCard,
        contentRightUrlCardDeleteButton,
        URLCard,
        URLCardThumbnail,
        URLCardDetail,
        URLCardDetailContent,
        URLCardTitle,
        URLCardDescription,
        URLCardLink,
        footer,
        footerTooltip,
        footerCharacterCount,
        footerCharacterCountText,
        footerTooltipStyle,
        dropdown,
        popover,
        ImageDeleteButton,
        ImageAddALTButton,
        ImageEditButton,
    } = postModal()
    const { isOpen, onOpen, onOpenChange } = useDisclosure()
    const [darkMode, setDarkMode] = useState(false)
    const modeMe = (e: any) => {
        setDarkMode(!!e.matches)
    }

    useEffect(() => {
        setPostContentLanguage(new Set([navigator.language]))
        console.log(window.history.state)
        const matchMedia = window.matchMedia("(prefers-color-scheme: dark)")
        setDarkMode(matchMedia.matches)
        matchMedia.addEventListener("change", modeMe)
        return () => matchMedia.removeEventListener("change", modeMe)
    }, [])

    const trimedContentText = (): string => {
        return contentText.trim()
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            handlePostClick()
        }
    }

    const onDrop = useCallback(async (files: File[]) => {
        addImages(files)
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
        console.log(agent)
        if (!agent) return
        if (trimedContentText() === "") return
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
                langs: Array.from(PostContentLanguage),
            }

            if (type === "Reply") {
                const reply = {
                    root: {
                        uri: postData.uri,
                        cid: postData.cid,
                    },
                    parent: {
                        uri: postData.uri,
                        cid: postData.cid,
                    },
                } as any
                postObj.reply = reply
            } else if (type === "Quote") {
                console.log("hoge")
                const embed = {
                    $type: "app.bsky.embed.record",
                    record: postData,
                } as AppBskyEmbedRecord.Main
                postObj.embed = embed
            }
            if (blobRefs.length > 0) {
                const images: AppBskyEmbedImages.Image[] = []

                for (const blobRef of blobRefs) {
                    const image: AppBskyEmbedImages.Image = {
                        image: blobRef,
                        alt: "",
                    }

                    images.push(image)
                }
                if (getOGPData) {
                    const embed = {
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
                    postObj.embed = embed
                } else {
                    if (
                        postObj?.embed &&
                        postObj.embed.$type === "app.bsky.embed.record"
                    ) {
                        const { embed } = postObj

                        if (!embed.media) {
                            embed.media = {}
                        }

                        ;(embed.media as any).$type =
                            "app.bsky.embed.images" as string
                        ;(embed.media as any).images = images
                        embed.$type = "app.bsky.embed.recordWithMedia"
                        delete embed.record
                        embed.record = { record: postData }

                        console.log(postObj)
                    } else {
                        const embed = {
                            $type: "app.bsky.embed.images",
                            images,
                        } as AppBskyEmbedImages.Main

                        postObj.embed = embed
                    }
                }
            }
            console.log(postObj)
            const res = await agent.post(postObj)
            props.onClose(true)
            console.log("hoge")
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
            addImages(imageFiles)
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
            imageFiles.map(async (file, index) => {
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

    const onEmojiClick = (event: any) => {
        if (textareaRef.current) {
            const target = textareaRef.current
            const cursorPosition = target.selectionStart
            const content = `${contentText.slice(0, cursorPosition)}${
                event.native
            }${contentText.slice(cursorPosition, contentText.length)}`
            setContentText(content)
        } else {
            setContentText(contentText + event.native)
        }
    }

    // ドラッグをキャンセルする
    const handleDragStart = (e: any) => {
        e.preventDefault()
    }

    const userList = [
        {
            name: "John Doe",
            avatar: "https://i.pravatar.cc/100?img=1",
            did: "did:plc:txandrhc7afdozk6a2itgltm",
        },
        {
            name: "Jane Doe",
            avatar: "https://i.pravatar.cc/100?img=2",
            did: "did:plc:txandrhc7afdozk6a2itgltm",
        },
        {
            name: "Kate Doe",
            avatar: "https://i.pravatar.cc/100?img=3",
            did: "did:plc:txandrhc7afdozk6a2itgltm",
        },
        {
            name: "Mark Doe",
            avatar: "https://i.pravatar.cc/100?img=4",
            did: "did:plc:txandrhc7afdozk6a2itgltm",
        },
    ]

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
            const thumb = res?.image
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

    const scrollBottomRef = useRef<HTMLDivElement>(null)

    useLayoutEffect(() => {
        // 以下はtypescriptの書き方。jsの場合は
        // if(scrollBottomRef && scrollBottomRef.current) {
        //   scrollBottomRef.current.scrollIntoView()
        // }
        scrollBottomRef?.current?.scrollIntoView()
    }, [])

    return (
        <>
            {isOpen && window.prompt("Please enter link", "Harry Potter")}
            <div className={PostModal({ color: color, isMobile: isMobile })}>
                <div className={header()}>
                    <Button
                        variant="light"
                        className={headerCancelButton()}
                        isDisabled={loading}
                        onClick={() => {
                            props.onClose(true)
                        }}
                    >
                        {t("button.cancel")}
                    </Button>
                    <div className={headerTitle()}>
                        {type === "Reply"
                            ? t(`modal.post.reply`)
                            : t(`modal.post.quote`)}
                    </div>
                    <Button
                        className={headerPostButton()}
                        radius={"full"}
                        color={"primary"}
                        onPress={() => {
                            handlePostClick()
                        }}
                        isDisabled={
                            loading ||
                            trimedContentText().length === 0 ||
                            trimedContentText().length > 300
                        }
                        isLoading={loading}
                    >
                        {loading ? "" : t("button.post")}
                    </Button>
                </div>
                <div
                    className={`ModalContent ${content({
                        isDragActive: isDragActive,
                    })}`}
                    {...getRootProps({
                        onDrop: handleDrop,
                        onDragOver: handleDragOver,
                        onClick: (e) => {
                            e.stopPropagation()
                            e.preventDefault()
                        },
                    })}
                >
                    <div className={"w-full"}>
                        <ViewPostCard
                            color={color}
                            postJson={postData}
                            isMobile={isMobile}
                            isEmbedToModal={true}
                            nextQueryParams={nextQueryParams}
                        />
                    </div>
                    <div
                        className={`${contentContainer()} h-[90%]`}
                        ref={scrollBottomRef}
                    >
                        <div className={contentLeft()}>
                            <div
                                style={{
                                    backgroundColor: "white",
                                    width: "2px",
                                    height: "999px",
                                    position: "relative",
                                    top: -990,
                                    left: 14,
                                    zIndex: 1,
                                }}
                            />
                            <div className={contentLeftAuthorIcon()}>
                                <img
                                    className={contentLeftAuthorIconImage()}
                                    alt={"author icon"}
                                    onDragStart={handleDragStart}
                                    src={userProfileDetailedAtom?.avatar}
                                />
                            </div>
                        </div>
                        <div className={contentRight()}>
                            <Textarea
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
                                }}
                                onKeyDown={handleKeyDown}
                                disabled={loading}
                                onFocus={(e) =>
                                    e.currentTarget.setSelectionRange(
                                        e.currentTarget.value.length,
                                        e.currentTarget.value.length
                                    )
                                }
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
                                                    onClick={() =>
                                                        handleOnRemoveImage(
                                                            index
                                                        )
                                                    }
                                                >
                                                    ALT
                                                </button>
                                            </div>
                                            <div
                                                style={{
                                                    zIndex: "10",
                                                    position: "absolute",
                                                    bottom: 5,
                                                    right: "20px",
                                                }}
                                            >
                                                <button
                                                    className={ImageEditButton()}
                                                    onClick={() =>
                                                        handleOnRemoveImage(
                                                            index
                                                        )
                                                    }
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faPen}
                                                        size="sm"
                                                        className={" mb-[2px]"}
                                                    />
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
                                                    className={`w-full ${color}`}
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
                                                        getOGP(url)
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
                                    <Linkcard color={color} skeleton={true} />
                                </div>
                            )}
                            {isSetURLCard &&
                                getOGPData &&
                                !isOGPGetProcessing && (
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
                                        <Linkcard
                                            color={color}
                                            ogpData={getOGPData}
                                        />
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
                <div className={footer({ color: color })}>
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
                                type="file"
                                multiple
                                accept="image/*,.png,.jpg,.jpeg"
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                ) => handleOnAddImage(e)}
                                disabled={
                                    loading ||
                                    isCompressing ||
                                    contentImages.length >= 4 ||
                                    getOGPData ||
                                    isOGPGetProcessing
                                }
                            />
                        </label>
                        <div
                            className={footerTooltipStyle()}
                            style={{ bottom: "5%" }}
                        >
                            <Dropdown
                                backdrop="blur"
                                className={dropdown({ color: color })}
                            >
                                <DropdownTrigger>
                                    {`${t("modal.post.lang")}:${Array.from(
                                        PostContentLanguage
                                    ).join(",")}`}
                                </DropdownTrigger>
                                <DropdownMenu
                                    disallowEmptySelection
                                    aria-label="Multiple selection actions"
                                    selectionMode="multiple"
                                    selectedKeys={PostContentLanguage}
                                    onSelectionChange={(e) => {
                                        if (Array.from(e).length < 4) {
                                            setPostContentLanguage(
                                                e as Set<string>
                                            )
                                        }
                                    }}
                                >
                                    <DropdownItem key="es">
                                        Espalier
                                    </DropdownItem>
                                    <DropdownItem key="fr">
                                        Francais
                                    </DropdownItem>
                                    <DropdownItem key="de">
                                        Deutsch
                                    </DropdownItem>
                                    <DropdownItem key="it">
                                        Italiano
                                    </DropdownItem>
                                    <DropdownItem key="pt">
                                        Portuguese
                                    </DropdownItem>
                                    <DropdownItem key="ru">
                                        Русский
                                    </DropdownItem>
                                    <DropdownItem key="zh">中文</DropdownItem>
                                    <DropdownItem key="ko">한국어</DropdownItem>
                                    <DropdownItem key="en">
                                        English
                                    </DropdownItem>
                                    <DropdownItem key="ja">日本語</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </div>
                        <div className={footerTooltipStyle()}>
                            <Dropdown
                                backdrop="blur"
                                className={dropdown({ color: color })}
                            >
                                <DropdownTrigger>
                                    <FontAwesomeIcon
                                        icon={faCirclePlus}
                                        className={
                                            "h-[20px] mb-[4px] text-white"
                                        }
                                    />
                                </DropdownTrigger>
                                <DropdownMenu
                                    disallowEmptySelection
                                    aria-label="Multiple selection actions"
                                    selectionMode="multiple"
                                    selectedKeys={PostContentLanguage}
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
                        <BrowserView>
                            <div className={footerTooltipStyle()}>
                                <Popover
                                    placement="right-end"
                                    className={popover({ color: color })}
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
                                            onEmojiSelect={onEmojiClick}
                                            theme={color}
                                            previewPosition="none"
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </BrowserView>
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
                                            trimedContentText().length >= 300
                                                ? "red"
                                                : "deepskyblue",
                                    })}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default PostModal
