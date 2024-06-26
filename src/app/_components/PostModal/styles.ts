import { tv } from "@nextui-org/react"

export const postModal = tv({
    slots: {
        background: "w-full h-full",
        backgroundColor: "w-full h-full bg-[#000000] bg-opacity-10 absolute",

        PostModal:
            "text-white dark:text-[#D7D7D7] bg-[#DADADA] dark:bg-[#16191F] bg-opacity-70 backdrop-blur-[15px] dark:bg-opacity-50 dark:backdrop-blur-[15px] w-full min-w-[300px] max-w-[600px] h-[350px] shadow-xl relative rounded-none md:rounded-[10px] md:overflow-hidden md:min-h-[400px] mt-[env(safe-area-inset-top)]",
        header: "w-full h-[43px] select-none flex justify-between items-center",
        headerCancelButton: "w-[91px] h-[37px] left-[4px] text-white",
        headerTitle:
            "w-full h-full text-center text-base font-medium fontSize-[16px] items-center flex justify-center text-white",
        headerPostButton: "right-[8px]",

        content: "w-full h-[calc(100%-86px)] overflow-y-scroll",
        contentContainer:
            "w-full h-[calc(100%-86px)] relative flex items-center",
        contentLeft:
            "w-[48px] h-[calc(100%-10px)] flex select-none justify-center",
        contentLeftAuthorIcon:
            "w-[28px] h-[28px] bg-black rounded-full overflow-hidden cursor-pointer z-[1]",
        contentLeftAuthorIconImage: "w-full h-full drag-none",
        contentRight: "w-[calc(100%-54px)] relative h-[calc(100%-10px)] ",
        contentRightTextArea:
            "w-[calc(100%)] placeholder-[#808080] bg-transparent resize-none outline-none overflow-visible",
        contentRightImagesContainer:
            "w-[100%] h-[105px] whitespace-nowrap flex flex-wrap flex-col b-0",
        contentRightUrlsContainer:
            "w-[100%] h-[40px] whitespace-nowrap flex flex-wrap flex-col",
        contentRightUrlCard: "w-full",
        contentRightUrlCardDeleteButton:
            "w-[40px] h-[40px] bg-black bg-opacity-20 rounded-full cursor-pointer flex justify-center items-center",
        URLCard:
            "h-full w-[485px] rounded-[10px] overflow-hidden border-[1px] border-[#808080] bg-[#FFFFFF] flex items-center cursor-pointer",
        URLCardThumbnail:
            "h-[100px] w-[100px] border-[1px] border-[#808080] border-r-0",
        URLCardDetail:
            "flex h-full w-[calc(100%-110px)] align-center ml-[10px]",
        URLCardDetailContent: "h-full w-[370px] min-w-[0px]",
        URLCardTitle:
            "font-bold whitespace-nowrap overflow-hidden text-ellipsis",
        URLCardDescription: "font-gray mt-[1px] ",
        URLCardLink: "font-gray mt-[1px] text-[#0000FF]",

        footer: "w-full h-[43px] absolute bottom-0 select-none bg-[#DADADA] dark:bg-[#16191F]",
        footerTooltip: "h-full w-full flex justify-left items-left",
        footerTooltipStyle:
            "h-[20px] relative md:ml-7 md:mt-3 ml-2 mt-3 cursor-pointer",
        footerCharacterCount:
            "h-full w-full flex justify-end items-center mr-5",
        footerCharacterCountText: "text-[16px]",
        footerCharacterCountCircle: "w-[20px] h-[20px] mr-[10px]",

        ImageDeleteButton:
            "h-[20px] w-[20px] p-[0px] rounded-[50%] bg-opacity-80 bg-black",
        ImageAddALTButton:
            "h-[20px] w-full p-[0px] rounded-[12.5%] bg-opacity-80 bg-black",
        ImageEditButton:
            "h-[20px] w-[20px] p-[0px] rounded-[50%] bg-opacity-80 bg-black",

        dropdown: "",
        popover: "",
    },
    variants: {
        uploadImageAvailable: {
            true: {
                contentRightTextArea: "min-h-[calc(100%-105px)]",
            },
            false: {
                contentRightTextArea: "min-h-full",
            },
        },
        isDragActive: {
            true: {
                content: "border-[2px] border-dashed border-[#000000]",
            },
            false: {
                content: "border-none",
            },
        },
        type: {
            Post: {
                contentRightTextArea: "min-h-[calc(100%)]",
            },
            Reply: {},
            Quote: {},
        },
    },
})
