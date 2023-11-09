import React from "react"

interface Props {
    isSearchScreen?: boolean
}

export const DummyHeader: React.FC<Props> = (props: Props) => {
    if (props.isSearchScreen) {
        return <div className={"xl:h-[100px] md:h-[100px] h-[85px]"} />
    } else {
        return <div className={"xl:h-[50px] md:h-[100px] h-[85px]"} />
    }
}

export default DummyHeader
