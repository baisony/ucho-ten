import { tv } from "@nextui-org/react"

export const viewQuoteCard = tv({
    slots: {
        PostCard:
            "w-full border-[1.5px] rounded-[10px] md:hover:border-gray-600 bg-white text-black border-[#E8E8E8] md:hover:bg-[#F5F5F5] dark:bg-[#2C2C2C] dark:text-[#D7D7D7] dark:border-[#181818] dark:md:hover:bg-[#1C1C1C]",
        PostCardContainer: "pt-[11px] w-full",
        PostAuthor:
            "w-[100%-16px] h-[28px] items-center flex relative select-none",
        PostAuthorIcon: "h-[19px] w-[19px] object-cover hover:cursor-pointer",
        PostAuthorDisplayName:
            "ml-[9px] hover:cursor-pointer font-[600] text-black dark:text-white",
        PostAuthorHandle:
            "text-[#909090] dark:text-[#BABABA] font-light text-[12px] hover:cursor-pointer",
        PostCreatedAt:
            "text-[#B8B8B8] dark:text-[#B8B8B8] font-light absolute right-[17px] ",
        OptionButton: "text-[#B8B8B8] font-light absolute right-[17px]",
        PostContent:
            "w-[100%-5px] h-full ml-[25px] mr-[17px] mb-[6px] text-[14px] md:text-[15px]",
        PostContentText: "",
        PostReactionButtonContainer: "w-full h-[20px] text-right right-[17px] ",
        PostReactionButton:
            "h-[16px] pl-[8px] pr-[8px] ml-[60px] text-[#909090] text-[14px] cursor-pointer select-none",
        dropdown: "",
        skeletonIcon: "h-full w-full rounded-[10px]",
        skeletonName: "h-3 w-2/5 rounded-lg ",
        skeletonHandle: "h-3 w-3/5 rounded-lg ",
        skeletonText1line: "h-3 w-3/5 rounded-lg ",
        skeletonText2line: "h-3 w-4/5 rounded-lg ",
        chip: "overflow-hidden max-w-full",
        isEmbedToModal: "",
    },
    variants: {
        isEmbedToModal: {
            true: {
                PostCard: "bg-transparent",
            },
        },
    },
})
