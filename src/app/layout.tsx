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
    title: "タイトル",
    description: "説明...",
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
                <meta name="robots" content="noarchive,max-image-preview" />
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
                <link rel="manifest" href="/images/favicon/site.webmanifest" />
                <link
                    rel="mask-icon"
                    href="/images/favicon/safari-pinned-tab.svg"
                    color="#000000"
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
