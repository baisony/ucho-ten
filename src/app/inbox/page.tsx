'use client';
import {ViewPostCard} from "@/app/components/ViewPostCard";
import React, {useEffect} from "react";
import {useState} from "react";
import {isMobile} from "react-device-detect";
import {useAgent} from "@/app/_atoms/agent";
import type { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import InfiniteScroll  from "react-infinite-scroller"
import {Spinner} from "@nextui-org/react"


export default function Root() {
    const [agent, setAgent] = useAgent()
    const [loading, setLoading] = useState(false)
    const [loading2, setLoading2] = useState(false)
    const [notification, setNotification] = useState<PostView[]>([])
    const [list, setList] = useState([]);          //表示するデータ
    const [hasMore, setHasMore] = useState(true);  //再読み込み判定
    const [cursor, setCursor] = useState<string>('')
    const [darkMode, setDarkMode] = useState(false);
    const [now, setNow] = useState<Date>(new Date())
    const color = darkMode ? 'dark' : 'light'

    useEffect(() => {
        const intervalId = setInterval(() => {
            setNow(new Date())
        }, 60 * 1000);
    
        return () => {
            clearInterval(intervalId);
        };
    }, []);

    const fetchNotification = async () => {
        try{
            if(!agent) return
            setLoading(true)
            const {data} = await agent.listNotifications()
            if (data) {
                if(data.cursor){
                    setCursor(data.cursor)
                }
                const replyNotifications = data.notifications.filter(notification => notification.reason === 'reply' || notification.reason === 'mention')
                const hoge = await agent.getPosts({ uris: replyNotifications.map((notification: any) => notification.uri) })
                setNotification(hoge.data.posts)

            } else {
                // もしresがundefinedだった場合の処理
                console.log('Responseがundefinedです。')
            }
            setLoading(false)
            console.log(notification)
        }catch(e){
            setLoading(false)
            console.log(e)
        }
    }
    const loadMore = async (page:any) => {
        if(!agent) return
        if(cursor === '') return
        try{
            setLoading2(true)
            const {data} = await agent.listNotifications({cursor: cursor});
            const {notifications} = data
            console.log(data.cursor)
            if(data.cursor){
                setCursor(data.cursor)
            }
            const replyNotifications = notifications.filter(notification => notification.reason === 'reply' || notification.reason === 'mention')
            const hoge = await agent.getPosts({ uris: replyNotifications.map((notification: any) => notification.uri) })

            //取得データをリストに追加
            setNotification([...notification, ...hoge.data.posts])
            setLoading2(false)
        }catch(e){
            setLoading2(false)
            console.log(e)
        }
    }

    const modeMe = (e:any) => {
        setDarkMode(!!e.matches);
    }

    useEffect(() => {
        const matchMedia = window.matchMedia("(prefers-color-scheme: dark)");
        setDarkMode(matchMedia.matches);
        matchMedia.addEventListener("change", modeMe);
        return () => matchMedia.removeEventListener("change", modeMe);
    }, []);

    useEffect(() => {
        if(!agent) return
        console.log('Effect')
        fetchNotification();
    }, [agent]);

    return(
        <>
            {loading ? (
                Array.from({ length: 15 }, (_, index) => (
                    <ViewPostCard
                        key={`skeleton-${index}`}
                        color={color}
                        numbersOfImage={0}
                        postJson={null}
                        isMobile={isMobile}
                        isSkeleton={true}
                    />
                ))
            ) : (
                <InfiniteScroll
                    loadMore={loadMore}    //項目を読み込む際に処理するコールバック関数
                    hasMore={!loading2}         //読み込みを行うかどうかの判定
                    loader={<Spinner key="spinner-inbox"/>}
                    threshold={700}
                    useWindow={false}
                >
                    {notification.map((post, index) => (
                        // eslint-disable-next-line react/jsx-key
                        <ViewPostCard key={post.uri} color={color} numbersOfImage={0} postJson={post} isMobile={isMobile} now={now}/>
                    ))}
                </InfiniteScroll>
            )}
        </>
    )
}