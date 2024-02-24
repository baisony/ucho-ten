import { useEffect } from "react"
import { MuteWord } from "@/app/_atoms/wordMute"
import { BskyAgent } from "@atproto/api"

export const useTransferMuteWord = (
    agent: BskyAgent | null,
    muteWords: MuteWord[], // 適切な型に置き換えてください
    setMuteWords: (muteWords: MuteWord[]) => void // 適切な型に置き換えてください
) => {
    useEffect(() => {
        if (!agent) return
        if (muteWords.length === 0) return
        // ミュートワードはあるけど新システムに移行してない場合

        for (const word of muteWords) {
            if (typeof word === "string") {
                const createdAt = new Date().getTime()
                const json = {
                    category: null,
                    word: word,
                    selectPeriod: null,
                    end: null,
                    isActive: true,
                    updatedAt: createdAt,
                    createdAt: createdAt,
                    deletedAt: null,
                }
                const isDuplicate = muteWords.find(
                    (muteWord: MuteWord) => muteWord.word === word
                )

                if (!isDuplicate) {
                    console.log("add")
                    //@ts-ignore
                    setMuteWords((prevMuteWords) => [...prevMuteWords, json])
                } else {
                    console.log("この単語は既に存在します") // TODO: i18n
                }
            }
        }
    }, [JSON.stringify(muteWords), agent])
}
