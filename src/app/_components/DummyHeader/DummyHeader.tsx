interface Props {
    isSearchScreen?: boolean
}

export const DummyHeader: React.FC<Props> = (props: Props) => {
    if (props.isSearchScreen) {
        return (
            <div
                className={
                    "lg:h-[calc(100px+env(safe-area-inset-top))] md:h-[calc(100px+env(safe-area-inset-top))] h-[calc(85px+env(safe-area-inset-top))]"
                }
            />
        )
    } else {
        return (
            <div
                className={
                    "lg:h-[calc(50px+env(safe-area-inset-top))] md:h-[calc(100px+env(safe-area-inset-top))] h-[calc(85px+env(safe-area-inset-top))]"
                }
            />
        )
    }
}

export default DummyHeader
