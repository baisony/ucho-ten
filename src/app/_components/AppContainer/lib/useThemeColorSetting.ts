import { useLayoutEffect } from "react"

export const useThemeColorSetting = (
    appearanceColor: string | null,
    pathName: string
) => {
    useLayoutEffect(() => {
        console.log(appearanceColor)
        if (pathName === "/login" || pathName === "/") return
        // DarkモードとLightモードの判定
        const isDarkMode = document.documentElement.classList.contains("dark")

        // theme-colorの設定
        const themeColor = isDarkMode ? "#000000" : "#FFFFFF"
        const element = document.querySelector("meta[name=theme-color]")!
        element?.setAttribute("content", themeColor)
    }, [appearanceColor, pathName])
}
