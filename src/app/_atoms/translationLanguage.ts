import { atom, useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

const translationLanguage = atomWithStorage<string[]>('translationLanguage', ['en-US'])

export const useTranslationLanguage = () => useAtom(translationLanguage)
