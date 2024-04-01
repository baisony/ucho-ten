// useGetOGPData.ts

interface OGPImage {
    blob: Response | undefined | null
    type: string
}

interface OGPData {
    title: string
    description: string
    thumb?: string
    uri: string
    alt: string
}

export const useGetOGPData = async (
    url: string,
    setIsOGPGetProcessing: React.Dispatch<React.SetStateAction<boolean>>,
    setIsGetOGPFetchError: React.Dispatch<React.SetStateAction<boolean>>,
    setGetOGPData: React.Dispatch<React.SetStateAction<OGPData | undefined>>,
    setOGPImage: React.Dispatch<React.SetStateAction<OGPImage[]>>
) => {
    console.log(url)
    setIsOGPGetProcessing(true)
    try {
        const res = await fetch(`/api/getOGPData/${encodeURIComponent(url)}`, {
            method: "GET",
        })
        if (res.status === 200) {
            const ogp = await res.json()
            const thumb =
                (ogp["image:secure_url"] ||
                    (ogp?.ogImage && ogp?.ogImage[0]?.url)) ??
                undefined
            const uri = url
            const json: OGPData = {
                title: ogp?.ogTitle,
                description: ogp?.ogDescription,
                uri: url,
                alt: ogp?.ogDescription || "",
            }
            if (json && thumb) {
                const generatedURL = thumb?.startsWith("http")
                    ? thumb
                    : uri && thumb?.startsWith("/")
                      ? `${uri.replace(/\/$/, "")}${thumb}`
                      : `${uri}${uri?.endsWith("/") ? "" : "/"}${thumb}`
                json.thumb = generatedURL
                const image = await fetch(
                    `https://ucho-ten-image-api.vercel.app/api/image?url=${generatedURL}`
                )
                setOGPImage([{ blob: image, type: "image/jpeg" }])
            }
            setGetOGPData(json)
            setIsOGPGetProcessing(false)
        } else {
            const json = {
                title: url,
                description: "",
                thumb: "",
                uri: url,
                alt: "",
            }
            setGetOGPData(json)
            setIsOGPGetProcessing(false)
        }
        return res
    } catch (e) {
        setIsOGPGetProcessing(false)
        setIsGetOGPFetchError(true)
        console.log(e)
        return e
    }
}
