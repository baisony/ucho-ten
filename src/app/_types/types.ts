export type TabQueryParamValue = "h" | "s" | "u" | "i" | "p"

export const isTabQueryParamValue = (
    value: any
): value is TabQueryParamValue => {
    return ["h", "s", "u", "i", "p"].includes(value)
}
