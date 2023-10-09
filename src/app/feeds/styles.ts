import { tv } from "@nextui-org/react"

export const layout = tv({
    slots: {
        FeedCard:
            "flex items-center w-full h-[80px] justify-between select-none cursor-pointer",
    },
    variants: {
        color: {
            light: {
                FeedCard: "bg-white text-black",
            },
            dark: {
                FeedCard: "bg-[#2C2C2C] text-white",
            },
        },
        isMobile: {
            true: {
                background: "",
            },
            false: {
                background: "",
            },
        },
        page: {
            single: {
                bottom: "flex justify-center items-center",
                HeaderContentTitle: "justify-center items-center",
            },
            profile: {
                bottom: "flex justify-end items-baseline",
                HeaderContentTitle: "w-[20%] flex justify-center items-center",
            },
            home: {
                HeaderContentTitleContainer:
                    "flex ml-[40px] overflow-hidden overflow-x-scroll",
                HeaderContentTitle:
                    "justify-center items-center pl-[15px] pr-[15px]",
            },
            post: {
                bottom: "flex justify-center items-center",
                HeaderContentTitle: "w-[50%] flex justify-center items-center",
            },
            search: {
                bottom: "flex justify-center items-baseline",
                HeaderContentTitle:
                    "w-[33.3%] flex justify-center items-center",
            },
        },
        isNextPage: {
            true: {},
            false: {},
        },
    },
})
