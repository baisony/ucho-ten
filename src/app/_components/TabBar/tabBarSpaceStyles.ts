import { tv } from "@nextui-org/react"

export const tabBarSpaceStyles = tv({
    slots: {
        nullTimeline:
            "overflow-y-auto h-[calc(100%-50px-env(safe-area-inset-bottom))] xl:h-[calc(100%-env(safe-area-inset-bottom))]",
        notNulltimeline:
            "overflow-y-auto h-[calc(100%-50px-env(safe-area-inset-bottom))] xl:h-[calc(100%-50px-env(safe-area-inset-bottom))]",
    },
})
