import { tv } from "@nextui-org/react"

export const layout = tv({
    slots: {
        userCard:
            "w-full max-w-[600px] h-[100px] flex items-center border-b-[1px] overflow-x-hidden bg-white text-black border-[#E8E8E8] dark:bg-[#0C0F14] dark:text-[#D7D7D7] dark:border-[#181818]",
        searchSupportCard:
            "h-[80px] w-full flex items-center cursor-pointer border-b-[1px] bg-white text-black border-[#E8E8E8] dark:bg-[#0C0F14] dark:text-[#D7D7D7] dark:border-[#181818]",
    },
    variants: {},
})
