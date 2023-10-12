import { tv } from "@nextui-org/react"

export const viewSideBar = tv({
    slots: {
        background:
            "w-[70svw] min-w-[210px] max-w-[350px] h-full select-none absolute",
        AuthorIconContainer:
            "h-[100px] w-full border-b-[1px] border-[#E3E3E3] pl-[18px] bg-white bg-opacity-40 flex items-center cursor-pointer",
        AuthorDisplayName: "font-black font-[16px]",
        AuthorHandle: "",
        Content:
            "h-[calc(100%-100px-200px)] w-full pl-[18px] pt-[24px] pb-[24px] bg-white bg-opacity-40",
        NavBarIcon: "h-[24px] w-[24px] mr-[17px]",
        NavBarItem:
            "h-[28px] w-full mb-[15px] flex items-center font-bold cursor-pointer",
        Footer: "h-[200px] w-full pl-[18px] pt-[24px] border-t-[1px] border-[#E3E3E3] pb-[75px] bg-white bg-opacity-40",
        isBarOpen: "",
        modal: "",
    },
    variants: {
        color: {
            light: {
                footer: "bg-[#DADADA]",
                AuthorHandle: "text-white",
                modal: "light text-black",
            },
            dark: {
                footer: "bg-[#2C2C2C]",
                AuthorHandle: "text-[#D7D7D7]",
                modal: "dark text-white",
            },
        },
        isMobile: {
            true: {},
            false: {},
        },
        isBarOpen: {
            true: {},
            false: {
                background: "hidden",
                bg: "hidden",
            },
        },
    },
})
