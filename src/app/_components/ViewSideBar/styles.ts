import { tv } from "@nextui-org/react"

export const viewSideBar = tv({
    slots: {
        background: "", //overflow-x-hidden w-full", //overflow-x-hidden w-full", //w-full h-full select-none absolute",
        AuthorIconContainer:
            "md:h-[100px] h-[85px] border-b-[1px] border-[#E3E3E3] pl-[18px] flex items-center cursor-pointer",
        AuthorDisplayName: "font-black font-[16px]",
        AuthorHandle: "",
        Content:
            "md:h-[calc(100%-100px-200px)] h-[calc(100%-85px-200px)] pl-[18px] pt-[24px] pb-[24px] ",
        NavBarIcon: "h-[20px] w-[20px] mr-[17px]",
        NavBarItem:
            "h-[28px] mb-[15px] flex items-center font-medium cursor-pointer",
        Footer: "h-[200px] pl-[18px] pt-[24px] border-t-[1px] border-[#E3E3E3] pb-[75px]  ",
        isBarOpen: "",
        modal: "",
    },
    variants: {
        color: {
            light: {
                // footer: "bg-[#DADADA]",
                backgrouond: "text-black",
                AuthorIconContainer: "text-black",
                AuthorDisplayName: "text-black",
                AuthorHandle: "text-[#767676]",
                NavBarItem: "text-black",
                NavBarIcon: "text-black",
                modal: "light text-black",
            },
            dark: {
                // footer: "bg-[#2C2C2C]",
                AuthorIconContainer: "text-[#D7D7D7]",
                AuthorDisplayName: "text-white",
                AuthorHandle: "text-[#D7D7D7]",
                NavBarItem: "text-[#D7D7D7]",
                NavBarIcon: "text-[#D7D7D7]",
                modal: "dark text-[#D7D7D7]",
            },
        },
        isMobile: {
            true: {},
            false: {},
        },
        isBarOpen: {
            true: {},
            false: {
                // background: "hidden",
                // bg: "hidden",
            },
        },
    },
})
