import { ScrollShadow } from "@nextui-org/react"
import { AppBskyEmbedRecordWithMedia } from "@atproto/api"
import { ViewImage } from "@atproto/api/dist/client/types/app/bsky/embed/images"
import { ViewQuoteCard } from "../ViewQuoteCard"

interface EmbedMediaProps {
    embedMedia: AppBskyEmbedRecordWithMedia.View
    onImageClick: (images: ViewImage[], index: number) => void
    isEmbedToModal?: boolean
    nextQueryParams: URLSearchParams
}

const EmbedMedia = ({
    embedMedia,
    onImageClick,
    isEmbedToModal,
    nextQueryParams,
}: EmbedMediaProps) => {
    const images = embedMedia.media.images

    if (!images || !Array.isArray(images)) {
        return
    }

    return (
        !isEmbedToModal && (
            <>
                <ScrollShadow
                    isEnabled={images.length > 1}
                    hideScrollBar
                    orientation="horizontal"
                    className={`flex overflow-x-auto overflow-y-hidden w-100svw}]`}
                >
                    {images.map((image: ViewImage, index: number) => (
                        <div
                            className={`mt-[10px] mb-[10px] rounded-[7.5px] overflow-hidden min-w-[280px] max-w-[500px] h-[300px] mr-[10px] bg-cover`}
                            key={`image-${index}`}
                        >
                            <img
                                className={`${
                                    images.length !== 1
                                        ? `w-[280px]`
                                        : "w-full max-w-[500px]"
                                } h-[300px] z-0 object-cover`}
                                src={image.thumb}
                                alt={image.alt}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onImageClick(images, index)
                                }}
                                decoding={"async"}
                                loading={"eager"}
                                fetchPriority={"high"}
                            />
                        </div>
                    ))}
                </ScrollShadow>
                <ViewQuoteCard
                    postJson={embedMedia.record.record}
                    nextQueryParams={nextQueryParams}
                />
            </>
        )
    )
}

export default EmbedMedia
