import { BskyPreferences } from '@atproto/api'
import { atom, useAtom } from 'jotai'

const userPreferences = atom<BskyPreferences | null>(null)

export const useUserPreferencesAtom = () => useAtom(userPreferences)
