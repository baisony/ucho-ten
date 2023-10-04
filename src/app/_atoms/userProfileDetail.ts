import { AppBskyActorDefs } from '@atproto/api'
import { atom, useAtom } from 'jotai'

const userProfileDetailedAtom = atom<AppBskyActorDefs.ProfileViewDetailed | null>(null)

export const useUserProfileDetailedAtom = () => useAtom(userProfileDetailedAtom)