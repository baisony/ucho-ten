import { tv } from "@nextui-org/react"

export const viewPostCard = tv({
    slots: {
        PostCard:
            "w-full min-w-[350px] h-full border-b-[1px] text-black border-[#E8E8E8] dark:text-[#D7D7D7] dark:border-[#292929] bg-white dark:bg-[#16191F] lg:rounded-[10px]",
        PostCardContainer:
            "pl-[8px] pt-[11px] w-full md:pb-[11px] pb-[16px] pr-[11px] lg:pl-[12px] lg:pr-[12px] lg:pt-[15px] lg:pb-[15px]",
        PostAuthor:
            "w-full h-[28px] items-center flex relative select-none justify-between",
        PostAuthorIcon:
            "h-[30px] w-[30px] object-cover hover:cursor-pointer rounded-full overflow-hidden",
        PostAuthorDisplayName:
            "text-black dark:text-[#D7D7D7] ml-[9px] hover:cursor-pointer font-[600] max-w-[40%] overflow-hidden text-ellipsis whitespace-nowrap",
        PostAuthorHandle:
            "text-[#595959] dark:text-[#BABABA] font-light text-[12px] hover:cursor-pointer max-w-[30%] overflow-hidden text-ellipsis whitespace-nowrap",
        postCreatedAt: "text-[#595959] font-light text-[12px]",
        moreButton: "text-[#B8B8B8] font-light text-[12px]",
        OptionButton: "text-[#595959] font-light absolute right-[17px]",
        PostContent: "w-[100%-5px] h-full ml-[36px] mr-[0px]",
        PostReactionButtonContainer:
            "h-[20px] mt-[15px] flex items-center justify-between ml-[36px]",
        PostReactionButton:
            "text-[14px] md:text-[16px] ml-[50px] cursor-pointer select-none w-[15px] h-[14px]",
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
        replyButton: "text-[#909090] dark:text-[#636363]",
        bookmarkButton: "text-[#909090] dark:text-[#636363]",
        repostButton: "",
        likeButton: "",
    },
    variants: {
        isEmbedToModal: {
            true: {
                PostCard: "bg-transparent",
                PostCardContainer: "pt-0 border-none",
            },
            false: {
                PostCardContainer: "cursor-pointer",
                PostContentText: "",
            },
        },
        isEmbedToPost: {
            true: {
                PostAuthorIcon: "h-[18px] w-[18px]",
                PostContent: "ml-[0px]",
            },
        },
        isReacted: {
            true: {
                repostButton: "text-[#17BF63]",
                likeButton: "text-[#fd7e00]",
            },
            false: {
                repostButton: "text-[#909090] dark:text-[#636363]",
                likeButton: "text-[#909090] dark:text-[#636363]",
            },
        },
        replyDisabled: {
            true: {
                replyButton: "text-gray-300 dark:text-gray-700",
            },
        },
    },
})
