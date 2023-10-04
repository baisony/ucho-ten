import { atom, useAtom } from 'jotai'

export interface ImageGalleryObject {
  imageURLs: string[]
  index: number
}

const imageGalleryAtom = atom<ImageGalleryObject | null>(null)

export const useImageGalleryAtom = () => useAtom(imageGalleryAtom)