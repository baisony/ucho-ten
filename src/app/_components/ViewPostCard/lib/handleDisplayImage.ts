import { ViewImage } from "@atproto/api/dist/client/types/app/bsky/embed/images"

interface ImageObject {
    fullsize: string
    alt: string
}

interface ImageGalleryObject {
    images: ImageObject[]
    index: number
}

const useHandleImageClick = (
    setImageGallery: (gallery: ImageGalleryObject) => void,
    images: ViewImage[],
    index: number
) => {
    const hoge = (images: ViewImage[], index: number) => {
        console.log(images)
        if (images !== undefined) {
            const imageObjects: ImageObject[] = []

            for (const image of images) {
                const currentImageObject: ImageObject = {
                    fullsize: image.fullsize,
                    alt: image.alt,
                }

                imageObjects.push(currentImageObject)
            }

            if (imageObjects.length > 0) {
                const galleryObject: ImageGalleryObject = {
                    images: imageObjects,
                    index,
                }

                setImageGallery(galleryObject)
            }
        }
    }
    hoge(images, index)
}

export default useHandleImageClick
