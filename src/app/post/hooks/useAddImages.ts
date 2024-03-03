// useAddImages.ts

import imageCompression, {
    Options as ImageCompressionOptions,
} from "browser-image-compression"

interface AttachmentImage {
    blob: Blob
    type: string
    isFailed?: boolean
}

export const useAddImages = async (
    imageFiles: File[],
    contentImages: AttachmentImage[],
    setContentImages: React.Dispatch<React.SetStateAction<AttachmentImage[]>>,
    setIsCompressing: React.Dispatch<React.SetStateAction<boolean>>
) => {
    const currentImagesCount = contentImages.length

    if (currentImagesCount + imageFiles.length > 4) {
        imageFiles = imageFiles.slice(0, 4 - currentImagesCount) // 不要な行を削除し、imageFiles を再代入
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

                    const compressedFile = await imageCompression(file, options)

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

    const addingImages: AttachmentImage[] = imageBlobs.filter((imageBlob) => {
        return !imageBlob.isFailed
    })

    setContentImages((currentImages) => [...currentImages, ...addingImages])
}
