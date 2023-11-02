import { tv } from "@nextui-org/react"

export const verticalTabBar = tv({
    slots: {
        TabBar: "w-full min-w-[350px] h-[50px] flex fixed bottom-0 z-10 max-w-[600px]",
        Container:
            "h-full w-[25%] flex justify-center items-center cursor-pointer",
        Icon: "w-[30px] h-[30px] text-white",
        IconBackground: "w-[60px] h-[60px] text-black",
    },
    variants: {
        color: {
            light: {
                TabBar: "bg-white",
                Icon: "text-black",
            },
            dark: {
                TabBar: "bg-black",
                Icon: "text-white",
            },
        },
        selected: {
            true: {
                Icon: "text-[#1DA1F2]",
            },
            false: {
                Icon: "",
            },
        },
        isMobile: {
            true: {
                PostModal: "rounded-none",
                background: "",
            },
            false: {
                PostModal: "rounded-[10px] overflow-hidden min-h-[400px]",
                background: "",
            },
        },
    },
})
