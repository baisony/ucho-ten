import { atom, useAtom } from "jotai"

export interface ImageObject {
    fullsize: string
    alt: string
}
export interface ImageGalleryObject {
    images: ImageObject[]
    index: number
}

const imageGalleryAtom = atom<ImageGalleryObject | null>(null)

export const useImageGalleryAtom = () => useAtom(imageGalleryAtom)
