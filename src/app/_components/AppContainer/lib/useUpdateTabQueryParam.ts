import { useEffect } from "react"
import { isTabQueryParamValue, TabQueryParamValue } from "@/app/_types/types"
import { ReadonlyURLSearchParams } from "next/dist/client/components/navigation"

export const useUpdateTabQueryParam = (
    pathName: string,
    searchParams: ReadonlyURLSearchParams,
    setNextQueryParams: (params: URLSearchParams) => void // 適切な型に置き換えてください
) => {
    useEffect(() => {
        const queryParams = new URLSearchParams(searchParams)

        let tabValue: TabQueryParamValue = "h"

        if (!queryParams.get("f")) {
            const pathComponents = pathName.split("/")

            if (pathComponents.length > 1) {
                switch (pathComponents[1]) {
                    case "":
                        tabValue = "h"
                        break
                    case "search":
                        tabValue = "s"
                        break
                    case "inbox":
                        tabValue = "i"
                        break
                    case "post":
                        tabValue = "p"
                        break
                }
            }
        } else {
            const f = queryParams.get("f")

            if (isTabQueryParamValue(f)) {
                tabValue = f
            } else {
                tabValue = "h"
            }
        }

        queryParams.set("f", tabValue)

        setNextQueryParams(queryParams)
    }, [pathName, searchParams])
}
