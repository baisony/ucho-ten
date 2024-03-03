// useLanguagesSelectionChangeHandler.ts

import { Selection } from "@nextui-org/react"

export const useLanguagesSelectionChangeHandler = (
    keys: Selection,
    setPostLanguage: React.Dispatch<React.SetStateAction<string[]>>
) => {
    if (Array.from(keys).length < 4) {
        setPostLanguage(Array.from(keys) as string[])
    }
}
