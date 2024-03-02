import { tv } from "@nextui-org/react"

export const tabBarSpaceStyles = tv({
    slots: {
        nullTimeline:
            "overflow-y-auto h-[calc(100%-50px-env(safe-area-inset-bottom))] lg:h-[calc(100%-env(safe-area-inset-bottom))]",
        notNulltimeline:
            "overscroll-contain overflow-y-auto h-[calc(100%-50px-env(safe-area-inset-bottom))] lg:h-[calc(100%-50px-env(safe-area-inset-bottom))]",
    },
})
