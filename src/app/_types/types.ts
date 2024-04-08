export type TabQueryParamValue = "h" | "s" | "u" | "i" | "p"

export const isTabQueryParamValue = (
    value: string | null
): value is TabQueryParamValue => {
    if (!value) return false
    return ["h", "s", "u", "i", "p"].includes(value)
}

export interface OGPData {
    title: string
    description: string
    thumb?: string
    uri: string
    alt: string
}

export interface OGPImage {
    blob: Response | undefined | null
    type: string
}

export interface reactionJson {
    reaction: string
    postUri: string
    reactionUri: string
}
