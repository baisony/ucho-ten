import { NextRequest } from "next/server"
import { BskyAgent } from "@atproto/api"

const OCI_USER = process.env.OCI_USER
const OCI_PASS = process.env.OCI_PASS
const OCI_VIEW = process.env.OCI_VIEW
const connectionString = process.env.CONNECTION_STRING
// eslint-disable-next-line @typescript-eslint/no-var-requires
const oracledb = require("oracledb")

export async function GET(
    request: NextRequest,
    { params }: { params: { data: string } }
) {
    //@ts-ignore
    const data = JSON.parse(params.did)
    const agent = new BskyAgent({ service: `https://${data.server}` })
    const resumeResult = await agent.resumeSession(data.session)
    const did = data.session.did
    if (!resumeResult.success) {
        return new Response("resume session error", { status: 400 })
    }
    const connection = await oracledb.getConnection({
        user: OCI_USER,
        password: OCI_PASS,
        connectionString: connectionString,
    })

    const result = await connection.execute(
        `SELECT * FROM "ADMIN"."${OCI_VIEW}"　WHERE "DID" = '${did}'`
    )
    console.log(result.rows)
    return new Response(JSON.stringify({ res: result.rows }), { status: 200 })
}
