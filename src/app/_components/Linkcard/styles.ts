import { tv } from "@nextui-org/react"

export const linkcard = tv({
    slots: {
        LinkCard:
            "h-[100px] w-full rounded-lg overflow-hidden border border-gray-600 flex items-center text-gray-800",
        LinkCardThumbnailContainer:
            "h-[100px] w-[100px] border-r border-gray-600",
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
                LinkCard: "bg-white text-black hover:bg-[#DBDBDB]",
                LinkCardTitle: "text-black",
            },
            dark: {
                LinkCard: "hover:bg-[#1C1C1C]",
                LinkCardTitle: "text-white",
                LinkCardDescription: "text-gray-200",
                LinkCardSiteName: "",
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
