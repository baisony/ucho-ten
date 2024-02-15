import { NextRequest } from "next/server"
import { connect, DatabaseError } from "@tidbcloud/serverless"
import { BskyAgent } from "@atproto/api"

const dbUrl = process.env.DATABASE_URL

export async function POST(request: NextRequest) {
    //@ts-ignore
    const postBody = request.body
    if (postBody === undefined || postBody === null) {
        return new Response("postBody is empty", { status: 400 })
    }
    const body = await new Response(postBody).text()

    const bodyParam = JSON.parse(body)
    const sessionData = JSON.parse(bodyParam.data)
    const agent = new BskyAgent({ service: `https://${sessionData.server}` })
    const resumeResult = await agent.resumeSession(sessionData.session)
    if (!resumeResult.success) {
        return new Response("resume session error", { status: 400 })
    }
    if (dbUrl === undefined || dbUrl == "") {
        return new Response("dbUrl is empty", { status: 400 })
    }
    const conn = connect({
        url: dbUrl,
    })
    if (sessionData.session.did == "") {
        return new Response("did is empty", { status: 400 })
    }
    const queryString = "select `settings` from `settings` where `did` = ?"
    try {
        const result = await conn.execute(
            queryString,
            [sessionData.session.did],
            {
                fullResult: true,
            }
        )
        let message: string = ""

        if ("rowCount" in result) {
            const rowCount = result.rowCount
            if (rowCount === null || rowCount < 1 || result.rows === null) {
                return new Response("", { status: 404 })
            } else {
                if (result.rows !== null) {
                    // @ts-ignore
                    message = result.rows[0]["settings"]
                }
            }
        }

        return new Response(message, { status: 200 })
    } catch (e) {
        // DBエラーの場合
        if (e instanceof DatabaseError) {
            return new Response(e.message, { status: e.status })
        } else {
            // 不明なエラー status 400
            return new Response(`Unkoen error ${typeof e} details:${e}`, {
                status: 400,
            })
        }
    }
}
