import { NextRequest } from "next/server"
import { connect, DatabaseError, Row } from "@tidbcloud/serverless"

const dbUrl = process.env.DATABASE_URL

export async function GET(
    request: NextRequest,
    { params }: { params: { did: string } }
) {
    if (dbUrl === undefined || dbUrl == "") {
        return new Response("dbUrl is empty", { status: 400 })
    }
    const conn = connect({
        url: dbUrl,
    })
    if (params.did == "") {
        return new Response("did is empty", { status: 400 })
    }
    const queryString =
        "INSERT INTO `ucho_ten`.`settings` (`did`,`settings`,`updated_at`) VALUES (?,'{}',NOW()) ON DUPLICATE KEY UPDATE `settings`='{}', `updated_at`=NOW()"
    try {
        const result = await conn.execute(queryString, [params.did], {
            fullResult: true,
        })
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
