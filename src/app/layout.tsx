import type { Metadata, Viewport } from "next"
import { Providers } from "./_components/Providers/Providers"
import { AppConatiner } from "./_components/AppContainer/AppContainer"
import Script from "next/script"

import "./globals.css"

export const metadata: Metadata = {
    manifest: "/manifest.json",
    title: "Ucho-ten Bluesky Client",
    applicationName: "Ucho-ten",
    description:
        "Ucho-tenは「他者から解放され、自己の独立」を目指すBlueskyクライアントです。いつでも新鮮な気持ちでSNSを使うことができます。",
    openGraph: {
        type: "website",
        siteName: "Ucho-ten",
        title: "Ucho-ten Bluesky Client",
        url: "https://ucho-ten.net",
        locale: "ja_JP",
        description:
            "Ucho-tenは「他者から解放され、自己の独立」を目指すBlueskyクライアントです。いつでも新鮮な気持ちでSNSを使うことができます。",
        images: [
            {
                url: "https://ucho-ten.net/images/ogp/ucho-ten-ogp.png",
                alt: "Ucho-ten",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Ucho-ten Bluesky Client",
        description:
            "Ucho-tenは「他者から解放され、自己の独立」を目指すBlueskyクライアントです。いつでも新鮮な気持ちでSNSを使うことができます。",
        images: {
            url: "/images/ogp/ucho-ten-ogp.png",
        },
    },
}

const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    minimumScale: 1,
    maximumScale: 1,
    viewportFit: "cover",
    themeColor: "#000000",
    userScalable: false,
}

export { viewport }

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="ja" className={"overflow-hidden"}>
            <head>
                <title>Ucho-ten</title>
                <meta charSet="utf-8" />
                <link rel="preconnect" href={"https://bsky.network"} />
                <link rel="preconnect" href={"https://bsky.social"} />
                <link rel="preconnect" href={"https://cdn.bsky.app"} />
                <link
                    rel="shortcut icon"
                    href="/images/favicon/ucho-ten-logo-black.svg"
                    type="image/svg+xml"
                />
                <link
                    rel="apple-touch-icon"
                    sizes="180x180"
                    href="/images/favicon/apple-touch-icon.png"
                />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="32x32"
                    href="/images/favicon/favicon-32x32.png"
                />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="16x16"
                    href="/images/favicon/favicon-16x16.png"
                />
                <link
                    rel="mask-icon"
                    href="/images/favicon/safari-pinned-tab.svg"
                    color="#000000"
                />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta
                    name="apple-mobile-web-app-status-bar-style"
                    content="black-translucent"
                />
                <link
                    rel="apple-touch-startup-image"
                    media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)"
                    href="/images/splash/iPhone_15_Pro_Max__iPhone_15_Plus__iPhone_14_Pro_Max_landscape.png"
                />
                <link
                    rel="apple-touch-startup-image"
                    media="screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)"
                    href="/images/splash/iPhone_15_Pro__iPhone_15__iPhone_14_Pro_landscape.png"
                />
                <link
                    rel="apple-touch-startup-image"
                    media="screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)"
                    href="/images/splash/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_landscape.png"
                />
                <link
                    rel="apple-touch-startup-image"
                    media="screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)"
                    href="/images/splash/iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_landscape.png"
                />
                <link
                    rel="apple-touch-startup-image"
                    media="screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)"
                    href="/images/splash/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_landscape.png"
                />
                <link
                    rel="apple-touch-startup-image"
                    media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)"
                    href="/images/splash/iPhone_11_Pro_Max__iPhone_XS_Max_landscape.png"
                />
                <link
                    rel="apple-touch-startup-image"
                    media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)"
                    href="/images/splash/iPhone_11__iPhone_XR_landscape.png"
                />
                <link
                    rel="apple-touch-startup-image"
                    media="screen and (device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)"
                    href="/images/splash/iPhone_8_Plus__iPhone_7_Plus__iPhone_6s_Plus__iPhone_6_Plus_landscape.png"
                />
                <link
                    rel="apple-touch-startup-image"
                    media="screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)"
                    href="/images/splash/iPhone_8__iPhone_7__iPhone_6s__iPhone_6__4.7__iPhone_SE_landscape.png"
                />
                <link
                    rel="apple-touch-startup-image"
                    media="screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)"
                    href="/images/splash/4__iPhone_SE__iPod_touch_5th_generation_and_later_landscape.png"
                />
                <link
                    rel="apple-touch-startup-image"
                    media="screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)"
                    href="/images/splash/12.9__iPad_Pro_landscape.png"
                />
                <link
                    rel="apple-touch-startup-image"
                    media="screen and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)"
                    href="/images/splash/11__iPad_Pro__10.5__iPad_Pro_landscape.png"
                />
                <link
                    rel="apple-touch-startup-image"
                    media="screen and (device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2)"
                    href="/images/splash/10.9__iPad_Air_landscape.png"
                />
                <link
                    rel="apple-touch-startup-image"
                    media="screen and (device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)"
                    href="/images/splash/10.5__iPad_Air_landscape.png"
                />
                <link
                    rel="apple-touch-startup-image"
                    media="screen and (device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2)"
                    href="/images/splash/10.2__iPad_landscape.png"
                />
                <link
                    rel="apple-touch-startup-image"
                    media="screen and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)"
                    href="/images/splash/9.7__iPad_Pro__7.9__iPad_mini__9.7__iPad_Air__9.7__iPad_landscape.png"
                />
                <link
                    rel="apple-touch-startup-image"
                    media="screen and (device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2)"
                    href="/images/splash/8.3__iPad_Mini_landscape.png"
                />
                <link
                    rel="apple-touch-startup-image"
                    media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)"
                    href="/images/splash/iPhone_15_Pro_Max__iPhone_15_Plus__iPhone_14_Pro_Max_portrait.png"
                />
                <link
                    rel="apple-touch-startup-image"
                    media="screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)"
                    href="/images/splash/iPhone_15_Pro__iPhone_15__iPhone_14_Pro_portrait.png"
                />
                <link
                    rel="apple-touch-startup-image"
                    media="screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)"
                    href="/images/splash/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_portrait.png"
                />
                <link
                    rel="apple-touch-startup-image"
                    media="screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)"
                    href="/images/splash/iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_portrait.png"
                />
                <link
                    rel="apple-touch-startup-image"
                    media="screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)"
                    href="/images/splash/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_portrait.png"
                />
                <link
                    rel="apple-touch-startup-image"
                    media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)"
                    href="/images/splash/iPhone_11_Pro_Max__iPhone_XS_Max_portrait.png"
                />
                <link
                    rel="apple-touch-startup-image"
                    media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)"
                    href="/images/splash/iPhone_11__iPhone_XR_portrait.png"
                />
                <link
                    rel="apple-touch-startup-image"
                    media="screen and (device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)"
                    href="/images/splash/iPhone_8_Plus__iPhone_7_Plus__iPhone_6s_Plus__iPhone_6_Plus_portrait.png"
                />
                <link
                    rel="apple-touch-startup-image"
                    media="screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)"
                    href="/images/splash/iPhone_8__iPhone_7__iPhone_6s__iPhone_6__4.7__iPhone_SE_portrait.png"
                />
                <link
                    rel="apple-touch-startup-image"
                    media="screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)"
                    href="/images/splash/4__iPhone_SE__iPod_touch_5th_generation_and_later_portrait.png"
                />
                <link
                    rel="apple-touch-startup-image"
                    media="screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)"
                    href="/images/splash/12.9__iPad_Pro_portrait.png"
                />
                <link
                    rel="apple-touch-startup-image"
                    media="screen and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)"
                    href="/images/splash/11__iPad_Pro__10.5__iPad_Pro_portrait.png"
                />
                <link
                    rel="apple-touch-startup-image"
                    media="screen and (device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2)"
                    href="/images/splash/10.9__iPad_Air_portrait.png"
                />
                <link
                    rel="apple-touch-startup-image"
                    media="screen and (device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)"
                    href="/images/splash/10.5__iPad_Air_portrait.png"
                />
                <link
                    rel="apple-touch-startup-image"
                    media="screen and (device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2)"
                    href="/images/splash/10.2__iPad_portrait.png"
                />
                <link
                    rel="apple-touch-startup-image"
                    media="screen and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)"
                    href="/images/splash/9.7__iPad_Pro__7.9__iPad_mini__9.7__iPad_Air__9.7__iPad_portrait.png"
                />
                <link
                    rel="apple-touch-startup-image"
                    media="screen and (device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2)"
                    href="/images/splash/8.3__iPad_Mini_portrait.png"
                />
                <meta name="apple-mobile-web-app-title" content="Ucho-ten" />
                <meta name="msapplication-TileColor" content="#b91d47" />
                <meta name="robots" content="noarchive,max-image-preview" />
            </head>
            <body
                style={{
                    overscrollBehavior: "none",
                    WebkitOverflowScrolling: "touch",
                    height: "100vh",
                    margin: 0,
                    width: "100%",
                }}
                className={"bg-white dark:bg-black"}
            >
                <Script src="/noflash.js" />
                <Providers>
                    <AppConatiner>{children}</AppConatiner>
                </Providers>
            </body>
        </html>
    )
}
