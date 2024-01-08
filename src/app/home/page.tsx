import { Metadata } from "next"
import { SwiperPage } from "@/app/_components/SwiperPage"

export const metadata: Metadata = {
    title: "Home",
}

const Root = () => {
    return <SwiperPage page={"home"} />
}

export default Root
