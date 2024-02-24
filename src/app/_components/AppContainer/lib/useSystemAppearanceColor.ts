import { useEffect } from "react"

export const useSystemAppearanceColor = () => {
    useEffect(() => {
        const mediaQueryListener = (e: MediaQueryListEvent) => {
            const appearanceColor = localStorage.getItem("appearanceColor")

            if (appearanceColor) {
                const parsedAppearanceColor = JSON.parse(appearanceColor)
                if (parsedAppearanceColor === "system") {
                    if (e.matches) {
                        document.documentElement.classList.add("dark")
                        const element = document.querySelector(
                            "meta[name=theme-color]"
                        )!
                        element?.setAttribute("content", "#000000")
                    } else {
                        document.documentElement.classList.remove("dark")
                        const element = document.querySelector(
                            "meta[name=theme-color]"
                        )!
                        element?.setAttribute("content", "#FFFFFF")
                    }
                }
            }
        }

        const mql = window.matchMedia("(prefers-color-scheme: dark)")
        mql.addEventListener("change", mediaQueryListener)

        // Clean up the event listener on component unmount
        return () => {
            mql.removeEventListener("change", mediaQueryListener)
        }
    }, [])
}
