import PageClient from "./page.client"
import { Metadata } from "next"

export default function Page() {
    return <PageClient />
}
export const metadata: Metadata = { robots: { index: true } }
