// Insert this script in your index.html right after the <body> tag.
// This will help to prevent a flash if dark mode is the default.

;(function () {
    // Change these if you use something different in your hook.
    // LocalStorage に theme が保存されていない or theme が system の場合
    if (
        !("appearanceColor" in localStorage) ||
        JSON.parse(localStorage.getItem("appearanceColor")) === "system"
    ) {
        // OS の設定を読み取る
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            // OS の設定がダークモードの場合、<html> に dark クラスを付与する
            document.documentElement.classList.add("dark")
        }
        // LocalStorage に設定を保存する
        localStorage.setItem("theme", "system")
    } else if (JSON.parse(localStorage.getItem("appearanceColor")) === "dark") {
        // LocalStorage に theme が保存されていて、theme が dark の場合
        document.documentElement.classList.add("dark")
    } else {
        // それ以外の場合
        document.documentElement.classList.remove("dark")
    }
})()
