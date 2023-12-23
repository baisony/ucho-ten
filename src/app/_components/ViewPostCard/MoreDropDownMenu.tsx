import {
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
} from "@nextui-org/react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faLanguage,
    faCode,
    faEllipsis,
    faFlag,
    faLink,
    faTrash,
} from "@fortawesome/free-solid-svg-icons"

interface MoreDropDownMenuProps {
    isThisUser: boolean
    onClickTranslate: () => void
    onClickCopyURL: () => void
    onClickCopyJSON: () => void
    onClickReport: () => void
    onClickDelete: () => void
    t: any
}

const MoreDropDownMenu = ({
    isThisUser,
    onClickTranslate,
    onClickCopyURL,
    onClickCopyJSON,
    onClickReport,
    onClickDelete,
    t,
}: MoreDropDownMenuProps) => {
    return (
        <>
            <Dropdown className={"text-black dark:text-white"}>
                <DropdownTrigger>
                    <FontAwesomeIcon
                        icon={faEllipsis}
                        className={
                            "h-[20px] mb-[4px] cursor-pointer text-[#909090]"
                        }
                    />
                </DropdownTrigger>
                <DropdownMenu
                    disallowEmptySelection
                    aria-label="Multiple selection actions"
                    selectionMode="multiple"
                >
                    <DropdownItem
                        key="0"
                        startContent={<FontAwesomeIcon icon={faLanguage} />}
                        onClick={() => {
                            onClickTranslate()
                        }}
                    >
                        {t("pages.postOnlyPage.translate")}
                    </DropdownItem>
                    <DropdownItem
                        key="1"
                        startContent={<FontAwesomeIcon icon={faLink} />}
                        onClick={() => {
                            onClickCopyURL()
                        }}
                    >
                        {t("components.ViewPostCard.copyURL")}
                    </DropdownItem>
                    <DropdownItem
                        key="2"
                        startContent={<FontAwesomeIcon icon={faCode} />}
                        onClick={() => {
                            onClickCopyJSON()
                        }}
                    >
                        {t("components.ViewPostCard.copyJSON")}
                    </DropdownItem>
                    <DropdownSection title="Danger zone">
                        {isThisUser ? (
                            <DropdownItem
                                key="report"
                                className="text-danger"
                                color="danger"
                                startContent={<FontAwesomeIcon icon={faFlag} />}
                                onClick={() => {
                                    onClickReport()
                                }}
                            >
                                {t("components.ViewPostCard.report")}
                            </DropdownItem>
                        ) : (
                            <DropdownItem
                                key="delete"
                                className="text-danger"
                                color="danger"
                                startContent={
                                    <FontAwesomeIcon icon={faTrash} />
                                }
                                onClick={() => {
                                    onClickDelete()
                                }}
                            >
                                {t("components.ViewPostCard.delete")}
                            </DropdownItem>
                        )}
                    </DropdownSection>
                </DropdownMenu>
            </Dropdown>
        </>
    )
}

export default MoreDropDownMenu
