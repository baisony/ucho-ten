import { tv } from "@nextui-org/react"

export const viewSettingsPage = tv({
    slots: {
        background: "",
        accordion: "",
        button: "",
    },
    variants: {
        color: {
            light: {
                background: "bg-white text-black",
                accordion: "light text-black",
                button: "light text-black",
            },
            dark: {
                background: "bg-[#181818] text-white",
                accordion: "dark text-white ",
                button: "dark text-white",
            },
        },
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
