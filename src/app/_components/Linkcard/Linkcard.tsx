import React from "react"
import { linkcard } from "./styles"
import "react-circular-progressbar/dist/styles.css"
import { Spinner } from "@nextui-org/react"
import { unstable_getImgProps as getImgProps } from "next/dist/shared/lib/image-external"

interface Props {
    children?: React.ReactNode
    type?: "Post" | "Reply" | `Quote`
    postData?: any
    ogpData?: any
    skeleton?: boolean
}

export const Linkcard: React.FC<Props> = (props: Props) => {
    const { ogpData, skeleton } = props
    const {
        LinkCard,
        LinkCardThumbnailContainer,
        LinkCardThumbnail,
        LinkCardContent,
        LinkCardTitle,
        LinkCardDescription,
        LinkCardSiteName,
    } = linkcard()
    const thumb = ogpData?.thumb
    const uri = ogpData?.uri
    const generatedURL: string | null = thumb
        ? thumb?.startsWith("http")
            ? thumb
            : uri && thumb?.startsWith("/")
            ? `${uri.replace(/\/$/, "")}${thumb}`
            : `${uri}${uri?.endsWith("/") ? "" : "/"}${thumb}`
        : null
    return (
        <div className={"w-full"}>
            <a
                href={ogpData?.uri}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={"w-full"}
            >
                <div className={LinkCard()}>
                    {skeleton ? (
                        <>
                            <div
                                className={
                                    "w-full h-full items-center justify-center flex"
                                }
                            >
                                <Spinner size="md" />
                            </div>
                        </>
                    ) : (
                        <>
                            {thumb && (
                                <div className={LinkCardThumbnailContainer()}>
                                    <img
                                        className={LinkCardThumbnail()}
                                        alt={ogpData?.alt}
                                        {...getImgProps({
                                            alt: "Thumbnail",
                                            height: 100,
                                            width: 100,
                                            src: generatedURL || "",
                                        }).props}
                                    />
                                </div>
                            )}

                            <div
                                className={`${LinkCardContent()} ${
                                    thumb
                                        ? "md:w-[calc(100%-100px)] w-[calc(100%-80px)]"
                                        : "w-full"
                                }`}
                            >
                                <div className="w-full">
                                    <div
                                        className={LinkCardTitle()}
                                        style={{
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {ogpData &&
                                            (ogpData?.title || "No Title")}
                                    </div>
                                    <div
                                        className={LinkCardDescription()}
                                        style={{
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical",
                                            display: "-webkit-box",
                                            overflow: "hidden",
                                        }}
                                    >
                                        {ogpData &&
                                            (ogpData?.description || "")}
                                    </div>
                                    <div className={LinkCardSiteName()}>
                                        <div className="text-gray-400">
                                            {
                                                ogpData?.uri.match(
                                                    /^https?:\/{2,}(.*?)(?:\/|\?|#|$)/
                                                )[1]
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </a>
        </div>
    )
}

export default Linkcard
