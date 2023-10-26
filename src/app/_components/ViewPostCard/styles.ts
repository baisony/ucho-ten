import { tv } from "@nextui-org/react"

export const viewPostCard = tv({
    slots: {
        PostCard:
            "w-full min-w-[350px] border-b-[1px] bg-white text-black border-[#E8E8E8] dark:bg-[#2C2C2C] dark:text-[#D7D7D7] dark:border-[#181818]",
        PostCardContainer: "pl-[8px] pt-[11px] w-full md:pb-[24px] pb-[16px]",
        PostAuthor:
            "w-[100%-16px] h-[28px] items-center flex relative select-none",
        PostAuthorIcon: "h-[28px] w-[28px] object-cover hover:cursor-pointer",
        PostAuthorDisplayName:
            "text-black dark:text-white ml-[9px] hover:cursor-pointer font-[600] max-w-[40%] overflow-hidden text-ellipsis whitespace-nowrap",
        PostAuthorHandle:
            "text-[#909090] dark:text-[#BABABA] font-light text-[12px] hover:cursor-pointer max-w-[30%] overflow-hidden text-ellipsis whitespace-nowrap",
        postCreatedAt:
            "text-[#B8B8B8] font-light absolute right-[17px] text-[12px]",
        moreButton:
            "text-[#B8B8B8] font-light absolute right-[17px] text-[12px]",
        OptionButton: "text-[#B8B8B8] font-light absolute right-[17px]",
        PostContent:
            "w-[100%-5px] h-full ml-[25px] mr-[17px] mb-[6px] text-[14px] md:text-[15px]",
        PostContentText: "",
        PostReactionButtonContainer: "w-full h-[20px] text-right right-[17px] ",
        PostReactionButton:
            "md:h-[16px] h-[14px] md:pl-[8px] pl-[6px] md:pr-[8px] pr-[6px] md:ml-[60px] ml-[45px] text-[#909090] cursor-pointer select-none",
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
        isEmbedToModal: {
            true: {
                PostModal: "bg-transparent",
            },
        },
    },
})
