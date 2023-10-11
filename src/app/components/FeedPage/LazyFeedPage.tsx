import dynamic from "next/dynamic"
import { FeedPageProps } from "."

const DynamicComponent = dynamic(() => import("./FeedPage"))

function LazyFeedPage(props: FeedPageProps) {
    return <DynamicComponent {...props} />
}

export default LazyFeedPage
