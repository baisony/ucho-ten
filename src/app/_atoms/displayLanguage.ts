import { atom, useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

const displayLanguage = atomWithStorage<string[]>('displayLanguage', ['en-US'])

export const useDisplayLanguage = () => useAtom(displayLanguage)
