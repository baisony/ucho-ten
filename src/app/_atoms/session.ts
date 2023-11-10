import { AtpSessionData } from "@atproto/api"
import { atomWithStorage } from "jotai/utils"

export interface SessionData {
  server: string
  session: AtpSessionData
}

export const sessionDataAtom = atomWithStorage<SessionData | null>("session", null)
