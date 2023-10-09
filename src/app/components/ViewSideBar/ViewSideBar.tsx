import React, { useEffect, useState } from "react"
import { viewSideBar } from "./styles"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faBookmark,
    faCircleCheck,
    faCircleQuestion,
    faFlag,
    faGear,
    faHand,
    faRightFromBracket,
    faRss,
    faUser,
    faUsers,
    faVolumeXmark,
} from "@fortawesome/free-solid-svg-icons"
import "react-circular-progressbar/dist/styles.css"
import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Spinner,
    useDisclosure,
} from "@nextui-org/react"
import { useRouter } from "next/navigation"
import { useAgent } from "@/app/_atoms/agent"
import { useUserProfileDetailedAtom } from "@/app/_atoms/userProfileDetail"
import { useAccounts, UserAccount } from "@/app/_atoms/accounts"
import { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs"
import { BskyAgent } from "@atproto/api"

interface Props {
    className?: string
    color: "light" | "dark"
    isMobile?: boolean
    uploadImageAvailable?: boolean
    isDragActive?: boolean
    open?: boolean
    isSideBarOpen?: boolean
    setSideBarOpen?: any
}

export const ViewSideBar: React.FC<Props> = (props: Props) => {
    const {
        className,
        color,
        isMobile,
        uploadImageAvailable,
        open,
        isSideBarOpen,
        setSideBarOpen,
    } = props
    const reg =
        /^[\u0009-\u000d\u001c-\u0020\u11a3-\u11a7\u1680\u180e\u2000-\u200f\u202f\u205f\u2060\u3000\u3164\ufeff\u034f\u2028\u2029\u202a-\u202e\u2061-\u2063\ufeff]*$/
    const router = useRouter()
    const [accounts] = useAccounts()
    const userList = Object.entries(accounts).map(([key, value]) => ({
        key,
        value,
    }))
    const [userProfileDetailed] = useUserProfileDetailedAtom()
    const [loading, setLoading] = useState(false)
    const [openModalReason, setOpenModalReason] = useState<
        "switching" | "logout" | ""
    >("")
    const [categorization, setCategorization] = useState<{
        [key: string]: UserAccount[]
    }>({})
    const [isSwitching, setIsSwitching] = useState(false)
    const {
        background,
        AuthorIconContainer,
        Content,
        Footer,
        AuthorDisplayName,
        AuthorHandle,
        NavBarIcon,
        NavBarItem,
        bg,
        modal,
    } = viewSideBar()
    const [agent, setAgent] = useAgent()
    const { isOpen, onOpen, onOpenChange } = useDisclosure()

    const handleDeleteSession = () => {
        console.log("delete session")
        localStorage.removeItem("session")
        router.push("/login")
    }
    useEffect(() => {
        console.log(userList)
        const serviceData: { [key: string]: any[] } = {}

        userList.forEach((item) => {
            const service: string = item.value.service as any

            if (service !== undefined) {
                if (!serviceData[service]) {
                    serviceData[service] = []
                }

                serviceData[service].push(item.value)
            }
        })

        console.log(serviceData)
        setCategorization(serviceData)
        Object.entries(serviceData).forEach(([key, value]) => {
            console.log(key, value)
        })
    }, [accounts])

    const AccountComponent = () => {
        return (
            <>
                {Object.entries(categorization).map(([key, value]) => (
                    <div key={key} className={"select-none"}>
                        {key}
                        {value.map((item: UserAccount) => (
                            <div
                                key={item.profile.did}
                                className={
                                    "justify-between flex items-center w-full cursor-pointer"
                                }
                                onClick={async () => {
                                    if (
                                        item.session.did === agent?.session?.did
                                    )
                                        return
                                    try {
                                        setIsSwitching(true)
                                        const { session } = item
                                        const agent = new BskyAgent({
                                            service: `https://${key}`,
                                        })
                                        const res =
                                            await agent.resumeSession(session)
                                        setAgent(agent)
                                        const json = {
                                            server: key,
                                            session: session,
                                        }
                                        localStorage.setItem(
                                            "session",
                                            JSON.stringify(json)
                                        )
                                        //router.push("/")
                                        setIsSwitching(false)
                                        window.location.reload()
                                    } catch (e) {
                                        console.log(e)
                                    }
                                }}
                            >
                                <div className={"flex items-center mb-[10px]"}>
                                    <div className={"w-[50px] h-[50px]"}>
                                        {item.profile?.avatar ? (
                                            <img
                                                src={item.profile.avatar}
                                                className={"h-full w-full"}
                                            />
                                        ) : (
                                            <FontAwesomeIcon
                                                icon={faUser}
                                                className={"h-full w-full"}
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <div>{item.profile.displayName}</div>
                                        <div>@{item.profile.handle}</div>
                                    </div>
                                </div>
                                <div>
                                    {agent?.session?.did ===
                                    item.profile.did ? (
                                        <div>
                                            <FontAwesomeIcon
                                                icon={faCircleCheck}
                                                className={"text-[#00D315]"}
                                            />
                                        </div>
                                    ) : (
                                        isSwitching && <Spinner />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </>
        )
    }
    return (
        <>
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                className={modal({ color: color })}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            {openModalReason === "switching" ? (
                                <>
                                    <ModalHeader>
                                        Would you like to switching Account?
                                    </ModalHeader>
                                    <ModalBody>{AccountComponent()}</ModalBody>
                                    <ModalFooter>
                                        <Button
                                            color="danger"
                                            variant="light"
                                            onClick={onClose}
                                        >
                                            No
                                        </Button>
                                        <Button
                                            color="primary"
                                            onClick={() => {
                                                onClose()
                                                props.setSideBarOpen(false)
                                            }}
                                        >
                                            Yes
                                        </Button>
                                    </ModalFooter>
                                </>
                            ) : (
                                openModalReason === "logout" && (
                                    <>
                                        <ModalHeader>
                                            Would you like to log out?
                                        </ModalHeader>
                                        <ModalFooter>
                                            <Button
                                                color="danger"
                                                variant="light"
                                                onClick={onClose}
                                            >
                                                No
                                            </Button>
                                            <Button
                                                color="primary"
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
                                )
                            )}
                        </>
                    )}
                </ModalContent>
            </Modal>
            <main className={""}>
                <main
                    className={background({
                        color: color,
                        isMobile: isMobile,
                        isBarOpen: props.isSideBarOpen,
                    })}
                    onClick={(e) => {
                        e.stopPropagation()
                    }}
                >
                    <div
                        className={AuthorIconContainer()}
                        onClick={() => {
                            if (!agent?.session) return
                            props.setSideBarOpen(false)
                            router.push(`/profile/${agent.session.did}`)
                        }}
                    >
                        <div
                            className={
                                "h-[64px] w-[64px] rounded-[10px] overflow-hidden"
                            }
                        >
                            {userProfileDetailed?.avatar ? (
                                <img
                                    className={
                                        "h-[64px] w-[64px] rounded-[10px]"
                                    }
                                    src={userProfileDetailed?.avatar}
                                />
                            ) : (
                                <FontAwesomeIcon
                                    icon={faUser}
                                    className={"h-full w-full"}
                                />
                            )}
                        </div>
                        <div className={"ml-[12px]"}>
                            <div className={AuthorDisplayName()}>
                                {userProfileDetailed?.displayName ||
                                    userProfileDetailed?.handle}
                            </div>
                            <div className={AuthorHandle({ color: color })}>
                                @{userProfileDetailed?.handle}
                            </div>
                        </div>
                    </div>
                    <div className={Content()}>
                        <div
                            className={NavBarItem()}
                            onClick={() => {
                                props.setSideBarOpen(false)
                                router.push("/bookmarks")
                            }}
                        >
                            <FontAwesomeIcon
                                icon={faBookmark}
                                className={NavBarIcon()}
                            ></FontAwesomeIcon>
                            <div>Bookmark</div>
                        </div>
                        <div
                            className={NavBarItem()}
                            onClick={() => {
                                props.setSideBarOpen(false)
                                router.push("/settings#mute")
                            }}
                        >
                            <FontAwesomeIcon
                                icon={faVolumeXmark}
                                className={NavBarIcon()}
                            ></FontAwesomeIcon>
                            <div>Mute</div>
                        </div>
                        <div
                            className={NavBarItem()}
                            onClick={() => {
                                props.setSideBarOpen(false)
                                router.push("/feeds")
                            }}
                        >
                            <FontAwesomeIcon
                                icon={faRss}
                                className={NavBarIcon()}
                            ></FontAwesomeIcon>
                            <div>Feeds</div>
                        </div>
                        <div
                            className={NavBarItem()}
                            onClick={() => {
                                if (!agent?.session) return
                                props.setSideBarOpen(false)
                                router.push(`/profile/${agent.session.did}`)
                            }}
                        >
                            <FontAwesomeIcon
                                icon={faUser}
                                className={NavBarIcon()}
                            ></FontAwesomeIcon>
                            <div>Profile</div>
                        </div>
                        <div
                            className={NavBarItem()}
                            onClick={() => {
                                props.setSideBarOpen(false)
                                router.push("/settings#filtering")
                            }}
                        >
                            <FontAwesomeIcon
                                icon={faHand}
                                className={NavBarIcon()}
                            ></FontAwesomeIcon>
                            <div>Contents Filtering</div>
                        </div>
                        <div
                            className={NavBarItem()}
                            onClick={() => {
                                props.setSideBarOpen(false)
                                router.push("/settings")
                            }}
                        >
                            <FontAwesomeIcon
                                icon={faGear}
                                className={NavBarIcon()}
                            ></FontAwesomeIcon>
                            <div>Settings</div>
                        </div>
                        <a
                            className={NavBarItem()}
                            href={"https://google.com/"}
                            target={"_blank"}
                            rel="noopener noreferrer"
                            onClick={() => {
                                props.setSideBarOpen(false)
                            }}
                        >
                            <FontAwesomeIcon
                                icon={faFlag}
                                className={NavBarIcon()}
                            ></FontAwesomeIcon>
                            <div>Bug Report</div>
                        </a>
                    </div>
                    <div className={Footer()}>
                        <div
                            className={NavBarItem()}
                            onClick={() => {
                                props.setSideBarOpen(false)
                                router.push("/about")
                            }}
                        >
                            <FontAwesomeIcon
                                icon={faCircleQuestion}
                                className={NavBarIcon()}
                            ></FontAwesomeIcon>
                            <div>About</div>
                        </div>
                        <div
                            className={NavBarItem()}
                            onClick={() => {
                                props.setSideBarOpen(false)
                                setOpenModalReason("switching")
                                onOpen()
                                //router.push("/settings")
                            }}
                        >
                            <FontAwesomeIcon
                                icon={faUsers}
                                className={NavBarIcon()}
                            ></FontAwesomeIcon>
                            <div>Switching Account</div>
                        </div>
                        <div
                            className={NavBarItem()}
                            onClick={() => {
                                if (isMobile) {
                                    const res = window.confirm(
                                        "Would you like to log out?"
                                    )
                                    if (res) {
                                        props.setSideBarOpen(false)
                                        handleDeleteSession()
                                        router.push("/login")
                                    }
                                } else {
                                    setOpenModalReason("logout")
                                    onOpen()
                                }
                            }}
                        >
                            <FontAwesomeIcon
                                icon={faRightFromBracket}
                                className={NavBarIcon()}
                            ></FontAwesomeIcon>
                            <div>Logout</div>
                        </div>
                    </div>
                </main>
            </main>
        </>
    )
}

interface UserProps {
    actor: ProfileView
    onClick: () => void
    skeleton?: boolean
    index?: number
    color: string
}

const UserComponent = ({
    actor,
    onClick,
    skeleton,
    index,
    color,
}: UserProps) => {}
