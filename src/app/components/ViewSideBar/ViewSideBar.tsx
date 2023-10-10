import React, { useEffect, useState } from "react"
import { viewSideBar } from "./styles"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faAt,
    faBookmark,
    faCircleCheck,
    faCircleQuestion,
    faFlag,
    faGear,
    faHand,
    faLock,
    faRightFromBracket,
    faRss,
    faUser,
    faUsers,
    faVolumeXmark,
} from "@fortawesome/free-solid-svg-icons"
import "react-circular-progressbar/dist/styles.css"
import {
    Button,
    Input,
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
import {
    useAccounts,
    UserAccount,
    UserAccountByDid,
} from "@/app/_atoms/accounts"
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
        "switching" | "logout" | "relogin" | ""
    >("")
    const [categorization, setCategorization] = useState<{
        [key: string]: UserAccount[]
    }>({})
    const [isSwitching, setIsSwitching] = useState(false)
    const [authenticationRequired, setAuthenticationRequired] = useState<
        boolean | null
    >(null)
    const [selectedAccountInfo, setSelectedAccountInfo] = useState<any>(null)
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
    const [server, setServer] = useState<string>("")
    const [identity, setIdentity] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [isLogging, setIsLogging] = useState<boolean>(false)

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

    const handleRelogin = async () => {
        if (server === "" || identity === "" || password === "") return
        try {
            setIsSwitching(true)
            setAuthenticationRequired(false)
            setIsLogging(true)
            const agent = new BskyAgent({
                service: `https://${server}`,
            })
            const { data } = await agent.login({
                identifier: identity,
                password: password,
            })
            if (agent.session) {
                const json = {
                    server: server,
                    session: agent.session,
                }
                localStorage.setItem("session", JSON.stringify(json))
                const storedData = localStorage.getItem("Accounts")
                const existingAccountsData: UserAccountByDid = storedData
                    ? JSON.parse(storedData)
                    : {}

                const { data } = await agent.getProfile({
                    actor: agent.session.did,
                })
                const accountData: UserAccount = {
                    service: server,
                    session: agent.session,
                    profile: {
                        did: agent.session.did,
                        displayName: data?.displayName || agent.session.handle,
                        handle: agent.session.handle,
                        avatar: data?.avatar || "",
                    },
                }
                existingAccountsData[agent.session.did] = accountData

                localStorage.setItem(
                    "Accounts",
                    JSON.stringify(existingAccountsData)
                )
            }
            //router.push("/")
            setIsLogging(false)
            setIsSwitching(false)
            window.location.reload()
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.log(e.message)
            }
        }
    }

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
                                        setAuthenticationRequired(false)
                                        setSelectedAccountInfo(item)
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
                                    } catch (e: unknown) {
                                        if (e instanceof Error) {
                                            if (
                                                e.message.includes(
                                                    "Authentication"
                                                )
                                            ) {
                                                setIsSwitching(false)
                                                setAuthenticationRequired(true)
                                            }
                                        }
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
                                    ) : isSwitching ? (
                                        <Spinner />
                                    ) : (
                                        authenticationRequired && (
                                            <span className={"text-[#FF0000]"}>
                                                <Button
                                                    onClick={() => {
                                                        setServer(key)
                                                        setIdentity(
                                                            item.profile.handle
                                                        )
                                                        setOpenModalReason(
                                                            "relogin"
                                                        )
                                                    }}
                                                >
                                                    再ログインが必要です
                                                </Button>
                                            </span>
                                        )
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
                                            color="primary"
                                            onClick={() => {
                                                onClose()
                                                props.setSideBarOpen(false)
                                            }}
                                        >
                                            Close
                                        </Button>
                                    </ModalFooter>
                                </>
                            ) : openModalReason === "logout" ? (
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
                            ) : (
                                openModalReason === "relogin" && (
                                    <>
                                        <ModalHeader className="flex flex-col gap-1">
                                            Log in
                                        </ModalHeader>
                                        <ModalBody>
                                            <Input
                                                defaultValue={
                                                    selectedAccountInfo.service
                                                }
                                                onValueChange={(e) => {
                                                    setServer(e)
                                                }}
                                                label="Service"
                                                placeholder="Enter connect server"
                                                variant="bordered"
                                            />
                                            <Input
                                                autoFocus
                                                endContent={
                                                    <FontAwesomeIcon
                                                        icon={faAt}
                                                        className="text-2xl text-default-400 pointer-events-none flex-shrink-0"
                                                    />
                                                }
                                                defaultValue={
                                                    selectedAccountInfo.session
                                                        ?.handle
                                                }
                                                onValueChange={(e) => {
                                                    setIdentity(e)
                                                }}
                                                label="Email"
                                                placeholder="Enter your email"
                                                variant="bordered"
                                            />
                                            <Input
                                                endContent={
                                                    <FontAwesomeIcon
                                                        icon={faLock}
                                                        className="text-2xl text-default-400 pointer-events-none flex-shrink-0"
                                                    />
                                                }
                                                onValueChange={(e) => {
                                                    setPassword(e)
                                                }}
                                                label="Password"
                                                placeholder="Enter your password"
                                                type="password"
                                                variant="bordered"
                                            />
                                        </ModalBody>
                                        <ModalFooter>
                                            <Button
                                                color="danger"
                                                variant="flat"
                                                onPress={onClose}
                                            >
                                                Close
                                            </Button>
                                            <Button
                                                color="primary"
                                                onClick={() => {
                                                    handleRelogin()
                                                    //onClose()
                                                }}
                                            >
                                                {!isLogging ? (
                                                    "Sign In"
                                                ) : (
                                                    <Spinner />
                                                )}
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
