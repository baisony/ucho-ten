export type TabQueryParamValue = "h" | "s" | "i" | "p"

export const isTabQueryParamValue = (
    value: any
): value is TabQueryParamValue => {
    return ["h", "s", "i", "p"].includes(value)
}
