import { tv } from "@nextui-org/react"

export const viewSideBar = tv({
    slots: {
        background: "", //overflow-x-hidden w-full", //overflow-x-hidden w-full", //w-full h-full select-none absolute",
        AuthorIconContainer:
            "h-[100px] border-b-[1px] border-[#E3E3E3] pl-[18px] flex items-center cursor-pointer",
        AuthorDisplayName: "font-black font-[16px]",
        AuthorHandle: "",
        Content: "h-[calc(100%-100px-200px)] pl-[18px] pt-[24px] pb-[24px] ",
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
                backgrouond: "text-white",
                AuthorIconContainer: "text-white",
                AuthorDisplayName: "text-white",
                AuthorHandle: "text-white",
                NavBarItem: "text-white",
                NavBarIcon: "text-white",
                modal: "light text-white",
            },
            dark: {
                // footer: "bg-[#2C2C2C]",
                AuthorHandle: "text-[#D7D7D7]",
                modal: "dark text-black",
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
