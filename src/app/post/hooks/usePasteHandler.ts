// usePasteHandler.ts

interface AttachmentImage {
    blob: Blob
    type: string
    isFailed?: boolean
}

export const usePasteHandler = async (
    event: React.ClipboardEvent,
    contentImages: AttachmentImage[],
    addImages: (
        imageFiles: File[],
        contentImages: AttachmentImage[],
        setContentImages: React.Dispatch<
            React.SetStateAction<AttachmentImage[]>
        >,
        setIsCompressing: React.Dispatch<React.SetStateAction<boolean>>
    ) => Promise<void>,
    MAX_ATTACHMENT_IMAGES: number,
    setContentImages: React.Dispatch<React.SetStateAction<AttachmentImage[]>>,
    setIsCompressing: React.Dispatch<React.SetStateAction<boolean>>
) => {
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
        await addImages(
            imageFiles,
            contentImages,
            setContentImages,
            setIsCompressing
        )
    }
}
