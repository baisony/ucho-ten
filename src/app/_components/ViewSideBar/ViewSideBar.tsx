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
import defaultIcon from "@/../public/images/icon/default_icon.svg"
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
import { useNextQueryParamsAtom } from "@/app/_atoms/nextQueryParams"
import { useTranslation } from "react-i18next"
import Link from "next/link"

interface Props {
    className?: string
    isMobile?: boolean
    isDragActive?: boolean
    open?: boolean
    isSideBarOpen: boolean
    setSideBarOpen: (isOpen: boolean) => void
}

export const ViewSideBar: React.FC<Props> = (props: Props) => {
    const { isMobile, setSideBarOpen } = props
    const router = useRouter()
    const [accounts] = useAccounts()
    const userList = Object.entries(accounts).map(([key, value]) => ({
        key,
        value,
    }))
    const [userProfileDetailed] = useUserProfileDetailedAtom()
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
        appearanceTextColor,
    } = viewSideBar()
    const { t } = useTranslation()
    const [agent, setAgent] = useAgent()
    const [nextQueryParams] = useNextQueryParamsAtom()
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
            await agent.login({
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
                existingAccountsData[agent.session.did] = {
                    service: server,
                    session: agent.session,
                    profile: {
                        did: agent.session.did,
                        displayName: data?.displayName || agent.session.handle,
                        handle: agent.session.handle,
                        avatar: data?.avatar || "",
                    },
                }

                localStorage.setItem(
                    "Accounts",
                    JSON.stringify(existingAccountsData)
                )
            }
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
                                    <div
                                        className={
                                            "w-[50px] h-[50px] rounded-full overflow-hidden"
                                        }
                                    >
                                        <img
                                            src={
                                                item?.profile?.avatar ||
                                                defaultIcon.src
                                            }
                                            className={"h-full w-full"}
                                            alt={"avatar"}
                                        />
                                    </div>
                                    <div className={"ml-[15px]"}>
                                        <div>{item.profile.displayName}</div>
                                        <div
                                            className={
                                                "text-default-400 text-sm"
                                            }
                                        >
                                            @{item.profile.handle}
                                        </div>
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
                className={appearanceTextColor()}
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
                                                onClick={async () => {
                                                    await handleRelogin()
                                                    //onClose()
                                                }}
                                            >
                                                {!isLogging ? (
                                                    t("button.signin")
                                                ) : (
                                                    <Spinner size={"sm"} />
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
                className={background()}
                onClick={(e) => {
                    e.stopPropagation()
                }}
            >
                <Link
                    className={AuthorIconContainer()}
                    onClick={() => {
                        if (!agent?.session) return
                        setSideBarOpen(false)
                    }}
                    href={`/profile/${agent?.session
                        ?.did}?${nextQueryParams.toString()}`}
                >
                    <div
                        className={
                            "h-[64px] w-[64px] rounded-[10px] overflow-hidden"
                        }
                    >
                        <img
                            className={"h-[64px] w-[64px] rounded-full"}
                            src={userProfileDetailed?.avatar || defaultIcon.src}
                            alt={"avatar"}
                        />
                    </div>
                    <div className={"ml-[12px]"}>
                        <div className={AuthorDisplayName()}>
                            {userProfileDetailed?.displayName ||
                                userProfileDetailed?.handle}
                        </div>
                        <div className={AuthorHandle()}>
                            @{userProfileDetailed?.handle}
                        </div>
                    </div>
                </Link>
                <div className={Content()}>
                    <Link
                        className={NavBarItem()}
                        onClick={() => {
                            setSideBarOpen(false)
                        }}
                        href={`/bookmarks?${nextQueryParams.toString()}`}
                    >
                        <FontAwesomeIcon
                            icon={faBookmark}
                            className={NavBarIcon()}
                        ></FontAwesomeIcon>
                        <div>{t("components.ViewSideBar.bookmark")}</div>
                    </Link>
                    <Link
                        className={NavBarItem()}
                        onClick={() => {
                            setSideBarOpen(false)
                        }}
                        href={`/settings#mute?${nextQueryParams.toString()}`}
                    >
                        <FontAwesomeIcon
                            icon={faVolumeXmark}
                            className={NavBarIcon()}
                        ></FontAwesomeIcon>
                        <div>{t("components.ViewSideBar.mute")}</div>
                    </Link>
                    <Link
                        className={NavBarItem()}
                        onClick={() => {
                            setSideBarOpen(false)
                        }}
                        href={`/feeds?${nextQueryParams.toString()}`}
                    >
                        <FontAwesomeIcon
                            icon={faRss}
                            className={NavBarIcon()}
                        ></FontAwesomeIcon>
                        <div>{t("components.ViewSideBar.feeds")}</div>
                    </Link>
                    <Link
                        className={NavBarItem()}
                        onClick={() => {
                            if (!agent?.session) return
                            setSideBarOpen(false)
                        }}
                        href={`/profile/${agent?.session
                            ?.did}?${nextQueryParams.toString()}`}
                    >
                        <FontAwesomeIcon
                            icon={faUser}
                            className={NavBarIcon()}
                        ></FontAwesomeIcon>
                        <div>profile</div>
                    </Link>
                    <Link
                        className={NavBarItem()}
                        onClick={() => {
                            setSideBarOpen(false)
                        }}
                        href={`/settings#filtering?${nextQueryParams.toString()}`}
                    >
                        <FontAwesomeIcon
                            icon={faHand}
                            className={NavBarIcon()}
                        ></FontAwesomeIcon>
                        <div>Contents Filtering</div>
                    </Link>
                    <Link
                        className={NavBarItem()}
                        onClick={() => {
                            setSideBarOpen(false)
                        }}
                        href={`/settings?${nextQueryParams.toString()}`}
                    >
                        <FontAwesomeIcon
                            icon={faGear}
                            className={NavBarIcon()}
                        ></FontAwesomeIcon>
                        <div>{t("components.ViewSideBar.preferences")}</div>
                    </Link>
                    <a
                        className={NavBarItem()}
                        href={"https://google.com/"}
                        target={"_blank"}
                        rel="noopener noreferrer"
                        onClick={() => {
                            setSideBarOpen(false)
                        }}
                    >
                        <FontAwesomeIcon
                            icon={faFlag}
                            className={NavBarIcon()}
                        ></FontAwesomeIcon>
                        <div>{t("components.ViewSideBar.bugReport")}</div>
                    </a>
                </div>
                <div className={Footer()}>
                    <Link
                        className={NavBarItem()}
                        onClick={() => {
                            setSideBarOpen(false)
                        }}
                        href={`/about?${nextQueryParams.toString()}`}
                    >
                        <FontAwesomeIcon
                            icon={faCircleQuestion}
                            className={NavBarIcon()}
                        />
                        <div>{t("components.ViewSideBar.about")}</div>
                    </Link>
                    <div
                        className={NavBarItem()}
                        onClick={() => {
                            setSideBarOpen(false)
                            setOpenModalReason("switching")
                            onOpen()
                        }}
                    >
                        <FontAwesomeIcon
                            icon={faUsers}
                            className={NavBarIcon()}
                        ></FontAwesomeIcon>
                        <div>{t("components.ViewSideBar.SwitchAccount")}</div>
                    </div>
                    <div
                        className={NavBarItem()}
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
                            className={NavBarIcon()}
                        ></FontAwesomeIcon>
                        <div>{t("components.ViewSideBar.logout")}</div>
                    </div>
                </div>
            </main>
            {/* </main> */}
        </div>
    )
}
