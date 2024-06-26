import { linkcard } from "./styles"
import { Spinner } from "@nextui-org/react"
import { memo } from "react"
import { SwitchingLinkATag } from "@/app/_components/Linkcard/SwitchingLinkATag"
import { External } from "@atproto/api/dist/client/types/app/bsky/embed/external"
import { OGPData } from "@/app/_types/types"
import { ViewExternal } from "@atproto/api/dist/client/types/app/bsky/embed/external"

interface Props {
    children?: React.ReactNode
    type?: "Post" | "Reply" | `Quote`
    postData?: External | ViewExternal
    ogpData?: OGPData | undefined
    skeleton?: boolean
}

export const Linkcard: React.FC<Props> = memo((props: Props) => {
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

    return !skeleton && ogpData ? (
        <div className={"w-full"}>
            <SwitchingLinkATag link={ogpData?.uri}>
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
                                        src={generatedURL || ""}
                                        className={LinkCardThumbnail()}
                                        alt={ogpData?.alt || "thumbnail"}
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
                                        <div className="text-gray-400 w-full">
                                            {`${new URL(ogpData?.uri).hostname}`}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </SwitchingLinkATag>
        </div>
    ) : (
        <div className={"w-full"}>
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
                                    src={generatedURL || ""}
                                    className={LinkCardThumbnail()}
                                    alt={ogpData?.alt || "thumbnail"}
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
                                    {ogpData && (ogpData?.title || "No Title")}
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
                                    {ogpData && (ogpData?.description || "")}
                                </div>
                                <div className={LinkCardSiteName()}>
                                    <div className="text-gray-400 w-full">
                                        {`${new URL(ogpData?.uri as string).hostname}`}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
})
