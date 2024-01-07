import { tv } from "@nextui-org/react"

export const viewHeader = tv({
    slots: {
        Header: "pt-[env(safe-area-inset-top)] md:h-[calc(100px+env(safe-area-inset-top))] h-[calc(85px+env(safe-area-inset-top))] w-full min-w-[350px] max-w-[600px] text-white backdrop-blur-[5px] bg-black/40 fixed top-0 z-10 select-none",
        HeaderContentTitleContainer: "",
        HeaderContentTitle: "",
        HeaderContent:
            "w-full h-[100%-86px] max-h-[400px] relative flex items-center flex-wrap overflow-y-scroll",
        HeaderInputArea:
            "h-full w-full outline-none pl-[20px] pr-[40px] text-black dark:text-white dark:bg-[#1C1C1C]",
        top: "md:h-[73px] h-[55px] w-full flex justify-center items-center",
        bottom: "lg:h-[27px] md:h-[27px] h-[30px] font-bold align-center overflow-x-scroll overflow-y-hidden flex justify-center items-center",
    },
    variants: {
        page: {},
        isNextPage: {
            true: {},
            false: {},
        },
        isMatchingPath: {
            false: {
                Header: "lg:h-[50px]",
                top: "lg:hidden",
                bottom: "lg:h-full",
            },
            true: {
                Header: "lg:h-[100px]",
                bottom: "lg:h-[27px]",
            },
        },
    },
})
