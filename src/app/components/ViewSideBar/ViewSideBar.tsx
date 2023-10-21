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
import { useTranslation } from "react-i18next"

// import { ViewQuoteCard } from "@/app/components/ViewQuoteCard"
interface Props {
    className?: string
    color: "light" | "dark"
    isMobile?: boolean
    uploadImageAvailable?: boolean
    isDragActive?: boolean
    open?: boolean
    isSideBarOpen: boolean
    setSideBarOpen: (isOpen: boolean) => void
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
        modal,
    } = viewSideBar()
    const { t } = useTranslation()
    const [agent, setAgent] = useAgent()
    const [server, setServer] = useState<string>("")
    const [identity, setIdentity] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [isLogging, setIsLogging] = useState<boolean>(false)
    const [loginError, setLoginError] = useState<boolean>(false)

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

    const handleRelogin = async () => {
        if (server === "" || identity === "" || password === "") return
        try {
            setIsSwitching(true)
            setLoginError(false)
            setAuthenticationRequired(false)
            setIsLogging(true)
            let result = server.replace(/(http:\/\/|https:\/\/)/g, "")
            result = result.replace(/\/$/, "")
            const agent = new BskyAgent({
                service: `https://${result}`,
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
                setIsLogging(false)
                setIsSwitching(false)
                setLoginError(true)
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
                                    ) : isSwitching &&
                                      item.profile.did ===
                                          selectedAccountInfo.profile.did ? (
                                        <Spinner />
                                    ) : (
                                        authenticationRequired &&
                                        item.profile.did ===
                                            selectedAccountInfo.profile.did && (
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
                                                    {t(
                                                        "components.ViewSideBar.needLogin"
                                                    )}
                                                </Button>
                                            </span>
                                        )
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
                <div
                    className={
                        "h-[50px] w-full select-none flex justify-center items-center cursor-pointer"
                    }
                    onClick={() => {
                        setSelectedAccountInfo(null)
                        setOpenModalReason("relogin")
                    }}
                >
                    {t("components.ViewSideBar.addAccount")}
                </div>
            </>
        )
    }
    return (
        <div>
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
                                        {t(
                                            "components.ViewSideBar.switchAccount"
                                        )}
                                    </ModalHeader>
                                    <ModalBody>{AccountComponent()}</ModalBody>
                                    <ModalFooter>
                                        <Button
                                            color="primary"
                                            onClick={() => {
                                                onClose()
                                                setSideBarOpen(false)
                                            }}
                                        >
                                            {t("button.close")}
                                        </Button>
                                    </ModalFooter>
                                </>
                            ) : openModalReason === "logout" ? (
                                <>
                                    <ModalHeader>
                                        {t(
                                            "components.ViewSideBar.logoutModal.description"
                                        )}
                                    </ModalHeader>
                                    <ModalFooter>
                                        <Button
                                            color="danger"
                                            variant="light"
                                            onClick={onClose}
                                        >
                                            {t("button.no")}
                                        </Button>
                                        <Button
                                            color="primary"
                                            onClick={() => {
                                                handleDeleteSession()
                                                onClose()
                                                setSideBarOpen(false)
                                            }}
                                        >
                                            {t("button.yes")}
                                        </Button>
                                    </ModalFooter>
                                </>
                            ) : (
                                openModalReason === "relogin" && (
                                    <>
                                        <ModalHeader className="flex flex-col gap-1">
                                            {t(
                                                "components.ViewSideBar.addAccountModal.title"
                                            )}
                                        </ModalHeader>
                                        <ModalBody>
                                            <Input
                                                defaultValue={
                                                    selectedAccountInfo?.service
                                                }
                                                onValueChange={(e) => {
                                                    setServer(e)
                                                }}
                                                label={t(
                                                    "components.ViewSideBar.addAccountModal.service"
                                                )}
                                                placeholder={t(
                                                    "components.ViewSideBar.addAccountModal.servicePlaceholder"
                                                )}
                                                variant="bordered"
                                                isInvalid={loginError}
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
                                                    selectedAccountInfo?.session
                                                        ?.handle
                                                }
                                                onValueChange={(e) => {
                                                    setIdentity(e)
                                                }}
                                                label={t(
                                                    "components.ViewSideBar.addAccountModal.identifier"
                                                )}
                                                placeholder={t(
                                                    "components.ViewSideBar.addAccountModal.identifierPlaceholder"
                                                )}
                                                variant="bordered"
                                                isInvalid={loginError}
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
                                                label={t(
                                                    "components.ViewSideBar.addAccountModal.password"
                                                )}
                                                placeholder={t(
                                                    "components.ViewSideBar.addAccountModal.passwordPlaceholder"
                                                )}
                                                type="password"
                                                variant="bordered"
                                                isInvalid={loginError}
                                            />
                                        </ModalBody>
                                        <ModalFooter>
                                            <Button
                                                color="danger"
                                                variant="flat"
                                                onPress={onClose}
                                            >
                                                {t("button.close")}
                                            </Button>
                                            <Button
                                                color="primary"
                                                onClick={() => {
                                                    handleRelogin()
                                                    //onClose()
                                                }}
                                            >
                                                {!isLogging ? (
                                                    t("button.signin")
                                                ) : (
                                                    <Spinner
                                                        color={
                                                            color === "dark"
                                                                ? "white"
                                                                : "default"
                                                        }
                                                        size={"sm"}
                                                    />
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
            {/* <main className={""}> */}
            <main
                className={background({
                    color: color,
                    isMobile: isMobile,
                    isBarOpen: isSideBarOpen,
                })}
                onClick={(e) => {
                    e.stopPropagation()
                }}
            >
                <div
                    className={AuthorIconContainer({ color })}
                    onClick={() => {
                        if (!agent?.session) return
                        setSideBarOpen(false)
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
                                    "h-[64px] w-[64px] rounded-full border border-gray-300"
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
                        <div className={AuthorDisplayName({ color })}>
                            {userProfileDetailed?.displayName ||
                                userProfileDetailed?.handle}
                        </div>
                        <div className={AuthorHandle({ color: color })}>
                            @{userProfileDetailed?.handle}
                        </div>
                    </div>
                </div>
                <div className={Content({ color })}>
                    <div
                        className={NavBarItem({ color })}
                        onClick={() => {
                            setSideBarOpen(false)
                            router.push("/bookmarks")
                        }}
                    >
                        <FontAwesomeIcon
                            icon={faBookmark}
                            className={NavBarIcon({ color })}
                        ></FontAwesomeIcon>
                        <div>{t("components.ViewSideBar.bookmark")}</div>
                    </div>
                    <div
                        className={NavBarItem({ color })}
                        onClick={() => {
                            setSideBarOpen(false)
                            router.push("/settings#mute")
                        }}
                    >
                        <FontAwesomeIcon
                            icon={faVolumeXmark}
                            className={NavBarIcon({ color })}
                        ></FontAwesomeIcon>
                        <div>{t("components.ViewSideBar.mute")}</div>
                    </div>
                    <div
                        className={NavBarItem({ color })}
                        onClick={() => {
                            setSideBarOpen(false)
                            router.push("/feeds")
                        }}
                    >
                        <FontAwesomeIcon
                            icon={faRss}
                            className={NavBarIcon({ color })}
                        ></FontAwesomeIcon>
                        <div>{t("components.ViewSideBar.feeds")}</div>
                    </div>
                    <div
                        className={NavBarItem({ color })}
                        onClick={() => {
                            if (!agent?.session) return
                            setSideBarOpen(false)
                            router.push(`/profile/${agent.session.did}`)
                        }}
                    >
                        <FontAwesomeIcon
                            icon={faUser}
                            className={NavBarIcon({ color })}
                        ></FontAwesomeIcon>
                        <div>profile</div>
                    </div>
                    <div
                        className={NavBarItem({ color })}
                        onClick={() => {
                            setSideBarOpen(false)
                            router.push("/settings#filtering")
                        }}
                    >
                        <FontAwesomeIcon
                            icon={faHand}
                            className={NavBarIcon({ color })}
                        ></FontAwesomeIcon>
                        <div>Contents Filtering</div>
                    </div>
                    <div
                        className={NavBarItem({ color })}
                        onClick={() => {
                            setSideBarOpen(false)
                            router.push("/settings")
                        }}
                    >
                        <FontAwesomeIcon
                            icon={faGear}
                            className={NavBarIcon({ color })}
                        ></FontAwesomeIcon>
                        <div>{t("components.ViewSideBar.preferences")}</div>
                    </div>
                    <a
                        className={NavBarItem({ color })}
                        href={"https://google.com/"}
                        target={"_blank"}
                        rel="noopener noreferrer"
                        onClick={() => {
                            setSideBarOpen(false)
                        }}
                    >
                        <FontAwesomeIcon
                            icon={faFlag}
                            className={NavBarIcon({ color })}
                        ></FontAwesomeIcon>
                        <div>{t("components.ViewSideBar.bugReport")}</div>
                    </a>
                </div>
                <div className={Footer({ color })}>
                    <div
                        className={NavBarItem({ color })}
                        onClick={() => {
                            setSideBarOpen(false)
                            router.push("/about")
                        }}
                    >
                        <FontAwesomeIcon
                            icon={faCircleQuestion}
                            className={NavBarIcon({ color })}
                        ></FontAwesomeIcon>
                        <div>{t("components.ViewSideBar.about")}</div>
                    </div>
                    <div
                        className={NavBarItem({ color })}
                        onClick={() => {
                            setSideBarOpen(false)
                            setOpenModalReason("switching")
                            onOpen()
                            //router.push("/settings")
                        }}
                    >
                        <FontAwesomeIcon
                            icon={faUsers}
                            className={NavBarIcon({ color })}
                        ></FontAwesomeIcon>
                        <div>{t("components.ViewSideBar.SwitchAccount")}</div>
                    </div>
                    <div
                        className={NavBarItem({ color })}
                        onClick={() => {
                            if (isMobile) {
                                const res = window.confirm(
                                    t(
                                        "components.ViewSideBar.logoutModal.description"
                                    )
                                )
                                if (res) {
                                    setSideBarOpen(false)
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
                            className={NavBarIcon({ color })}
                        ></FontAwesomeIcon>
                        <div>{t("components.ViewSideBar.logout")}</div>
                    </div>
                </div>
            </main>
            {/* </main> */}
        </div>
    )
}
