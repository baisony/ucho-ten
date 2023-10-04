'use client';

import {TabBar} from "@/app/components/TabBar";
import {ViewPostCard} from "@/app/components/ViewPostCard";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {isMobile} from "react-device-detect";
import {useAgent} from "@/app/_atoms/agent";
import InfiniteScroll  from "react-infinite-scroller"
import {Spinner} from "@nextui-org/react"
import type { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import type { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowsRotate} from "@fortawesome/free-solid-svg-icons";
import {useSearchParams} from "next/navigation";



export default function Root(props:any) {
    const [agent, setAgent] = useAgent()
    const [loading, setLoading] = useState(false)
    const [loading2, setLoading2] = useState(false)
    const [timeline, setTimeline] = useState<FeedViewPost[]>([])
    const [availavleNewTimeline, setAvailableNewTimeline] = useState(false)
    const [newTimeline, setNewTimeline] = useState<FeedViewPost[]>([])
    const [newCursor, setNewCursor] = useState<string | null>(null)
    const [cursor, setCursor] = useState<string | null>(null)
    const [hasCursor, setHasCursor] = useState<string | null>(null)
    const [darkMode, setDarkMode] = useState(false);
    const [now, setNow] = useState<Date>(new Date())
    const color = darkMode ? 'dark' : 'light'
    const searchParams = useSearchParams()
    const selectedFeed = searchParams.get('feed') || 'following'
    console.log('hogehoge')
    const modeMe = (e:any) => {
        setDarkMode(!!e.matches);
    };

    useEffect(() => {
        const matchMedia = window.matchMedia("(prefers-color-scheme: dark)");

        setDarkMode(matchMedia.matches);
        matchMedia.addEventListener("change", modeMe);

        return () => matchMedia.removeEventListener("change", modeMe);
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setNow(new Date())
        }, 60 * 1000);
    
        return () => {
            clearInterval(intervalId);
        };
    }, []);

    const handleRefresh = () => {
        console.log('refresh');

        // newtimelineとtimelineの差分を取得
        console.log(timeline)
        console.log(newTimeline)
        const diffTimeline = newTimeline.filter(newItem => {
            return !timeline.some(oldItem => oldItem.post.uri === newItem.post.uri);
        });
        console.log(diffTimeline);
        // timelineに差分を追加
        setTimeline([...diffTimeline, ...timeline]);
        setCursor(newCursor)
        setAvailableNewTimeline(false);
    }

    const FormattingTimeline = (timeline: FeedViewPost[]) => {
        const seenUris = new Set<string>();
        const filteredData = timeline.filter(item => {
            const uri = item.post.uri;
            //console.log(item)
            if(item.post.embed) console.log(item.post.embed)
            if(item.reply){
                if(item.reason) return true
                //@ts-ignore
                if((item.post.author.did === item.reply.parent.author.did) && (item.reply.parent.author.did === item.reply.root.author.did)) return true
                return false
            }
            //これはおそらくparentやrootがミュートユーザーの時、recordにreplyが入って、authorが自分ではない場合は非表示
            //@ts-ignore
            if(item.post.record?.reply && item.post.author.did !== agent?.session?.did) return false
            // まだ uri がセットに登録されていない場合、trueを返し、セットに登録する
            if (!seenUris.has(uri)) {
                seenUris.add(uri);
                return true;
            }
            return false;
        });
        return filteredData as FeedViewPost[];
    }


    const fetchTimeline = async () => {
        if(!agent) return
        try{
            setLoading(true)
            let data
            if(selectedFeed === 'following'){
                ({data} = await agent.getTimeline({limit:30}))
            }else{
                ({data} = await agent.app.bsky.feed.getFeed({feed: selectedFeed, limit: 30}))
            }
            if (data) {
                if(data.cursor){
                    setCursor(data.cursor)
                }
                const {feed} = data
                const filteredData = FormattingTimeline(feed)
                setTimeline(filteredData);
            } else {
                // もしresがundefinedだった場合の処理
                console.log('Responseがundefinedです。')
            }
            setLoading(false)
        }catch(e){
            setLoading(false)
            console.log(e)
        }
    }

    const loadMore = useCallback(async (page:any) => {
        if(!agent) return
        if(!cursor) return
        console.log('loadMore')
        try{
            setLoading2(true)
            let data
            if(selectedFeed === 'following'){
                ({data} = await agent.getTimeline({cursor: !hasCursor ? cursor : hasCursor, limit:30}))
            }else{
                ({data} = await agent.app.bsky.feed.getFeed({feed: selectedFeed, cursor: !hasCursor ? cursor : hasCursor, limit: 30}))
            }
            const {feed} = data
            if(data.cursor){
                setHasCursor(data.cursor)
            }
            const filteredData = FormattingTimeline(feed)
            const diffTimeline = filteredData.filter(newItem => {
                return !timeline.some(oldItem => oldItem.post === newItem.post);
            });

            console.log(timeline)
            console.log(diffTimeline)

            //取得データをリストに追加
            setTimeline([...timeline, ...diffTimeline])
            setLoading2(false)
        }catch(e){
            setLoading2(false)
            console.log(e)
        }
    },[cursor, agent, timeline, hasCursor, selectedFeed])

    const checkNewTimeline = async () => {
        if(!agent) return
        try{
            let data
            if(selectedFeed === 'following'){
                ({data} = await agent.getTimeline({limit:30}))
            }else{
                ({data} = await agent.app.bsky.feed.getFeed({feed: selectedFeed, limit: 30}))
            }
            console.log(data.cursor)
            if (data) {
                const {feed} = data
                const filteredData = FormattingTimeline(feed)

                if(data.cursor && data.cursor !== cursor && data.cursor !== newCursor){
                    setNewCursor(data.cursor)
                    const diffTimeline = filteredData.filter(newItem => {
                        return !timeline.some(oldItem => oldItem.post.uri === newItem.post.uri);
                    });
                    console.log(diffTimeline);
                    setAvailableNewTimeline(true)
                    setNewTimeline(filteredData)
                }
            }
        }catch (e) {

        }
    }

    useEffect(() => {
        if(!agent) return
        fetchTimeline()
    },[agent, selectedFeed])

    useEffect(() => {
        const interval = setInterval(() => {
            checkNewTimeline()
        }, 15000)
        // クリーンアップ関数
        return () => {
            clearInterval(interval); // インターバルをクリーンアップ
        };
    },[agent, cursor, selectedFeed])

    return(
        <>
            {availavleNewTimeline && (
                <div className={' absolute flex justify-center z-[10] left-16 right-16 top-[120px]'}>
                    <div className={'text-black  bg-blue-50 rounded-full cursor-pointer pl-[10px] pr-[10px] pt-[5px] pb-[5px]'}
                         onClick={handleRefresh}
                    ><FontAwesomeIcon icon={faArrowsRotate}/> New Posts</div>
                </div>
            )}
            <>
                {
                    (loading) ? (
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
                            loader={<Spinner key="spinner-feed"/>}
                            threshold={1500}
                            useWindow={false}
                        >
                            {timeline.map((post, index) => (
                                    <ViewPostCard key={`${post?.reason ? `reason-${(post.reason as any).by.did}` : `post`}-${post.post.uri}`} color={color} numbersOfImage={0} postJson={post.post} json={post} isMobile={isMobile}/>
                            ))}
                        </InfiniteScroll>
                    )}
            </>
        </>
    )
}