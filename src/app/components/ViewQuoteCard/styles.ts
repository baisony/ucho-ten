import { tv } from "@nextui-org/react"

export const viewQuoteCard = tv({
    slots: {
        PostCard:
            "w-full min-w-[350px] border-[1.5px] rounded-[10px] hover:border-gray-600",
        PostCardContainer: "pl-[8px] pt-[11px] pb-[11px] w-full",
        PostAuthor:
            "w-[100%-16px] h-[28px] items-center flex relative select-none",
        PostAuthorIcon: "h-[19px] w-[19px] object-cover hover:cursor-pointer",
        PostAuthorDisplayName: "ml-[9px] hover:cursor-pointer font-[600]",
        PostAuthorHandle:
            "text-[#909090] font-light text-[12px] hover:cursor-pointer",
        PostCreatedAt: "text-[#B8B8B8] font-light absolute right-[17px] ",
        OptionButton: "text-[#B8B8B8] font-light absolute right-[17px]",
        PostContent: "w-[100%-5px] h-full ml-[25px] mr-[17px]",
        PostContentText: "",
        PostReactionButtonContainer: "w-full h-[20px] text-right right-[17px] ",
        PostReactionButton:
            "h-[16px] pl-[8px] pr-[8px] ml-[60px] text-[#909090] text-[14px] cursor-pointer select-none",
        dropdown: "",
        skeletonIcon: "h-full w-full rounded-[10px]",
        skeletonName: "h-3 w-2/5 rounded-lg ",
        skeletonHandle: "h-3 w-3/5 rounded-lg ",
        skeletonTime: "",
        skeletonText1line: "h-3 w-3/5 rounded-lg ",
        skeletonText2line: "h-3 w-4/5 rounded-lg ",
        chip: "overflow-hidden max-w-full",
        isEmbedToModal: "",
        LinkCard:
            "h-[100px] w-full rounded-lg overflow-hidden border border-gray-600 flex items-center text-gray-800",
        LinkCardThumbnailContainer:
            "h-[100px] w-[100px] border-r border-gray-600",
        LinkCardThumbnail: "object-cover w-full h-full z-0",
        LinkCardContent: "flex items-center ml-2 h-full w-[calc(100%-6rem)]",
        LinkCardTitle:
            "text-sm font-bold whitespace-nowrap overflow-hidden overflow-ellipsis",
        LinkCardDescription: "text-xs mt-1",
        LinkCardSiteName: "text-xs mt-1 text-gray-400",
    },
    variants: {
        color: {
            light: {
                PostCard:
                    "bg-white text-black border-[#E8E8E8] hover:bg-[#F5F5F5]",
                PostAuthorDisplayName: "text-black",
                LinkCard: "bg-white text-black hover:bg-[#DBDBDB]",
                LinkCardTitle: "text-black",
            },
            dark: {
                PostCard:
                    "bg-[#2C2C2C] text-[#D7D7D7] border-[#181818] hover:bg-[#1C1C1C]",
                PostAuthorDisplayName: "text-white",
                PostAuthorHandle: "text-[#BABABA]",
                PostCreatedAt: "text-[#B8B8B8]",
                dropdown: "dark text-white",
                skeletonIcon: "dark text-white",
                skeletonName: "dark text-white",
                skeletonHandle: "dark text-white",
                skeletonText1line: "dark text-white",
                skeletonText2line: "dark text-white",
                chip: "dark ",
                LinkCard: "hover:bg-[#1C1C1C]",
                LinkCardTitle: "text-white",
                LinkCardDescription: "text-gray-200",
                LinkCardSiteName: "",
            },
            null: {
                PostCard: " bg-transparent",
            },
        },
        isMobile: {
            true: {
                PostModal: "rounded-none",
                background: "",
                PostContent: "text-[14px] mb-[6px]",
                PostCardContainer: "pb-[18px]",
            },
            false: {
                PostModal: "rounded-[10px] overflow-hidden min-h-[400px]",
                background: "relative flex justify-center items-center",
                PostContent: "text-[15px] mb-[6px]",
                PostCardContainer: "pb-[24px]",
            },
        },
        isEmbedToModal: {
            true: {
                PostModal: "bg-transparent",
            },
        },
    },
})
