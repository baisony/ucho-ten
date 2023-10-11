import { BskyAgent } from "@atproto/api"
import React from "react"
import { linkcard } from "./styles"
import "react-circular-progressbar/dist/styles.css"
import { Spinner } from "@nextui-org/react"

export type PostRecordPost = Parameters<BskyAgent["post"]>[0]

interface Props {
    children?: React.ReactNode
    color: "light" | "dark"
    type?: "Post" | "Reply" | `Quote`
    postData?: any
    OGPData?: any
    skeleton?: boolean
}

export const Linkcard: React.FC<Props> = (props: Props) => {
    const { color, type, postData, OGPData, skeleton } = props
    const {
        LinkCard,
        LinkCardThumbnailContainer,
        LinkCardThumbnail,
        LinkCardContent,
        LinkCardTitle,
        LinkCardDescription,
        LinkCardSiteName,
    } = linkcard()
    const thumb = OGPData?.thumb
    const uri = OGPData?.uri
    const generatedURL = thumb?.startsWith("http")
        ? thumb
        : uri && thumb?.startsWith("/")
        ? `${uri.replace(/\/$/, "")}${thumb}`
        : `${uri}${uri?.endsWith("/") ? "" : "/"}${thumb}`
    return (
        <>
            <a
                href={OGPData?.uri}
                target="_blank"
                rel="noopener noreferrer"
                onMouseUp={(e) => e.stopPropagation()}
                className={"w-full"}
            >
                <div
                    className={LinkCard({
                        color: color,
                    })}
                >
                    <div className={LinkCardThumbnailContainer()}>
                        {!skeleton ? (
                            <img
                                src={generatedURL}
                                className={LinkCardThumbnail()}
                                alt={OGPData?.alt}
                            />
                        ) : (
                            <div
                                style={{
                                    position: "relative",
                                    textAlign: "center",
                                    top: "50%",
                                    left: "50%",
                                    transform:
                                        "translateY(-50%) translateX(-50%)",
                                    WebkitTransform:
                                        "translateY(-50%) translateX(-50%)",
                                }}
                            >
                                <Spinner size="md" />
                            </div>
                        )}
                    </div>
                    <div className={LinkCardContent()}>
                        <div className="w-full min-w-0">
                            <div
                                className={LinkCardTitle({
                                    color: color,
                                })}
                            >
                                {OGPData && (OGPData?.title || "No Title")}
                            </div>
                            <div
                                className={LinkCardDescription({
                                    color: color,
                                })}
                                style={{
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    display: "-webkit-box",
                                    overflow: "hidden",
                                }}
                            >
                                {OGPData &&
                                    (OGPData?.description || "No Description")}
                            </div>
                            <div
                                className={LinkCardSiteName({
                                    color: color,
                                })}
                            >
                                <div className="text-gray-400">
                                    {
                                        OGPData?.uri.match(
                                            /^https?:\/{2,}(.*?)(?:\/|\?|#|$)/
                                        )[1]
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </a>
        </>
    )
}

export default Linkcard
