'use client';
import React, {useEffect, useState} from "react";
import {useAgent} from "@/app/_atoms/agent";
import InfiniteScroll  from "react-infinite-scroller"
import type { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import type { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import {usePathname} from "next/navigation";
import { viewFeedPage } from "./styles";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faHeart as faRegularHeart} from '@fortawesome/free-regular-svg-icons'
import {
    faArrowUpFromBracket, faHeart as faSolidHeart,
    faCheckCircle, faCircleQuestion, faCircleXmark,
    faHashtag, faLink, faThumbTack
} from '@fortawesome/free-solid-svg-icons'
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownSection,
    DropdownItem,
    Button,
    Image,
    Spinner,
    Input,
    Popover, PopoverTrigger, PopoverContent, useDisclosure, Link, Chip, Tooltip
} from "@nextui-org/react";
import 'react-swipeable-list/dist/styles.css';
import {ViewPostCard} from "@/app/components/ViewPostCard";
import {isMobile} from "react-device-detect";

interface Props {
    className?: string
    color: 'light' | 'dark'
    isMobile?: boolean
    isProfileMine?: true | false
    isSubscribe?: true | false
    isPinned?: true | false
}

export default function Root() {
    const [agent, setAgent] = useAgent()
    const [loading, setLoading] = useState(false)
    const [loading2, setLoading2] = useState(false)
    const pathname = usePathname()
    const username = pathname.replace('/profile/','')
    const atUri1 = pathname.replace('/profile/','at://')
    const atUri = atUri1.replace('/feed/','/app.bsky.feed.generator/')
    const [timeline, setTimeline] = useState<FeedViewPost[]>([])
    const [availavleNewTimeline, setAvailableNewTimeline] = useState(false)
    const [newTimeline, setNewTimeline] = useState<FeedViewPost[]>([])
    const [post, setPost] = useState<any>(null)
    const [newCursor, setNewCursor] = useState<string | null>(null)
    const [cursor, setCursor] = useState<string | null>(null)
    const [hasCursor, setHasCursor] = useState<string | null>(null)
    const [darkMode, setDarkMode] = useState(false);
    const [isLiked, setIsLiked] = useState<boolean>(false)
    const [isBookmarked, setIsBookmarked] = useState<boolean>(false)
    const [isPostMine, setIsPostMine] = useState<boolean>(false)
    const [isPinned, setIsPinned] = useState<boolean>(false)
    const [isSubscribed, setIsSubscribed] = useState<boolean>(false)
    const [isSubscribe, setIsSubscribe] = useState<boolean>(false)
    const [onHoverButton, setOnHoverButton] = useState(false);
    const [hasMoreLimit, setHasMoreLimit] = useState(false)
    const [feedInfo, setFeedInfo] = useState<any>(null)
    const [userPreference, setUserPreference] = useState<any>(null)
    const [now, setNow] = useState<Date>(new Date())

    const color = darkMode ? 'dark' : 'light'

    const { background, ProfileContainer, ProfileInfoContainer, HeaderImageContainer, ProfileHeaderImage,
        ProfileImage, ProfileDisplayName, ProfileHandle, ProfileCopyButton, ProfileActionButton,FollowButton,ProfileBio,Buttons, ShareButton, PostContainer, PinButton, dropdown,
    } = viewFeedPage();

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

    const FormattingTimeline = (timeline: FeedViewPost[]) => {
        const seenUris = new Set<string>();
        const filteredData = timeline.filter(item => {
            const uri = item.post.uri;
            if(item.reply){
                if(item.reason) return true
                //@ts-ignore
                if((item.post.author.did === item.reply.parent.author.did) && (item.reply.parent.author.did === item.reply.root.author.did)) return true
                return false
            }
            // まだ uri がセットに登録されていない場合、trueを返し、セットに登録する
            if (!seenUris.has(uri)) {
                seenUris.add(uri);
                return true;
            }
            return false;
        });
        return filteredData as FeedViewPost[];
    }

    const fetchUserPreference = async () => {
        if(!agent)return
        try{
            const res = await agent.getPreferences()
            console.log(res)
            setUserPreference(res)
            const {feeds} = res
            const {pinned,saved} = feeds
            if(pinned){
                setIsPinned(pinned.includes(atUri))
            }else{
                setIsPinned(false)
            }

            if(saved){
                console.log(saved.includes(atUri))
                setIsSubscribed(saved.includes(atUri))
            }else{
                setIsSubscribed(false)
            }
        }catch (e) {

        }
    }

    const fetchPost = async () => {
        if(!agent) return
        try{
            const feedInfo = await agent.app.bsky.feed.getFeedGenerator({feed: atUri})
            console.log(feedInfo)
            setFeedInfo(feedInfo.data)
            const {data} = await agent.app.bsky.feed.getFeed({feed: atUri})
            const {feed} = data
            setTimeline(feed)
        }catch (e) {

        }
    }

    const loadMore = async (page:any) => {
        if(!agent) return
        if(!cursor) return
        if(loading) return
        if(loading2) return
        try{
            setLoading2(true)
            const {data} = await agent.app.bsky.feed.getFeed({cursor: !hasCursor ? cursor : hasCursor, feed: atUri});
            const {feed} = data
            if(feed.length === 0) setHasMoreLimit(true)
            if(data.cursor){
                setHasCursor(data.cursor)
            }
            const filteredData = FormattingTimeline(feed)
            const diffTimeline = filteredData.filter(newItem => {
                return !timeline.some(oldItem => oldItem.post.uri === newItem.post.uri);
            });

            //取得データをリストに追加
            setTimeline([...timeline, ...diffTimeline])
            setLoading2(false)
        }catch(e){
            setLoading2(false)
            console.log(e)
        }
    }


    useEffect(() => {
        if(!agent) return
        fetchUserPreference()
        fetchPost()
    },[agent, atUri])

    const handleLikeClick= () => {
        if(!agent) return
        if(!feedInfo) return
        try {

        }catch (e) {
            
        }
    }


    return timeline && feedInfo && (
        <>
            <div className={ProfileContainer({color:color})}>
                <div className={ProfileInfoContainer()}>
                    <img className={ProfileImage()} src={feedInfo.view?.avatar}></img>
                    <div className={Buttons()}>
                        <div className={ProfileActionButton()}>
                            <FontAwesomeIcon icon={feedInfo.view?.viewer?.like ? faSolidHeart : faRegularHeart}
                                            style={{color: feedInfo.view?.viewer?.like ? '#ff0000' : '#000000'}}
                            />
                        </div>
                        <Dropdown className={dropdown({color:color})}>
                            <DropdownTrigger>
                                <div className={ProfileCopyButton()}>
                                    <FontAwesomeIcon icon={faArrowUpFromBracket} className={ShareButton({color:color})}/>

                                </div>
                            </DropdownTrigger>
                            <DropdownMenu >
                                <DropdownItem
                                    key="new"
                                >Copy feed url</DropdownItem>
                                <DropdownItem
                                    key="copy"
                                >Post this feed</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                        <div className={ProfileActionButton()}>
                            <FontAwesomeIcon icon={faThumbTack} className={PinButton({isPinned:isPinned})}/>
                        </div>
                        <Button className={FollowButton({color:color})}
                                onMouseLeave={() => {
                                    setOnHoverButton(false)
                                }}
                                onMouseEnter={() => {
                                    setOnHoverButton(true)
                                }}
                        >
                            {isSubscribed ? ('UnSubscribe') : ('Subscribe')}
                        </Button>
                    </div>
                    <div className={ProfileDisplayName({color:color})}>{feedInfo.view?.displayName}</div>
                    <div className={ProfileHandle()}>created by @{feedInfo.view.creator.handle}</div>
                    <div className={ProfileBio()}>{feedInfo.view?.description}</div>
                </div>
            </div>
            <>
                {
                    (loading || !agent) ? (
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
                            hasMore={!loading && !loading2 && !hasMoreLimit}         //読み込みを行うかどうかの判定
                            loader={<Spinner key="spinner-profile-feed"/>}
                            threshold={300}
                            useWindow={false}
                        >
                            {timeline.map((post, index) => (
                                <ViewPostCard key={`feed-${index}-${post.post.uri}`} color={color} numbersOfImage={0} postJson={post.post} json={post} isMobile={isMobile}/>
                            ))}
                        </InfiniteScroll>
                    )}
            </>
        </>
    )
}