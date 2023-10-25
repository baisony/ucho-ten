import { tv } from "@nextui-org/react"

export const viewSettingsPage = tv({
    slots: {
        background: "bg-white text-black dark:bg-[#181818] dark:text-white",
        accordion: "text-black dark:text-white",
        button: "text-black dark:text-white",
    },
    variants: {
        isMobile: {
            true: {
                background: "",
                ProfileHandle: "text-[12px]",
                ProfileBio: "text-[12px]",
            },
            false: {
                background: "",
            },
        },
    },
})
