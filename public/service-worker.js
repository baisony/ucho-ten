"use strict"

const CACHE_NAME = "cache-v1"
const urlsToCache = [
    //アイコン類
    "/images/icon/default_icon.svg",
    "/images/icon/default_feed_icon.svg",
    //背景画像
    "/images/backgroundImage/light/image.webp",
    "/images/backgroundImage/dark/image.webp",
    //ロゴ画像
    "./images/logo/ucho-ten.svg",
    "./images/logo/ucho-ten_logo_white.svg",
    "./images/logo/ucho-ten_logo_blue-white.svg",
    "./images/logo/ucho-ten_logo_black.svg",
    "./images/logo/ucho-ten_logo_orange-black.svg",
    //404
    "./images/404page/zazen_obousan.png",
    "./images/404page/404.png",
    //noflash.js
    "./noflash.js",
]

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Opened cache")
            // 指定されたリソースをキャッシュに追加する
            return cache.addAll(urlsToCache)
        })
    )
})

self.addEventListener("activate", (event) => {
    let cacheWhitelist = [CACHE_NAME]

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // ホワイトリストにないキャッシュ(古いキャッシュ)は削除する
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName)
                    }
                })
            )
        })
    )
})

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                return response
            }

            // 重要：リクエストを clone する。リクエストは Stream なので
            // 一度しか処理できない。ここではキャッシュ用、fetch 用と2回
            // 必要なので、リクエストは clone しないといけない
            let fetchRequest = event.request.clone()

            return fetch(fetchRequest).then((response) => {
                if (
                    !response ||
                    response.status !== 200 ||
                    response.type !== "basic"
                ) {
                    return response
                }

                // 重要：レスポンスを clone する。レスポンスは Stream で
                // ブラウザ用とキャッシュ用の2回必要。なので clone して
                // 2つの Stream があるようにする
                let responseToCache = response.clone()

                caches.open(CACHE_NAME).then((cache) => {
                    void cache.put(event.request, responseToCache)
                })

                return response
            })
        })
    )
})
