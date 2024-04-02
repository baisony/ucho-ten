export type TabQueryParamValue = "h" | "s" | "u" | "i" | "p"

export const isTabQueryParamValue = (
    value: any
): value is TabQueryParamValue => {
    return ["h", "s", "u", "i", "p"].includes(value)
}

export interface OGPData {
    title: string
    description: string
    thumb?: string
    uri: string
    alt: string
}
