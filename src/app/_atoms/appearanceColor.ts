import { atom, useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

const appearanceColor = atomWithStorage<'system'| 'light' | 'dark'>('appearanceColor', 'system')

export const useAppearanceColor = () => useAtom(appearanceColor)
