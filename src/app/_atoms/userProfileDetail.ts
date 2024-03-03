import { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs"
import { atom, useAtom } from "jotai"

const userProfileDetailedAtom = atom<ProfileViewDetailed | null>(null)

export const useUserProfileDetailedAtom = () => useAtom(userProfileDetailedAtom)
