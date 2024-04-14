// useContentLabels.ts
import { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { ViewRecord } from "@atproto/api/dist/client/types/app/bsky/embed/record"

interface UserPreference {
    adultContentEnabled: boolean
    contentLabels: { [key: string]: string } | null
}

interface LabelActions {
    [key: string]: { label: string; key: string }
}

const LABEL_ACTIONS: LabelActions = {
    nsfw: { label: "Adult Content", key: "nsfw" },
    porn: { label: "Adult Content", key: "nsfw" },
    sexual: { label: "Sexual Content", key: "suggestive" },
    suggestive: { label: "Suggestive", key: "suggestive" },
    nudity: { label: "Nudity", key: "nudity" },
    hate: { label: "Hate Speech", key: "hate" },
    spam: { label: "Spam", key: "spam" },
    impersonation: { label: "Impersonation", key: "impersonation" },
    gore: { label: "Gore", key: "gore" },
}

const useContentLabels = (
    userPreference: UserPreference | null,
    postJson: PostView | undefined,
    quoteJson: ViewRecord | undefined,
    handleInputChange: (
        action: string,
        uri: string,
        reactionUri: string
    ) => void,
    setContentWarning: (value: boolean) => void
) => {
    if (!userPreference) {
        return
    }

    const post = postJson || quoteJson

    if (!post || !post.labels || post.labels.length === 0) {
        return
    }

    let warningReason: string | null | undefined = ""

    post.labels.forEach((label) => {
        const labelType = LABEL_ACTIONS[label.val]
        if (labelType) {
            const { label: warningLabel, key } = labelType
            switch (key) {
                case "nsfw":
                case "suggestive":
                case "nudity":
                    if (!userPreference.adultContentEnabled) {
                        handleInputChange("delete", postJson?.uri || "", "")
                    }
                case "hate":
                case "spam":
                case "impersonation":
                case "gore":
                    const action =
                        userPreference.contentLabels?.[
                            key === "suggestive" || key === "nudity"
                                ? "nsfw"
                                : key
                        ]
                    if (action === "warn") {
                        setContentWarning(true)
                        warningReason = warningLabel
                    } else if (action === "hide") {
                        handleInputChange("delete", postJson?.uri || "", "")
                    }
                    break
                default:
                    break
            }
        } else {
            console.log(label)
        }
    })

    return warningReason
}

export default useContentLabels
