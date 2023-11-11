import { AtpSessionData } from "@atproto/api"
import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"

export interface SessionData {
    server: string
    session: AtpSessionData
}

const sessionDataAtom = atomWithStorage<SessionData | undefined>(
    "session",
    undefined
)

export const useSessionData = () => useAtom(sessionDataAtom)
