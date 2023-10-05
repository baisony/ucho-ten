import { atom, useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

const translationLanguage = atomWithStorage<string>('translationLanguage', 'en')

export const useTranslationLanguage = () => useAtom(translationLanguage)
