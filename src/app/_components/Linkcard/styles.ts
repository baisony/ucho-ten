import { tv } from "@nextui-org/react"

export const linkcard = tv({
    slots: {
        LinkCard:
            "md:h-[100px] h-[80px] w-full rounded-lg overflow-hidden border md:hover:border-gray-600 flex items-center text-gray-800",
        LinkCardThumbnailContainer:
            "md:h-[100px] h-[80px] md:w-[100px] w-[80px] border-r md:hover:border-gray-600",
        LinkCardThumbnail: "object-cover w-full h-full z-0",
        LinkCardContent: "flex items-center ml-2 h-full",
        LinkCardTitle:
            "text-sm font-bold whitespace-nowrap overflow-hidden overflow-ellipsis",
        LinkCardDescription: "text-xs mt-1",
        LinkCardSiteName: "text-xs mt-1 text-gray-400",
    },
    variants: {
        color: {
            light: {
                LinkCard:
                    "bg-white text-black md:hover:bg-[#DBDBDB] border-[#E8E8E8]",
                LinkCardTitle: "text-black",
                LinkCardThumbnailContainer: "border-[#E8E8E8]",
            },
            dark: {
                LinkCard: "md:hover:bg-[#1C1C1C] border-[#181818]",
                LinkCardTitle: "text-white",
                LinkCardDescription: "text-gray-200",
                LinkCardSiteName: "",
                LinkCardThumbnailContainer: "border-[#181818]",
            },
        },
        isMobile: {
            true: {
                PostModal: "rounded-none",
                background: "",
            },
            false: {
                PostModal: "rounded-[10px] overflow-hidden min-h-[400px] ",
                background: "",
            },
        },
    },
})
