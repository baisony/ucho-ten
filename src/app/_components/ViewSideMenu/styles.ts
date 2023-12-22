import { tv } from "@nextui-org/react"

export const viewSideMenuStyle = tv({
    slots: {
        menuItem:
            "mb-[15px] cursor-pointer flex hover:text-[#FFFFFF] dark:hover:text-[#FFFFFF]",
    },
    variants: {
        isLocationHere: {
            true: {
                menuItem: "text-[#FFFFFF] dark:text-[#FFFFFF]",
            },
            false: {
                // background: "hidden",
                // bg: "hidden",
            },
        },
    },
})
