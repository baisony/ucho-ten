import { tv } from "@nextui-org/react"

export const viewNotFoundCard = tv({
    slots: {
        PostCard:
            "w-full border-[1.5px] rounded-[10px] md:hover:border-gray-600 bg-white text-black border-[#E8E8E8] md:hover:bg-[#F5F5F5] dark:bg-[#2C2C2C] dark:text-[#D7D7D7] dark:border-[#181818] dark:md:hover:bg-[#1C1C1C]",
    },
    variants: {
        isEmbedToModal: {
            true: {
                PostModal: "bg-transparent",
            },
        },
    },
})
