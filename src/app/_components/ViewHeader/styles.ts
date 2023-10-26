import { tv } from "@nextui-org/react"

export const viewHeader = tv({
    slots: {
        Header: "md:h-[100px] h-[85px] w-full min-w-[350px] max-w-[600px] text-white backdrop-blur-[5px] bg-black/40 fixed top-0 z-10 select-none",
        HeaderContentTitleContainer: "",
        HeaderContentTitle: "",
        HeaderContent:
            "w-full h-[100%-86px] max-h-[400px] relative flex items-center flex-wrap overflow-y-scroll",
        HeaderInputArea:
            "h-full w-full outline-none pl-[20px] pr-[40px] text-black dark:text-white dark:bg-[#1C1C1C]",
        top: "md:h-[73px] h-[55px] w-full flex justify-center items-center",
        bottom: "md:h-[27px] h-[30px] relative bottom-0 font-bold align-start overflow-x-scroll overflow-y-hidden",
    },
    variants: {
        page: {
            // single: {
            //     bottom: "flex justify-center items-center",
            //     HeaderContentTitle: "justify-center items-center",
            // },
            // profile: {
            //     bottom: "flex justify-end items-baseline",
            //     HeaderContentTitle: "w-[20%] flex justify-center items-center",
            // },
            // home: {
            //     HeaderContentTitleContainer:
            //         "flex ml-[40px] overflow-hidden overflow-x-scroll",
            //     HeaderContentTitle:
            //         "justify-center items-center pl-[15px] pr-[15px]",
            // },
            // post: {
            //     bottom: "flex justify-center items-center",
            //     HeaderContentTitle: "w-[50%] flex justify-center items-center",
            // },
            // search: {
            //     bottom: "flex justify-center items-baseline",
            //     HeaderContentTitle:
            //         "w-[33.3%] flex justify-center items-center",
            // },
        },
        isNextPage: {
            true: {},
            false: {},
        },
    },
})
