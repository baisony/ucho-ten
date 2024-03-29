import { tv } from "@nextui-org/react"

export const viewProfilePage = tv({
    slots: {
        background: "max-w-[600px] min-w-[350px] w-full",
        ProfileContainer:
            "w-full max-h-[800px] bg-white border-[#E3E3E3] dark:border-[#828282] border-b-[2px] lg:rounded-b-lg lg:mb-[10px] lg:overflow-hidden",
        HeaderImageContainer: "w-full h-[150px] relative",
        ProfileHeaderImage: "h-full w-full object-cover",
        ProfileInfoContainer:
            "w-full h-full relative pl-[13px] pr-[8px] pb-[16px] text-black bg-white dark:bg-black dark:text-white",
        ProfileImage: "h-[80px] w-[80px] rounded-full",
        ProfileDisplayName: "font-black text-[24px]",
        ProfileHandle: "text-[12px]",
        ProfileBio: "mt-[8px] mr-[20px] text-[14px]",
        ProfileCopyButton:
            "h-[32px] w-[32px] ml-[10px] mr-[10px] border-[1px] border-[#929292] rounded-full flex justify-center items-center cursor-pointer",
        ProfileActionButton:
            "h-[32px] w-[32px] ml-[10px] mr-[10px] border-[1px] border-[#929292] rounded-full flex justify-center items-center cursor-pointer",
        FollowButton: "mr-[8px] ml-[10px] text-black dark:text-white",
        Buttons: "flex justify-end h-[56px] w-full flex items-center",
        PropertyButton: "",
        PostContainer: "w-full h-full",
        appearanceTextColor: "text-black dark:text-white",
    },
})
