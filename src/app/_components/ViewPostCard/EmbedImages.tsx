import { ScrollShadow } from "@nextui-org/react"
import { AppBskyEmbedImages } from "@atproto/api"
import { ViewImage } from "@atproto/api/dist/client/types/app/bsky/embed/images"
import { unstable_getImgProps as getImgProps } from "next/dist/shared/lib/image-external"
import React from "react"

interface EmbedImagesProps {
    embedImages: AppBskyEmbedImages.View
    onImageClick: (images: ViewImage[], index: number) => void
    isEmbedToModal?: boolean
}

const EmbedImages = ({
    embedImages,
    onImageClick,
    isEmbedToModal,
}: EmbedImagesProps) => {
    return (
        !isEmbedToModal && (
            <ScrollShadow
                isEnabled={embedImages.images.length > 1}
                hideScrollBar={true}
                orientation="horizontal"
                className={`flex overflow-x-auto overflow-y-hidden w-100svw}]`}
            >
                {embedImages.images.map((image: ViewImage, index: number) => (
                    <div
                        className={`mt-[10px] rounded-[7.5px] overflow-hidden min-w-[280px] max-w-[500px] h-[300px] ${
                            embedImages.images.length - 1 === index
                                ? `mr-[0px]`
                                : `mr-[7px]`
                        } bg-cover`}
                        key={`image-${index}`}
                    >
                        <div className={"w-full h-full relative"}>
                            <img
                                className="w-full h-full z-0 object-cover"
                                {...getImgProps({
                                    alt: image.alt || "",
                                    fill: true,
                                    src: image.thumb,
                                }).props}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onImageClick(embedImages.images, index)
                                }}
                            />
                        </div>
                    </div>
                ))}
            </ScrollShadow>
        )
    )
}

export default EmbedImages
