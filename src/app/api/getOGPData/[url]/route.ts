import { NextRequest } from "next/server"
import openGraphScraper from "open-graph-scraper"

export async function GET(
    request: NextRequest,
    { params }: { params: { data: string } }
) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const url = params.url
    const encodeUrl = encodeURIComponent(url)
    if (
        encodeUrl.startsWith("https%3A%2F%2F") ||
        encodeUrl.startsWith("http%3A%2F%2F")
    ) {
        const options = {
            url: decodeURIComponent(encodeUrl),
            onlyGetOpenGraphInfo: true,
        }
        try {
            const { result } = await openGraphScraper(options)
            if (result.success) {
                await console.log(result)
            }
            return new Response(JSON.stringify(result), { status: 200 })
        } catch (e) {
            return new Response("error", { status: 400 })
        }
    } else {
        return new Response("url is invalid", { status: 400 })
    }
}
