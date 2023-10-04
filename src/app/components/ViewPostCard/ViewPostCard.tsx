import React, {useCallback, useState, useMemo, useEffect} from "react";
import { viewPostCard } from "./styles";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faComment } from '@fortawesome/free-regular-svg-icons'
import {faRetweet, faEllipsis, faFlag, faLink, faCode, faTrash, faUser} from '@fortawesome/free-solid-svg-icons'
import { faStar as faHeartRegular } from '@fortawesome/free-regular-svg-icons'
import { faStar as faHeartSolid, faHashtag, faCheckCircle, faCircleXmark, faCircleQuestion, faReply } from '@fortawesome/free-solid-svg-icons'
import {PostModal} from "../PostModal";
import 'react-circular-progressbar/dist/styles.css';
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownSection,
    DropdownItem,
    Link,
    Skeleton,
    Chip,
    Tooltip,
    ScrollShadow,
    Image,
} from "@nextui-org/react";
import 'react-swipeable-list/dist/styles.css';
import {useAgent} from "@/app/_atoms/agent";
import {useRouter} from "next/navigation";
import {Modal, ModalContent, useDisclosure} from "@nextui-org/react";
import { formattedSimpleDate } from "@/app/_lib/strings/datetime";
import { ImageGalleryObject, useImageGalleryAtom } from "@/app/_atoms/imageGallery";


