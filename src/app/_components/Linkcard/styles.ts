import { tv } from "@nextui-org/react"

export const linkcard = tv({
    slots: {
        LinkCard:
            "md:h-[100px] h-[80px] w-full rounded-lg overflow-hidden border md:hover:border-gray-600 flex items-center text-gray-800 bg-white text-black md:hover:bg-[#DBDBDB] border-[#E8E8E8] md:dark:hover:bg-[#1C1C1C] dark:border-[#292929] dark:bg-transparent",
        LinkCardThumbnailContainer:
            "md:h-[100px] h-[80px] md:w-[100px] w-[80px] border-r md:hover:border-gray-600 border-[#E8E8E8] dark:border-[#292929]",
        LinkCardThumbnail: "object-cover w-full h-full z-0",
        LinkCardContent: "flex items-center ml-2 h-full",
        LinkCardTitle:
            "text-sm font-bold whitespace-nowrap overflow-hidden overflow-ellipsis text-black dark:text-white",
        LinkCardDescription: "text-xs mt-1 dark:text-gray-200",
        LinkCardSiteName: "text-xs mt-1 text-gray-400",
    },
})
