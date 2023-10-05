import { atom, useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

const displayLanguage = atomWithStorage<string>('displayLanguage', 'en')

export const useDisplayLanguage = () => useAtom(displayLanguage)
