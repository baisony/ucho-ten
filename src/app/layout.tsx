import './globals.css'
import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import { Providers } from './providers';
import {AppConatiner} from "./appContainer";


const noto = Noto_Sans_JP({
    weight: ['400', '700'],
    subsets: ['latin'],
    variable: '--font-noto-sans-jp',
});
export const metadata = {
    title: 'タイトル',
    description: '説明...',
    viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({children,}: { children: React.ReactNode }) {


  return (
    <html lang="en" className={'overflow-hidden'} suppressHydrationWarning={true}>
      <head>
        <title>Ucho-ten</title>
        <meta charSet="utf-8"/>
        <meta property="og:type" content="website"/>
        <meta property="og:site_name" content="Ucho-ten"/>
        <meta property="og:title" content="Ucho-ten Bluesky Client"/>
        <meta property="og:url" content="https://test.ucho-ten.net"/>
        <meta property="og:locale" content="ja_JP"  />
        <meta name="description" content="Ucho-tenは「他者から解放され、自己の独立」を目指すBlueskyクライアントです。いつでも新鮮な気持ちでSNSを使うことができます。"/>
        <meta property="og:description" content='Ucho-tenは「他者から解放され、自己の独立」を目指すBlueskyクライアントです。いつでも新鮮な気持ちでSNSを使うことができます。'/>
        <meta property="og:image" content="/images/ogp/ucho-ten-ogp.png"/>
        <meta name="twitter:card" content="summarylargeimage"/>
        <link rel="shortcut icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="robots" content="noarchive,max-image-preview"/>
      </head>
      <body className={`${noto.className} font-body`} style={{overscrollBehaviorY:'none', WebkitOverflowScrolling: 'touch'}} suppressHydrationWarning>
        <Providers>
          <AppConatiner>
            {children}
          </AppConatiner>
        </Providers>
      </body>
    </html>
  )
}
