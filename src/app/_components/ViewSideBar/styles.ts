import { tv } from "@nextui-org/react"

export const viewSideBar = tv({
    slots: {
        background: "w-full h-full text-[#f2f2f2] dark:text-white relative",
        AuthorIconContainer:
            "h-full border-b-[1px] text-[#f2f2f2] dark:text-[#D7D7D7]",
        AuthorDisplayName:
            "font-black font-[16px] text-[#f2f2f2] dark:text-white w-full overflow-hidden overflow-ellipsis whitespace-nowrap",
        AuthorHandle:
            "text-[#c2c2c2] dark:text-[#D7D7D7] w-full overflow-hidden overflow-ellipsis whitespace-nowrap",
        Content: " pl-[18px] pt-[24px] pb-[24px] ",
        NavBarContainer: "w-[50px] flex items-center mr-[10px]",
        NavBarIcon:
            "text-[#f2f2f2] dark:text-[#D7D7D7] text-[20px] flex items-center justify-center h-[20px] w-full",
        NavBarItem:
            " mb-[17px] flex items-center font-medium cursor-pointer text-[#f2f2f2] dark:text-[#D7D7D7] h-full w-full font-bold",
        Footer: " pl-[18px] pt-[24px] pb-[75px]  ",
        isBarOpen: "",
        modal: "",
        appearanceTextColor: "text-[#f2f2f2] dark:text-white",
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
