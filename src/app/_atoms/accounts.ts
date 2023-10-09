import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"
import type { AtpSessionData } from "@atproto/api"

export interface UserAccount {
    service: string
    session: AtpSessionData
    profile: {
        did: string
        displayName: string
        handle: string
        avatar: string
    }
}

export interface UserAccountByDid {
    [key: string]: UserAccount
}

const accounts = atomWithStorage<UserAccountByDid[]>("Accounts", [])

export const useAccounts = () => useAtom(accounts)
