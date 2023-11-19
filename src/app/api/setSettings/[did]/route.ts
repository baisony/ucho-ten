import { NextRequest } from "next/server"
import { connect, DatabaseError, Row } from "@tidbcloud/serverless"
import { BskyAgent } from "@atproto/api"

const dbUrl = process.env.DATABASE_URL

export async function POST(
    request: NextRequest,
    { params }: { params: { data: string } }
) {
    //@ts-ignore
    const data = JSON.parse(params.did)
    const agent = new BskyAgent({ service: `https://${data.server}` })
    const resumeResult = await agent.resumeSession(data.session)
    if (dbUrl === undefined || dbUrl == "") {
        return new Response("dbUrl is empty", { status: 400 })
    }
    const conn = connect({
        url: dbUrl,
    })
    if (data.session.did == "") {
        return new Response("did is empty", { status: 400 })
    }
    const postBody = request.body
    if (postBody === undefined || postBody === null) {
        return new Response("postBody is empty", { status: 400 })
    }
    const body = await new Response(postBody).text()
    const queryString =
        "INSERT INTO `ucho_ten`.`settings` (`did`,`settings`,`updated_at`) VALUES (?,?,NOW()) ON DUPLICATE KEY UPDATE `settings`=?, `updated_at`=NOW()"
    try {
        const result = await conn.execute(
            queryString,
            [data.session.did, body, body],
            {
                fullResult: true,
            }
        )
        const status = 200
        let message: string = ""

        if ("rowsAffected" in result) {
            const rowsAffected = result.rowsAffected
            if (rowsAffected === null || rowsAffected < 1) {
                return new Response("", { status: 404 })
            } else {
                message = ""
            }
        }

        return new Response(message, { status: status })
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
