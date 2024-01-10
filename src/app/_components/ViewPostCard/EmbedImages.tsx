import { ScrollShadow } from "@nextui-org/react"
import { AppBskyEmbedImages } from "@atproto/api"
import { ViewImage } from "@atproto/api/dist/client/types/app/bsky/embed/images"
import { memo } from "react"

interface EmbedImagesProps {
    embedImages: AppBskyEmbedImages.View
    onImageClick: (images: ViewImage[], index: number) => void
    isEmbedToModal?: boolean
}

const EmbedImages = memo(
    ({ embedImages, onImageClick, isEmbedToModal }: EmbedImagesProps) => {
        return (
            !isEmbedToModal && (
                <ScrollShadow
                    isEnabled={embedImages.images.length > 1}
                    hideScrollBar={true}
                    orientation="horizontal"
                    className={`flex overflow-x-auto overflow-y-hidden w-100svw}]`}
                >
                    {embedImages.images.map(
                        (image: ViewImage, index: number) => (
                            <div
                                className={`mt-[10px] rounded-[7.5px] overflow-hidden min-w-[280px] max-w-[500px] h-[300px] ${
                                    embedImages.images.length - 1 === index
                                        ? `mr-[0px]`
                                        : `mr-[7px]`
                                } bg-cover`}
                                key={`image-${index}`}
                            >
                                <img
                                    className={`${
                                        embedImages.images.length !== 1
                                            ? `w-[280px]`
                                            : "w-full max-w-[500px]"
                                    } h-[300px] z-0 object-cover`}
                                    src={image.thumb}
                                    alt={image.alt}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onImageClick(embedImages.images, index)
                                    }}
                                    decoding={"async"}
                                    loading={"eager"}
                                    fetchPriority={"high"}
                                />
                            </div>
                        )
                    )}
                </ScrollShadow>
            )
        )
    }
)

export default EmbedImages
