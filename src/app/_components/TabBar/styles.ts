import { tv } from "@nextui-org/react"

export const tabBar = tv({
    slots: {
        TabBar: "w-full min-w-[350px] h-[calc(50px+env(safe-area-inset-bottom))] flex fixed bottom-0 z-10 max-w-[600px] bg-white dark:bg-black lg:hidden",
        Container:
            "h-full w-[33%] flex justify-center items-center cursor-pointer",
        Icon: "w-[21px] h-[21px] text-black dark:text-white text-[20px]",
    },
    variants: {
        selected: {
            true: {
                Icon: "text-[#1DA1F2]",
            },
            false: {
                Icon: "",
            },
        },
    },
})
