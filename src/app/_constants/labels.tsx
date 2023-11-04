type LabelActionsType = {
    [key: string]: {
        label: string
        key: string
    }
}

export const LABEL_ACTIONS: LabelActionsType = {
    porn: {
        label: "Adult Content",
        key: "nsfw",
    },
    nudity: {
        label: "Nudity Content",
        key: "nudity",
    },
    sexual: {
        label: "Sexual Content",
        key: "suggestive",
    },
    spam: {
        label: "Spam",
        key: "spam",
    },
    impersonation: {
        label: "Impersonation",
        key: "impersonation",
    },
    gore: {
        label: "Violence or Bloody",
        key: "gore",
    },
}
