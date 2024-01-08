import React, { memo, useRef } from "react"
import "yet-another-react-lightbox/styles.css"
import "yet-another-react-lightbox/plugins/captions.css"
import "yet-another-react-lightbox/plugins/counter.css"
import { Captions, Counter, Zoom } from "yet-another-react-lightbox/plugins"
import Lightbox, { CaptionsRef, ZoomRef } from "yet-another-react-lightbox"
import "@/app/_components/AppContainer/lightbox.css"
import { useImageGalleryAtom } from "@/app/_atoms/imageGallery"

interface Interface {
    imageSlides: any
    setImageSlides: any
    imageSlideIndex: any
    setImageSlideIndex: any
}

export const ViewLightbox = memo(
    ({
        imageSlides,
        setImageSlides,
        imageSlideIndex,
        setImageSlideIndex,
    }: Interface) => {
        const [, setImageGallery] = useImageGalleryAtom()
        const zoomRef = useRef<ZoomRef>(null)
        const captionsRef = useRef<CaptionsRef>(null)
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
                        setImageSlides(null)
                        setImageSlideIndex(null)
                    }
                }}
            >
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
                        setImageSlides(null)
                        setImageSlideIndex(null)
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
            </div>
        )
    }
)

export default ViewLightbox
