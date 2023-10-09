import { tv } from "@nextui-org/react"

export const layout = tv({
    slots: {
        userCard:
            "w-full max-w-[600px] h-[100px] flex items-center border-b-[1px] overflow-x-hidden",
        searchSupportCard:
            "h-[80px] w-full flex items-center cursor-pointer border-b-[1px]",
    },
    variants: {
        color: {
            light: {
                background:
                    "bg-cover bg-[url(/images/backgroundImage/light/sky_00421.jpg)]",
                PostModal: "bg-[#DADADA] bg-opacity-70 text-white",
                footer: "bg-[#DADADA]",
                userCard: "bg-white text-black border-[#E8E8E8]",
                searchSupportCard: "bg-white text-black border-[#E8E8E8]",
            },
            dark: {
                background:
                    "bg-cover bg-[url(/images/backgroundImage/dark/starry-sky-gf5ade6b4f_1920.jpg)]",
                PostModal: "bg-[#2C2C2C] bg-opacity-70 text-[#D7D7D7]",
                footer: "bg-[#2C2C2C]",
                dropdown: "dark text-white",
                popover: "dark text-white",
                userCard: "bg-[#2C2C2C] text-[#D7D7D7] border-[#181818] ",
                searchSupportCard:
                    "bg-[#2C2C2C] text-[#D7D7D7] border-[#181818] ",
            },
        },
        isMobile: {
            true: {},
            false: {},
        },
    },
})
