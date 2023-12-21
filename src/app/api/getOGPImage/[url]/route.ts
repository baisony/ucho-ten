import { NextRequest } from "next/server"
import axios from "axios"

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
        try {
            const res = await axios.get(encodeURIComponent(url), {
                responseType: "arraybuffer",
                headers: { "Content-Type": "image/jpeg" },
            })
            const data = res.data
            return new Response(data, { status: 200 })
        } catch (e) {
            return new Response("error", { status: 400 })
        }
    } else {
        return new Response("url is invalid", { status: 400 })
    }
}
