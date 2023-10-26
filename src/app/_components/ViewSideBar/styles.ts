import { tv } from "@nextui-org/react"

export const viewSideBar = tv({
    slots: {
        background: "text-black dark:text-white", //overflow-x-hidden w-full", //overflow-x-hidden w-full", //w-full h-full select-none absolute",
        AuthorIconContainer:
            "md:h-[100px] h-[85px] border-b-[1px] border-[#E3E3E3] pl-[18px] flex items-center cursor-pointer text-black dark:text-[#D7D7D7]",
        AuthorDisplayName: "font-black font-[16px] text-black dark:text-white",
        AuthorHandle: "text-[#767676] dark:text-[#D7D7D7]",
        Content:
            "md:h-[calc(100%-100px-200px)] h-[calc(100%-85px-200px)] pl-[18px] pt-[24px] pb-[24px] ",
        NavBarIcon:
            "h-[20px] w-[20px] mr-[17px] text-black dark:text-[#D7D7D7]",
        NavBarItem:
            "h-[28px] mb-[15px] flex items-center font-medium cursor-pointer text-black dark:text-[#D7D7D7]",
        Footer: "h-[200px] pl-[18px] pt-[24px] border-t-[1px] border-[#E3E3E3] pb-[75px]  ",
        isBarOpen: "",
        modal: "",
    },
    variants: {
        isBarOpen: {
            true: {},
            false: {
                // background: "hidden",
                // bg: "hidden",
            },
        },
    },
})
