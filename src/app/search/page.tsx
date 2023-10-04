'use client';
import {ViewPostCard} from "@/app/components/ViewPostCard";
import React, {useEffect} from "react";
import {useState} from "react";
import {isMobile} from "react-device-detect";
import {useAgent} from "@/app/_atoms/agent";
import {usePathname, useSearchParams} from 'next/navigation'
import {Image, Spinner} from "@nextui-org/react";
import type { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import type { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import InfiniteScroll  from "react-infinite-scroller"
import { useRouter } from 'next/navigation'

export default function Root() {
    const [agent, setAgent] = useAgent()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [loading2, setLoading2] = useState(false)
    const [searchPostsResult, setSearchPostsResult] = useState<PostView[]>([])
    const [searchUsersResult, setSearchUsersResult] = useState<ProfileView[]>([])
    const searchParams = useSearchParams()
    const searchWord = searchParams.get('word') || ''
    const target = searchParams.get('target') || 'posts'
    const [searchText, setSearchText] = useState(searchWord)
    const [searchTarget, setSearchTarget] = useState(target)
    const [darkMode, setDarkMode] = useState(false);
    const [numOfResult, setNumOfResult] = useState(0)
    const [now, setNow] = useState<Date>(new Date())
    const color = darkMode ? 'dark' : 'light'

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

    const fetchSearchResult = async (query: string) => {
        try {
            if (!agent) return;
            setLoading(true);
            if (query === '') return;
            const res = await fetch(`https://search.bsky.social/search/posts?q=${encodeURIComponent(query)}&offset=0`);
            const json = await res.json();
            setNumOfResult(json.length)
            const outputArray = json.map((item: any) => `at://${item.user.did as string}/${item.tid as string}`);

            if (outputArray.length === 0) return;

            const maxBatchSize = 25; // 1つのリクエストに許容される最大数
            const batches = [];
            for (let i = 0; i < outputArray.length; i += maxBatchSize) {
                const batch = outputArray.slice(i, i + maxBatchSize);
                batches.push(batch);
            }

            const results = [];

            for (const batch of batches) {
                const { data } = await agent?.getPosts({ uris: batch });
                const { posts } = data;
                results.push(...posts);
            }
            //console.log(results)

            setSearchPostsResult(results);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }

    const fetchSearchUsers = async (term: string) => {
        try{
            setLoading(true)
            if(!agent) return
            const {data} = await agent.searchActors({term: term})
            setSearchUsersResult(data.actors)
            setLoading(false)
        }catch (e) {

        }
    }

    const loadMore = async (page:any) => {
        if(!agent) return
        if(numOfResult === 0) return
        if(loading) return
        if(loading2) return
        try{
            setLoading2(true)
            const res = await fetch(`https://search.bsky.social/search/posts?q=${encodeURIComponent(searchText)}&offset=${numOfResult}`);
            console.log(res)
            const json = await res.json();
            const outputArray = json.map((item: any) => `at://${item.user.did as string}/${item.tid as string}`);

            if (outputArray.length === 0) return;

            const maxBatchSize = 25; // 1つのリクエストに許容される最大数
            const batches = [];
            for (let i = 0; i < outputArray.length; i += maxBatchSize) {
                const batch = outputArray.slice(i, i + maxBatchSize);
                batches.push(batch);
            }

            const results = [];
            for (const batch of batches) {
                const { data } = await agent?.getPosts({ uris: batch });
                const { posts } = data;
                results.push(...posts);
            }
            //重複する投稿を削除
            const diffTimeline = results.filter(newItem => {
                return !searchPostsResult.some(oldItem => oldItem.uri === newItem.uri);
            });

            setSearchPostsResult([...searchPostsResult,...diffTimeline])
            setNumOfResult(json.length === 30 ? numOfResult + json.length : 0)

            setLoading2(false)
        }catch(e){
            setLoading2(false)
            console.log(e)
        }
    }

    useEffect(() => {
        setSearchText(searchWord)
    },[searchWord])
    useEffect(() => {
        setSearchTarget(target)
    },[target])

    useEffect(() => {
        console.log('Effect')
        //console.log(searchText)
        if(searchText === '' || !searchText) return
        switch (searchTarget) {
            case 'posts':
                fetchSearchResult(searchText);
                break;
            case 'users':
                fetchSearchUsers(searchText);
                break;
        }
    }, [agent, searchText, searchTarget]);

    return(
        <>
            {target === 'posts' && (
                loading ? (
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
                           hasMore={!loading2 && numOfResult !==0}         //読み込みを行うかどうかの判定
                           threshold={300}
                           useWindow={false}
                        >
                             {searchPostsResult.map((post: PostView, index) => (
                                // eslint-disable-next-line react/jsx-key
                                <ViewPostCard key={`search-post-${post.uri}`} color={color} numbersOfImage={0} postJson={post}
                                           isMobile={isMobile} now={now}/>
                             ))}
                            {loading2 && (
                                <Spinner className={'flex justify-center '}/>

                            )}
                        </InfiniteScroll>
                    )
            )}
            {target === 'users' && (
                loading ? (
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
                    searchUsersResult.map((actor:ProfileView, index) => (
                        // eslint-disable-next-line react/jsx-key
                        //<ViewPostCard key={index} color={color} numbersOfImage={0} postJson={post} isMobile={isMobile}/>
                        <div key={`search-actor-${actor.did}`}
                             onClick={() => {
                                 router.push(`/profile/${actor.did}`)
                             }}
                                className={'w-full max-w-[600px] h-[100px] flex items-center bg-[#2C2C2C] text-[#D7D7D7] border-[#181818] border-b-[1px] overflow-x-hidden cursor-pointer'}>
                            <div className={'h-[50px] w-[50px] rounded-[10px] ml-[10px] mr-[10px]'}>
                                <Image className={'h-full w-full'} src={actor?.avatar} alt={'avatar image'}/>
                            </div>
                            <div className={'h-[50px]'}>
                                <div className={'flex w-full'}>
                                    <div className={''}>{actor.displayName}</div>
                                    <div className={'text-[#BABABA]'}>&nbsp;-&nbsp;</div>
                                    <div className={''}>{actor.handle}</div>
                                </div>
                                <div className={'w-[calc(500px)] whitespace-nowrap text-ellipsis overflow-hidden'}>{actor.description}</div>
                            </div>
                        </div>
                    ))
                )
            )}
        </>
    )
}