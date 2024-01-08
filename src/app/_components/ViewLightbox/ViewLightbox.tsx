import React, { memo, useEffect, useRef, useState } from "react"
import "yet-another-react-lightbox/styles.css"
import "yet-another-react-lightbox/plugins/captions.css"
import "yet-another-react-lightbox/plugins/counter.css"
import { Captions, Counter, Zoom } from "yet-another-react-lightbox/plugins"
import Lightbox, {
    CaptionsRef,
    Slide,
    ZoomRef,
} from "yet-another-react-lightbox"
import "@/app/_components/AppContainer/lightbox.css"
import { useImageGalleryAtom } from "@/app/_atoms/imageGallery"

export const ViewLightbox = memo(() => {
    const [imageSlides, setImageSlides] = useState<Slide[] | undefined>(
        undefined
    )
    const [imageSlideIndex, setImageSlideIndex] = useState<number | undefined>(
        undefined
    )
    const [imageGallery, setImageGallery] = useImageGalleryAtom()
    const zoomRef = useRef<ZoomRef>(null)
    const captionsRef = useRef<CaptionsRef>(null)

    useEffect(() => {
        if (imageGallery && imageGallery.images.length > 0) {
            const slides: Slide[] = []

            for (const image of imageGallery.images) {
                slides.push({
                    src: image.fullsize,
                    description: image.alt,
                })
            }

            setImageSlideIndex(imageGallery.index)
            setImageSlides(slides)
        }
    }, [imageGallery])
    return (
        <div
            onClick={(e) => {
                const clickedElement = e.target as HTMLDivElement

                console.log(e.target)
                if (
                    clickedElement.classList.contains("yarl__fullsize") ||
                    clickedElement.classList.contains("yarl__flex_center")
                ) {
                    setImageGallery(null)
                    setImageSlides(undefined)
                    setImageSlideIndex(undefined)
                }
            }}
        >
            {imageSlides && imageSlideIndex !== null && (
                <Lightbox
                    open={true}
                    index={imageSlideIndex}
                    plugins={[Zoom, Captions, Counter]}
                    zoom={{
                        ref: zoomRef,
                        scrollToZoom: true,
                    }}
                    captions={{
                        ref: captionsRef,
                        showToggle: true,
                        descriptionMaxLines: 2,
                        descriptionTextAlign: "start",
                    }}
                    close={() => {
                        setImageGallery(null)
                        setImageSlides(undefined)
                        setImageSlideIndex(undefined)
                    }}
                    slides={imageSlides}
                    carousel={{
                        finite: imageSlides.length <= 5,
                    }}
                    render={{
                        buttonPrev:
                            imageSlides.length <= 1 ? () => null : undefined,
                        buttonNext:
                            imageSlides.length <= 1 ? () => null : undefined,
                    }}
                />
            )}
        </div>
    )
})

export default ViewLightbox
