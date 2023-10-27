;(function () {
    if (
        !("appearanceColor" in localStorage) ||
        JSON.parse(localStorage.getItem("appearanceColor")) === "system"
    ) {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            document.documentElement.classList.add("dark")
        }
        localStorage.setItem("appearanceColor", "system")
    } else if (JSON.parse(localStorage.getItem("appearanceColor")) === "dark") {
        document.documentElement.classList.add("dark")
    } else {
        document.documentElement.classList.remove("dark")
    }
})()
