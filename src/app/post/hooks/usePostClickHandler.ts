// usePostClickHandler.ts
import {
    AppBskyEmbedImages,
    AppBskyEmbedRecord,
    AppBskyFeedPost,
    BlobRef,
    BskyAgent,
    RichText,
} from "@atproto/api"

interface AttachmentImage {
    blob: Blob
    type: string
    isFailed?: boolean
}

export const usePostClickHandler = async (
    agent: BskyAgent | undefined,
    trimedContentText: () => string,
    contentImages: AttachmentImage[],
    OGPImage: any[],
    setOGPImage: React.Dispatch<React.SetStateAction<any[]>>,
    setPostLanguage: React.Dispatch<React.SetStateAction<string[]>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    postData: any,
    type: string,
    getOGPData: any,
    getFeedData: any,
    getListData: any,
    selectedURL: string,
    PostLanguage: string[],
    altOfImageList: string[],
    adultContent: boolean,
    queryClient: any,
    onClose: (param: boolean) => void,
    modalType: "PostModal" | "PostPage",
    router?: any,
    nextQueryParams?: URLSearchParams
) => {
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
            const uint8array = new Uint8Array(await image.blob.arrayBuffer())
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
            langs: Array.from(PostLanguage),
        }

        if (type === "Reply") {
            postObj.reply = {
                root: {
                    uri: postData?.record?.reply?.root?.uri ?? postData.uri,
                    cid: postData?.record?.reply?.root?.cid ?? postData.cid,
                },
                parent: {
                    uri: postData.uri,
                    cid: postData.cid,
                },
            } as any
        } else if (type === "Quote") {
            console.log("Quote")
            postObj.embed = {
                $type: "app.bsky.embed.record",
                record: postData,
            } as AppBskyEmbedRecord.Main
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
                    title: getOGPData?.title ? getOGPData.title : selectedURL,
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

            if (
                getOGPData &&
                OGPImage.length > 0 &&
                postObj.embed &&
                postObj.embed.external
            ) {
                ;(postObj.embed.external as any).thumb = {
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

        if (
            adultContent &&
            (getOGPData ||
                getListData ||
                getFeedData ||
                contentImages.length > 0)
        ) {
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
        await queryClient.refetchQueries({
            queryKey: ["getFeed", "following"],
        })
        if (modalType === "PostModal") {
            onClose(true)
        } else if (modalType === "PostPage") {
            router.push(`/home?${nextQueryParams?.toString()}`)
        }

        console.log("hoge")
    } catch (e) {
        console.log(e)
    } finally {
        setLoading(false)
    }
}
