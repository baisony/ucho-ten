// useRefreshSession.ts
import { useCallback } from "react"
import { BskyAgent } from "@atproto/api"
import { UserAccountByDid } from "@/app/_atoms/accounts"

const useRefreshSession = (
    agent: BskyAgent | null, // agent の型を適切に指定してください
    setAgent: (agent: BskyAgent | null) => void,
    accounts: UserAccountByDid,
    setAccounts: (accounts: UserAccountByDid) => void
) => {
    return useCallback(async () => {
        if (!agent || !agent.session) return

        try {
            const url = new URL(agent.service)
            const req = {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${agent.session.refreshJwt}`,
                },
            }
            const res = await fetch(
                `${url}xrpc/com.atproto.server.refreshSession`,
                req
            )
            const json = await res.json()

            const prevSession = { ...agent }
            if (!prevSession?.session) return
            prevSession.session.accessJwt = json.accessJwt
            prevSession.session.refreshJwt = json.refreshJwt
            const sessionJson = {
                server: agent.service.host,
                session: agent.session,
            }
            setAgent(prevSession as BskyAgent)
            localStorage.setItem("session", JSON.stringify(sessionJson))
            const existingAccountsData = { ...accounts }

            const { data } = await agent.getProfile({
                actor: agent.session.did,
            })

            existingAccountsData[agent.session.did] = {
                service: agent.service.host,
                session: agent.session,
                profile: {
                    did: agent.session.did,
                    displayName: data?.displayName || agent.session.handle,
                    handle: agent.session.handle,
                    avatar: data?.avatar || "",
                },
            }

            setAccounts(existingAccountsData)
        } catch (e) {
            console.log(e)
        }
    }, [agent, setAgent, setAccounts])
}

export default useRefreshSession
