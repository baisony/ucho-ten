import type { Metadata } from "next"
// import { Noto_Sans_JP } from "next/font/google"
import { Providers } from "./_components/Providers/Providers"
import { AppConatiner } from "./_components/AppContainer/AppContainer"
import Script from "next/script"

import "./globals.css"

// const noto = Noto_Sans_JP({
//     weight: ["400", "500", "600", "700", "900"],
//     subsets: ["latin"],
//     // variable: "--font-noto-sans-jp",
// })

export const metadata: Metadata = {
    title: "Ucho-ten Bluesky Client",
    description:
        "Ucho-tenは「他者から解放され、自己の独立」を目指すBlueskyクライアントです。いつでも新鮮な気持ちでSNSを使うことができます。",
    viewport:
        "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover",
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html
            lang="en"
            className={"overflow-hidden"}
            suppressHydrationWarning={true}
        >
            <head>
                <title>Ucho-ten</title>
                <meta charSet="utf-8" />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="Ucho-ten" />
                <meta property="og:title" content="Ucho-ten Bluesky Client" />
                <meta property="og:url" content="https://test.ucho-ten.net" />
                <meta property="og:locale" content="ja_JP" />
                <meta
                    name="description"
                    content="Ucho-tenは「他者から解放され、自己の独立」を目指すBlueskyクライアントです。いつでも新鮮な気持ちでSNSを使うことができます。"
                />
                <meta
                    property="og:description"
                    content="Ucho-tenは「他者から解放され、自己の独立」を目指すBlueskyクライアントです。いつでも新鮮な気持ちでSNSを使うことができます。"
                />
                <meta
                    property="og:image"
                    content="/images/ogp/ucho-ten-ogp.png"
                />
                <meta name="twitter:card" content="summarylargeimage" />
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
                <link rel="manifest" href="/manifest.json" />
                <link
                    rel="mask-icon"
                    href="/images/favicon/safari-pinned-tab.svg"
                    color="#000000"
                />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta
                    name="apple-mobile-web-app-status-bar-style"
                    content="black"
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
                <meta name="application-name" content="Ucho-ten" />
                <meta name="msapplication-TileColor" content="#b91d47" />
                <meta name="theme-color" content="#ffffff" />
                <meta name="robots" content="noarchive,max-image-preview" />
            </head>
            <body
                // className={`${noto.className}`}
                style={{
                    overscrollBehaviorY: "none",
                    overflowY: "auto",
                    WebkitOverflowScrolling: "touch",
                }}
                suppressHydrationWarning
            >
                <Script src="/noflash.js" />
                <Providers>
                    <AppConatiner>{children}</AppConatiner>
                </Providers>
            </body>
        </html>
    )
}
