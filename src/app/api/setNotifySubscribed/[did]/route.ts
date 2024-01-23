import { NextRequest } from "next/server"
import { BskyAgent } from "@atproto/api"

const OCI_USER = process.env.OCI_USER
const OCI_PASS = process.env.OCI_PASS
const DB_URL = process.env.NOTIF_DATABASE_URL ?? ""
// eslint-disable-next-line @typescript-eslint/no-var-requires

const formatTodayDate = () => {
    const today = new Date()

    const year = today.getFullYear()
    const month = (today.getMonth() + 1).toString().padStart(2, "0")
    const day = today.getDate().toString().padStart(2, "0")

    return `${year}-${month}-${day}`
}

export async function POST(
    request: NextRequest,
    { params }: { params: { data: string } }
) {
    //console.log(await new Response(request.body).text())
    const res = await new Response(request.body).text()
    const json = await JSON.parse(res)
    //@ts-ignore
    const agent = new BskyAgent({ service: `https://${json.server}` })
    const resumeResult = await agent.resumeSession(json.session)
    if (!resumeResult.success) {
        return new Response(
            JSON.stringify({
                success: false,
                res: { text: "resume session error" },
            }),
            { status: 400 }
        )
    }
    const did = json.session.did
    const content = {
        _id: did,
        did: did,
        service: json.server,
        admin: false,
        purchase: false,
        notify: true,
        created_at: formatTodayDate(),
        updated_at: formatTodayDate(),
    }
    const insert = await fetch(DB_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${btoa(`${OCI_USER}:${OCI_PASS}`)}`,
        },
        body: JSON.stringify(content),
    })
    //console.log(insert)
    return new Response(JSON.stringify({ res: insert }), {
        status: 200,
    })
}
