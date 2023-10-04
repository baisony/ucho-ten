import React, {useState, useRef, useCallback} from "react";
import { viewSideBar } from "./styles";
import { BrowserView, MobileView, isMobile } from "react-device-detect"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faImage, faTrashCan } from '@fortawesome/free-regular-svg-icons'
import { faBookmark, faVolumeXmark, faRss, faUser, faHand, faGear, faFlag, faCircleQuestion, faUsers, faRightFromBracket } from '@fortawesome/free-solid-svg-icons'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import {Button, Link} from "@nextui-org/react";

import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure} from "@nextui-org/react";

import Textarea from 'react-textarea-autosize'; // 追加
import {useRouter} from "next/navigation";
import {useAgent} from "@/app/_atoms/agent";
import {useUserProfileDetailedAtom} from "@/app/_atoms/userProfileDetail";

interface Props {
    className?: string
    color: 'light' | 'dark'
    isMobile?: boolean
    uploadImageAvailable?: boolean
    isDragActive?: boolean
    open?: boolean
    isSideBarOpen?: boolean
    setSideBarOpen?: any
}
export const ViewSideBar: React.FC<Props> = (props: Props) => {
    const {className, color, isMobile, uploadImageAvailable, open, isSideBarOpen, setSideBarOpen} = props;
    const reg = /^[\u0009-\u000d\u001c-\u0020\u11a3-\u11a7\u1680\u180e\u2000-\u200f\u202f\u205f\u2060\u3000\u3164\ufeff\u034f\u2028\u2029\u202a-\u202e\u2061-\u2063\ufeff]*$/;
    const router = useRouter()
    const [userProfileDetailed] = useUserProfileDetailedAtom()
    const [loading, setLoading] = useState(false)
    const { background, AuthorIconContainer,Content, Footer, AuthorDisplayName, AuthorHandle, NavBarIcon,NavBarItem,bg, modal
    } = viewSideBar();
    const [ agent ] = useAgent()
    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    const handleDeleteSession = () => {
        console.log('delete session')
        localStorage.removeItem('session')
        router.push('/login')
    }

    return (
        <>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} className={modal({color:color})}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Would you like to log out?</ModalHeader>
                            <ModalFooter>
                                <Button color="danger" variant="light" onClick={onClose}>
                                    No
                                </Button>
                                <Button color="primary"
                                        onClick={() => {
                                            handleDeleteSession()
                                            onClose()
                                            props.setSideBarOpen(false)
                                        }}
                                >
                                    Yes
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
            <main className={''}>
                <main className={background({color:color, isMobile:isMobile, isBarOpen:props.isSideBarOpen})}
                      onClick={(e) => {
                          e.stopPropagation()
                      }}
                >
                    <div className={AuthorIconContainer()}
                         onClick={() => {
                             if(!agent?.session) return
                             props.setSideBarOpen(false)
                             router.push(`/profile/${agent.session.did}`)
                         }}
                    >
                        <img className={'h-[64px] w-[64px] rounded-[10px]'}
                             src={userProfileDetailed?.avatar}/>
                        <div className={'ml-[12px]'}>
                            <div className={AuthorDisplayName()}>{userProfileDetailed?.displayName}</div>
                            <div className={AuthorHandle({color:color})}>@{userProfileDetailed?.handle}</div>
                        </div>
                    </div>
                    <div className={Content()}>
                        <div className={NavBarItem()}
                             onClick={() => {
                                 props.setSideBarOpen(false)
                                 router.push('/bookmarks')
                             }}
                        >
                            <FontAwesomeIcon icon={faBookmark} className={NavBarIcon()}></FontAwesomeIcon>
                            <div>Bookmark</div>
                        </div>
                        <div className={NavBarItem()}
                             onClick={() => {
                                 props.setSideBarOpen(false)
                                 router.push('/settings')
                             }}
                        >
                            <FontAwesomeIcon icon={faVolumeXmark} className={NavBarIcon()}></FontAwesomeIcon>
                            <div>Mute</div>
                        </div>
                        <div className={NavBarItem()}
                             onClick={() => {
                                 props.setSideBarOpen(false)
                                 router.push('/feeds')
                             }}
                        >
                            <FontAwesomeIcon icon={faRss} className={NavBarIcon()}></FontAwesomeIcon>
                            <div>Feeds</div>
                        </div>
                        <div className={NavBarItem()}
                             onClick={() => {
                                 if(!agent?.session) return
                                 props.setSideBarOpen(false)
                                 router.push(`/profile/${agent.session.did}`)
                             }}
                        >
                            <FontAwesomeIcon icon={faUser} className={NavBarIcon()}></FontAwesomeIcon>
                            <div>Profile</div>
                        </div>
                        <div className={NavBarItem()}
                             onClick={() => {
                                 props.setSideBarOpen(false)
                                 router.push('/settings')
                             }}
                        >
                            <FontAwesomeIcon icon={faHand} className={NavBarIcon()}></FontAwesomeIcon>
                            <div>Contents Filtering</div>
                        </div>
                        <div className={NavBarItem()}
                             onClick={() => {
                                 props.setSideBarOpen(false)
                                 router.push('/settings')
                             }}
                        >
                            <FontAwesomeIcon icon={faGear} className={NavBarIcon()}></FontAwesomeIcon>
                            <div>Settings</div>
                        </div>
                        <a className={NavBarItem()}
                           href={'https://google.com/'}
                           target={'_blank'}
                           rel="noopener noreferrer"
                           onClick={() => {
                               props.setSideBarOpen(false)
                           }}
                        >
                            <FontAwesomeIcon icon={faFlag} className={NavBarIcon()}></FontAwesomeIcon>
                            <div>Bug Report</div>
                        </a>
                    </div>
                    <div className={Footer()}>
                        <div className={NavBarItem()}
                             onClick={() => {
                                 props.setSideBarOpen(false)
                                 router.push('/about')
                             }}
                        >
                            <FontAwesomeIcon icon={faCircleQuestion} className={NavBarIcon()}></FontAwesomeIcon>
                            <div>About</div>
                        </div>
                        <div className={NavBarItem()}
                             onClick={() => {
                                 props.setSideBarOpen(false)
                                 router.push('/settings')
                             }}
                        >
                            <FontAwesomeIcon icon={faUsers} className={NavBarIcon()}></FontAwesomeIcon>
                            <div>Switching Account</div>
                        </div>
                        <div className={NavBarItem()}
                             onClick={() => {
                                 if(isMobile) {
                                     const res = window.confirm('Would you like to log out?')
                                     if(res) {
                                         props.setSideBarOpen(false)
                                         handleDeleteSession()
                                         router.push('/login')
                                     }
                                 } else {
                                     onOpen()
                                 }
                             }}
                        >
                            <FontAwesomeIcon icon={faRightFromBracket} className={NavBarIcon()}></FontAwesomeIcon>
                            <div>Logout</div>
                        </div>
                    </div>
                </main>
            </main>
        </>
    );
}

export default ViewSideBar;