interface Props {
    className?: string
    color: 'light' | 'dark'
    isMobile?: boolean
    uploadImageAvailable?: boolean
    isDragActive?: boolean
    open?: boolean
    numbersOfImage?: 0 | 1 | 2 | 3 | 4,
    postJson?: any
    isSkeleton?: boolean
    json?: any
    isEmbedToModal?: boolean
    now?: Date
}
export const ViewPostCard: React.FC<Props> = (props: Props) => {
    const [ agent ] = useAgent()
    const [imageGallery, setImageGallery] = useImageGalleryAtom()
    const router = useRouter()
    const {className, color, isMobile, uploadImageAvailable, open, numbersOfImage, postJson, isSkeleton, json, isEmbedToModal, now} = props;
    const reg = /^[\u0009-\u000d\u001c-\u0020\u11a3-\u11a7\u1680\u180e\u2000-\u200f\u202f\u205f\u2060\u3000\u3164\ufeff\u034f\u2028\u2029\u202a-\u202e\u2061-\u2063]*$/;
    const [loading, setLoading] = useState(false)
    const [isHover, setIsHover] = useState<boolean>(false)
    const { PostCard, PostAuthor, PostContent, PostReactionButtonContainer, PostCardContainer, PostReactionButton,
        PostAuthorIcon, PostAuthorDisplayName, PostAuthorHandle, PostCreatedAt, dropdown,skeletonIcon, skeletonName, skeletonHandle, skeletonText1line, skeletonText2line,chip } = viewPostCard();
    const [isLiked, setIsLiked] = useState<boolean>(postJson?.viewer?.like)
    const [isReposted, setIsReposted] = useState<boolean>(postJson?.viewer?.repost)
    const [isPostModalOpen, setIsPostModalOpen] = useState<boolean>(false)
    const [isSwipeEnabled, setIsSwipeEnabled] = useState(true);
    const [postInfo, setPostInfo] = useState<any>(null)
    const [isTextSelectionInProgress, setIsTextSelectionInProgress] = useState(false);
    const [startX, setStartX] = useState(null);
    const [startY, setStartY] = useState(null);
    const [handleButtonClick, setHandleButtonClick] = useState(false);
    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    const handleReply = async () => {
        //setIsPostModalOpen(true)
        console.log('open')
        onOpen()
    }

    const handleRepost = async () => {
        if(loading) return
        setLoading(true)
        if(isReposted){
            setIsReposted(!isReposted)
            const res = await agent?.deleteRepost(postJson?.viewer?.repost)
            console.log(res)
        }else{
            setIsReposted(!isReposted)
            const res = await agent?.repost(postJson?.uri, postJson?.cid)
            console.log(res)
        }
        setLoading(false)
    }

    const handleLike = async () => {
        if(loading) return
        setLoading(true)
        if(isLiked){
            setIsLiked(!isLiked)
            const res = await agent?.deleteLike(postJson?.viewer?.like)
            console.log(res)
        }else{
            setIsLiked(!isLiked)
            const res = await agent?.like(postJson?.uri, postJson?.cid)
            console.log(res)
        }
        setLoading(false)
    }

    const handleImageClick = useCallback((index: number) => {
        if (postJson?.embed?.images && Array.isArray(postJson.embed.images)) {
            let imageURLs: string[] = []

            for(const image of postJson.embed.images) {
                if (typeof image.fullsize === "string") {
                    imageURLs.push(image.fullsize)
                }
            }

            if (imageURLs.length > 0) {
                const gelleryObject: ImageGalleryObject = {
                    imageURLs: imageURLs,
                    index,
                }

                setImageGallery(gelleryObject)
            }
        }
    }, [postJson])

    const renderTextWithLinks = useMemo(() => {
        if(!postJson?.record) return
        const encoder = new TextEncoder();
        let decoder = new TextDecoder();
        if(!postJson.record?.facets){
            let post: any[] = []
            postJson.record.text.split('\n').map((line:any, i:number) => {
                post.push(<p key={i}>{line}<br/></p>)
            })
            return post
        }
        const { text, facets } = postJson.record;
        const text_bytes = encoder.encode(text);
        let result: any[] = [];
        let lastOffset = 0;
        facets.forEach((facet:any, index:number) => {
            const { byteStart, byteEnd } = facet.index;

            const facetText = decoder.decode(text_bytes.slice(byteStart, byteEnd));

            // 直前のテキストを追加
            if (byteStart > lastOffset) {
                const nonLinkText = decoder.decode(text_bytes.slice(lastOffset, byteStart));
                const textChunks = nonLinkText.split('\n').map((line, index, array) => (
                    <span key={`text-${byteStart}-${index}`}>{line}{index !== array.length - 1 && <br/>}</span>
                ));
                result.push(textChunks);
            }

            switch (facet.features[0].$type) {
                case "app.bsky.richtext.facet#mention":
                    result.push(
                        <span key={`link-${index}-${byteStart}`}
                              className={'text-blue-500'}
                             onClick={(e) => {
                                 e.preventDefault()
                                 e.stopPropagation()
                                 router.push(`/profile/${facet.features[0].did}`)
                             }}
                        >
                            {facetText}
                        </span>
                    )
                    break

                case "app.bsky.richtext.facet#link":
                    result.push(
                        <span key={`link-${index}-${byteStart}`}>
                            <Chip
                                className={chip({color:color})}
                                startContent={<Tooltip showArrow={true} color={'foreground'}
                                    content={facetText === facet.features[0].uri ? "リンク偽装の心配はありません。" : facet.features[0].uri.includes(facetText.replace('...', '')) ?  'URL短縮の可能性があります。' : 'リンク偽装の可能性があります。'}
                                >
                                    <FontAwesomeIcon icon={facetText === facet.features[0].uri ? faCheckCircle : facet.features[0].uri.includes(facetText.replace('...', '')) ? faCircleQuestion : faCircleXmark} />
                                </Tooltip>}
                                variant="faded"
                                color={facetText === facet.features[0].uri ? "success" : facet.features[0].uri.includes(facetText.replace('...', '')) ? 'default' : "danger"}
                            >
                                {(facet.features[0].uri).startsWith('https://bsky.app') ? (
                                    <span key={`a-${index}-${byteStart}`}
                                         onClick={(e) => {
                                             e.preventDefault()
                                             e.stopPropagation()
                                             router.push(facet.features[0].uri.replace('https://bsky.app',`${location.protocol}//${window.location.host}`))
                                         }}
                                    >
                                        {facetText}
                                    </span>
                                ) : (
                                    <a onMouseUp={(e) => e.stopPropagation()}
                                       key={`a-${index}-${byteStart}`} href={facet.features[0].uri} target={"_blank"} rel={"noopener noreferrer"}>
                                        {facetText}
                                    </a>
                                )}
                            </Chip>
                        </span>
                    )
                    break

                case "app.bsky.richtext.facet#tag":
                    result.push(
                        <span key={`link-${index}-${byteStart}`}>
                            <Chip
                                className={chip({color:color})}
                                startContent={<FontAwesomeIcon icon={faHashtag} />}
                                variant="faded"
                                color="primary"
                            >
                                <span key={`a-${index}-${byteStart}`}
                                      onClick={(e) => {
                                          e.preventDefault()
                                          e.stopPropagation()
                                          router.push(`/search?word=%23${(facet.features[0].tag.replace('#', ''))}&target=posts`)
                                      }}
                                >
                                   {facetText.replace('#', '')}
                                </span>
                            </Chip>
                        </span>
                    )
                    break
            }
            lastOffset = byteEnd;
        })

        if (lastOffset < text_bytes.length) {
            const nonLinkText = decoder.decode(text_bytes.slice(lastOffset));
            const textWithLineBreaks = nonLinkText.split('\n').map((line, index) => (
                <span key={`div-${lastOffset}-${index}`}>
                    {line}
                    {index !== nonLinkText.length - 1 && <br />}
                </span>
            ))
            result.push(textWithLineBreaks);
        }
        return result
    },[])

    // function formatDate(inputDate: string): string {
    //     const date = new Date(inputDate);
    //     if (isNaN(date.getTime())) return "Invalid date" // 無効な日付が与えられた場合
    //     const now = new Date();
    //     const year = date.getFullYear();
    //     const month = date.getMonth() + 1; // 月は0から始まるため+1する
    //     const day = date.getDate();

    //     if (
    //         year === now.getFullYear() &&
    //         month === now.getMonth() + 1 &&
    //         day === now.getDate()
    //     ) {
    //         // 今日の場合
    //         const hours = date.getHours();
    //         const minutes = date.getMinutes();
    //         return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    //     } else if (year === now.getFullYear()) {
    //         // 今年の場合
    //         return `${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}`;
    //     } else {
    //         // 今年以外の場合
    //         const shortYear = year % 100;
    //         return `${String(shortYear).padStart(2, "0")}/${String(month).padStart(2, "0")}/${String(
    //             day
    //         ).padStart(2, "0")}`;
    //     }
    // }
    const handleMouseUp = (e:any) => {
        // マウスダウンしていない状態でクリックされた場合は何もしない
        if (startX === null || startY === null) return

        // マウスが動いた場合の座標
        const currentX = e.clientX;
        const currentY = e.clientY;

        // クリックが発生した座標との差を計算
        const deltaX = Math.abs(currentX - startX);
        const deltaY = Math.abs(currentY - startY);

        // カーソルが一定の閾値以上動いた場合にクリックをキャンセル
        if (deltaX > 5 || deltaY > 5) {
            console.log('cancel click')
            //e.preventDefault();
            //e.stopPropagation();
        }else{
            router.push(`/profile/${postJson?.author.did}/post/${postJson?.uri.match(/\/(\w+)$/)?.[1] || ""}`)
        }
    }

    const handleMouseDown = (e:any) => {
        // マウスダウン時の座標を記録
        setStartX(e.clientX);
        setStartY(e.clientY);
    }

    return (
      <>
          <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement={isMobile ? 'top' : 'center'} className={'z-[100] max-w-[600px]'}>
              <ModalContent
              >
                  {(onClose) => (
                      <PostModal color={color} type={'Reply'} postData={postJson} onClose={onClose}/>
                  )}
              </ModalContent>
          </Modal>
          <main className={`${PostCard({color:color})} ${isEmbedToModal ? `bg-transparent border-none` : `cursor-pointer`}`}
                //style={{backgroundColor: isEmbedToModal ? 'transparent'}}
                onMouseDown={(e) => {
                    handleMouseDown(e)
                }}
                onMouseUp={(e) => {
                    if(isEmbedToModal) return
                    handleMouseUp(e)
                }}
          >
              <>
                  <>

                      <div className={`${PostCardContainer()} ${isEmbedToModal && `pt-[0px]`}`}
                           onMouseEnter={() => {
                               setIsHover(true)
                           }}
                           onMouseLeave={() => {
                               setIsHover(false)
                           }}
                      >
                          {json?.reason && (
                              <span className={'text-[13px] ml-[40px] text-[#909090] text-bold hover:cursor-pointer'}
                                 onClick={(e) => {
                                     e.preventDefault()
                                     e.stopPropagation()
                                     router.push(`/profile/${postJson?.author.did}`)
                                 }}
                              >
                                  Reposted by {json.reason.by.displayName}
                              </span>
                          )}
                          <div className={`${PostAuthor()}`}>
                              <span className={PostAuthorIcon()}
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    router.push(`/profile/${postJson?.author.did}`)
                                }}
                              >
                                  {isSkeleton ? (
                                      <Skeleton className={skeletonIcon({color:color})}/>
                                  ) : (
                                      <>
                                          {postJson?.author?.avatar ? (
                                              <Image src={postJson?.author?.avatar} radius={'none'} className={`${isEmbedToModal ? `z-[2]` : `z-[0]`}`} alt={postJson.author.did}/>
                                          ):(
                                              <FontAwesomeIcon
                                                  className={`${isEmbedToModal ? `z-[2]` : `z-[0]`} h-full w-full`}
                                                  icon={faUser}
                                                />
                                              )
                                          }
                                      </>

                                  )}
                              </span>
                              <span className={PostAuthorDisplayName({color: color})} style={{fontSize:'13px'}}
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    router.push(`/profile/${postJson?.author.did}`)
                                }}
                              >
                                  {isSkeleton ? (
                                      <Skeleton className={skeletonName({color:color})}/>
                                  ) : (
                                      <span>{postJson?.author?.displayName}</span>
                                  )}
                              </span>
                              <div className={'text-[#BABABA]'}>&nbsp;-&nbsp;</div>
                              <span className={PostAuthorHandle({color: color})}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        router.push(`/profile/${postJson?.author.did}`)
                                    }}
                              >
                                  {isSkeleton ? (
                                      <Skeleton className={skeletonHandle({color: color})}/>
                                  ) : (
                                      <span>{postJson?.author?.handle}</span>
                                  )}
                              </span>
                              <div className={PostCreatedAt()} style={{fontSize:'12px'}}>
                                  {!isEmbedToModal && !isMobile && isHover && !isSkeleton ? (
                                      <Dropdown className={dropdown({color:color})}>
                                          <DropdownTrigger>
                                              <FontAwesomeIcon icon={faEllipsis} className={'h-[20px] mb-[4px] cursor-pointer text-[#909090]'}/>
                                          </DropdownTrigger>
                                          <DropdownMenu
                                              disallowEmptySelection
                                              aria-label="Multiple selection actions"
                                              selectionMode="multiple"
                                          >
                                              <DropdownItem key='1' startContent={<FontAwesomeIcon icon={faLink}/>}
                                                            onClick={() => {
                                                                console.log(`https://bsky.app/profile/${postJson.author.did}/post/${postJson.uri.match(/\/(\w+)$/)?.[1] || ""}`)
                                                                navigator.clipboard.writeText(`https://bsky.app/profile/${postJson.author.did}/post/${postJson.uri.match(/\/(\w+)$/)?.[1] || ""}`)
                                                            }}

                                              >
                                                  Copy Post URL
                                              </DropdownItem>
                                              <DropdownItem key='2' startContent={<FontAwesomeIcon icon={faCode}/>}
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(JSON.stringify(postJson))
                                                            }}
                                              >
                                                  Copy Post JSON
                                              </DropdownItem>
                                              <DropdownSection title="Danger zone">
                                                  {agent?.session?.did !== postJson.author.did ? (
                                                      <DropdownItem
                                                          key="delete"
                                                          className="text-danger"
                                                          color="danger"
                                                          startContent={<FontAwesomeIcon icon={faFlag} />}
                                                      >
                                                          Report
                                                      </DropdownItem>
                                                  ) : (
                                                      <DropdownItem
                                                          key="delete"
                                                          className="text-danger"
                                                          color="danger"
                                                          startContent={<FontAwesomeIcon icon={faTrash} />}
                                                      >
                                                          Delete
                                                      </DropdownItem>
                                                  )
                                                  }
                                              </DropdownSection>
                                          </DropdownMenu>
                                      </Dropdown>
                                  ) : (
                                      <>
                                          {!isSkeleton && (<div>{formattedSimpleDate(postJson?.indexedAt, now || new Date())}</div>)}
                                      </>
                                  )}
                              </div>
                          </div>
                          <div className={PostContent({isMobile:isMobile})}>
                              {isSkeleton ? (
                                  <div className="w-full flex flex-col gap-2">
                                      <Skeleton className={skeletonText1line({color: color})}/>
                                      <Skeleton className={skeletonText2line({color: color})}/>
                                  </div>
                              ) : (
                                  <>
                                      {json?.reply && (
                                          <div>
                                              <FontAwesomeIcon icon={faReply}></FontAwesomeIcon>
                                              Reply to {json.reply.parent.author?.displayName}
                                          </div>
                                      )}
                                      <div style={{wordBreak: 'break-word'}}>
                                          {renderTextWithLinks}
                                      </div>
                                  </>
                              )}
                              <div className={'overflow-x-scroll'}>
                                  {postJson?.embed && (
                                      postJson?.embed?.$type === 'app.bsky.embed.images#view' ? (
                                          <ScrollShadow hideScrollBar orientation="horizontal">
                                              <div className={`flex overflow-x-auto overflow-y-hidden w-100svw}]`}>
                                                  {postJson.embed.images.map((image: any, index: number) => (
                                                      <div className={`mt-[10px] mb-[10px] rounded-[7.5px] overflow-hidden min-w-[280px] max-w-[500px] h-[300px] mr-[10px] bg-cover}`}
                                                           key={`image-${index}`}
                                                      >
                                                          <img
                                                            className="w-full h-full z-0 object-cover"
                                                            src={image.thumb}
                                                            alt={image?.alt}
                                                            onMouseUp={(e) => e.stopPropagation()}
                                                            onClick={ (e) => {
                                                                handleImageClick(index)
                                                            }}
                                                          />
                                                      </div>
                                                  ))}
                                              </div>
                                          </ScrollShadow>
                                      ) : (
                                          postJson.embed.$type === 'app.bsky.embed.external#view' && (
                                              <a
                                                  href={postJson.embed.external?.uri}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  onMouseUp={(e) => e.stopPropagation()}

                                              >
                                                  <div className="h-[100px] w-full rounded-lg overflow-hidden border border-gray-600 flex items-center text-gray-800 hover:bg-[#1C1C1C]">
                                                      <div className="h-[100px] w-[100px] border-r border-gray-600">
                                                          <img
                                                              src={postJson.embed.external?.thumb}
                                                              className="object-cover w-full h-full z-0"
                                                              alt={postJson.embed.external?.alt}
                                                          />
                                                      </div>
                                                      <div className="flex items-center ml-2 h-full w-[calc(100%-6rem)]">
                                                          <div className="w-full min-w-0">
                                                              <div className="text-sm font-bold text-white whitespace-nowrap overflow-hidden overflow-ellipsis">
                                                                  {postJson.embed.external?.title}
                                                              </div>
                                                              <div className="text-xs text-gray-200 mt-1" style={{WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', display: '-webkit-box', overflow: 'hidden'}}>
                                                                  {postJson.embed.external?.description}
                                                              </div>
                                                              <div className="text-xs text-gray-700 mt-1">
                                                                  <div className="text-gray-400">
                                                                      {postJson.embed.external?.uri.match(/^https?:\/{2,}(.*?)(?:\/|\?|#|$)/)[1]}
                                                                  </div>
                                                              </div>
                                                          </div>
                                                      </div>
                                                  </div>
                                              </a>

                                          )
                                      )
                                  )}
                              </div>
                          </div>
                          <div className={PostReactionButtonContainer()} style={{}}>
                              <div className={`mr-[12px]`}>
                                  {isMobile && !isEmbedToModal && (
                                      <>
                                          <FontAwesomeIcon icon={faComment}
                                                           className={PostReactionButton()}
                                                           onClick={() => {
                                                               setHandleButtonClick(true)
                                                               handleReply()
                                                           }}
                                                           onMouseUp={(e) => e.stopPropagation()}
                                          />
                                          <FontAwesomeIcon icon={faRetweet} style={{color:isReposted ? '#17BF63' : '#909090',}}
                                                           className={PostReactionButton()}
                                                           onClick={() => {
                                                               setHandleButtonClick(true)
                                                               handleRepost()
                                                           }}
                                                           onMouseUp={(e) => e.stopPropagation()}
                                          />
                                          <FontAwesomeIcon icon={isLiked ? faHeartSolid : faHeartRegular} style={{color:isLiked ? '#fd7e00' : '#909090',}}
                                                           className={PostReactionButton()}
                                                           onClick={() => {
                                                               setHandleButtonClick(true)
                                                               handleLike()}}
                                                           onMouseUp={(e) => e.stopPropagation()}

                                          />
                                      </>
                                  )}
                                  {!isMobile && !isEmbedToModal && (
                                      <>
                                          <FontAwesomeIcon icon={faComment} style={{display: isHover && !isSkeleton ? undefined : 'none'}}
                                                           className={PostReactionButton()}
                                                           onClick={() => {
                                                               setHandleButtonClick(true)
                                                               handleReply()
                                                           }}
                                                           onMouseUp={(e) => e.stopPropagation()}
                                          />
                                          <FontAwesomeIcon icon={faRetweet} style={{color:isReposted ? '#17BF63' : '#909090', display: isHover && !isSkeleton ? undefined : isReposted ? undefined : 'none'}}
                                                           className={PostReactionButton()}
                                                           onClick={() => {
                                                               setHandleButtonClick(true)
                                                               handleRepost()
                                                           }}
                                                           onMouseUp={(e) => e.stopPropagation()}
                                          />
                                          <FontAwesomeIcon icon={isLiked ? faHeartSolid : faHeartRegular} style={{color:isLiked ? '#fd7e00' : '#909090', display: isHover && !isSkeleton ? undefined : isLiked ? undefined : 'none'}}
                                                           className={PostReactionButton()}
                                                           onClick={() => {
                                                               setHandleButtonClick(true)
                                                               handleLike()}}
                                                           onMouseUp={(e) => e.stopPropagation()}
                                          />
                                      </>
                                  )}
                              </div>
                          </div>
                      </div>
                  </>
              </>
          </main>
      </>
  );
}

export default ViewPostCard;

