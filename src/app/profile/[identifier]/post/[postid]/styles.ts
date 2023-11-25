import { tv } from "@nextui-org/react"

export const postOnlyPage = tv({
    slots: {
        Container:
            "h-full min-w-[350px] max-w-[600px] bg-white text-black dark:bg-[#16191F] dark:text-[#D7D7D7] dark:border-[#292929] mt-[5px] overflow-y-auto",
        AuthorPost:
            "w-full border-b-[1px] border-[#AAAAAA] dark:border-[#292929]",
        Author: "flex items-center justify-between pt-[10px] pl-[14px] pr-[14px] pb-[9px] ",
        AuthorIcon:
            "bg-[#D9D9D9] md:h-[50px] md:w-[50px] h-[45px] w-[45px] rounded-full mr-[12px] overflow-hidden cursor-pointer",
        AuthorDisplayName:
            "md:text-[16px] text-[14px] font-bold cursor-pointer",
        AuthorHandle: "md:text-[12px] text-[10px] cursor-pointer",
        PostContent:
            "pl-[14px] pt-[6px] pr-[14px] pb-[14px] w-full text-[16px] text-black dark:text-white",
        PostCreatedAt: "pl-[14px] text-[#AAAAAA] text-[12px]",
        ReactionButtonContainer:
            "mt-[16px] pl-[40px] pr-[40px] mb-[16px] flex justify-between ",
        ReactionButton:
            "md:text-[20px] text-[16px] text-[#AAAAAA] cursor-pointer",
        dropdown: "",
    },
    variants: {},
})
