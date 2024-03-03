import { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { Record } from "@atproto/api/dist/client/types/app/bsky/feed/post"

export const translateText = async (
    translateTo: string[],
    postJson: PostView | undefined,
    postView: PostView | null
) => {
    if ((postView?.record as Record)?.text === undefined) {
        return
    }

    const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${
            translateTo[0] ? translateTo[0] : `auto`
        }&dt=t&q=` + encodeURIComponent((postView?.record as Record)?.text)
    )
    if (res.status === 200) {
        const json = await res.json()
        if (json[0] !== undefined) {
            const combinedText = json[0].reduce((acc: string, item: any[]) => {
                if (item[0]) {
                    return acc + item[0]
                }
                return acc
            }, "")
            console.log(combinedText)
            console.log(postJson)
            const translatedJson = JSON.parse(JSON.stringify(postJson))
            if (translatedJson && translatedJson.record) {
                translatedJson.record["text"] = combinedText
            }
            console.log(translatedJson)
            //setTranslatedText(combinedText)
            //setTranslatedJsonData(translatedJson)
            return translatedJson
        }
    } else {
        //setTranslateError(true)
    }
    return "null"
}
