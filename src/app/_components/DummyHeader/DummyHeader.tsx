import React from "react"

interface Props {
    isSearchScreen?: boolean
}

export const DummyHeader: React.FC<Props> = (props: Props) => {
    if (props.isSearchScreen) {
        return <div className={"lg:h-[100px] md:h-[100px] h-[85px]"} />
    } else {
        z
        return <div className={"lg:h-[50px] md:h-[100px] h-[85px]"} />
    }
}

export default DummyHeader
