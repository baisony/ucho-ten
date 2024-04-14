// useDetectURL.ts

export const useDetectURL = (
    text: string,
    setDetectURLs: React.Dispatch<React.SetStateAction<string[]>>,
    setIsDetectURL: React.Dispatch<React.SetStateAction<boolean>>
) => {
    // URLを検出する正規表現パターン
    const urlPattern =
        /(?:https?|ftp):\/\/[\w-]+(?:\.[\w-]+)+(?:[\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/g
    const urls = text.match(urlPattern)
    setDetectURLs([])

    if (urls && urls.length > 0) {
        setIsDetectURL(true)
        urls.forEach((url) => {
            setDetectURLs((prevURLs) => [...prevURLs, url])
        })
    }
}
