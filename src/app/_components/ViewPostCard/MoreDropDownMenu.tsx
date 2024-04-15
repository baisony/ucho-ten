import {
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
} from "@nextui-org/react"
import { useTranslation } from "react-i18next"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faAt } from "@fortawesome/free-solid-svg-icons/faAt"
import { faCode } from "@fortawesome/free-solid-svg-icons/faCode"
import { faEllipsis } from "@fortawesome/free-solid-svg-icons/faEllipsis"
import { faFlag } from "@fortawesome/free-solid-svg-icons/faFlag"
import { faLanguage } from "@fortawesome/free-solid-svg-icons/faLanguage"
import { faLink } from "@fortawesome/free-solid-svg-icons/faLink"
import { faTrash } from "@fortawesome/free-solid-svg-icons/faTrash"
import { faUser } from "@fortawesome/free-solid-svg-icons/faUser"

import { memo } from "react"

interface MoreDropDownMenuProps {
    isThisUser: boolean
    onClickTranslate: () => void
    onClickCopyURL: () => void
    onClickCopyATURI: () => void
    onClickCopyDID: () => void
    onClickCopyJSON: () => void
    onClickReport: () => void
    onClickDelete: () => void
}

const MoreDropDownMenu = ({
    isThisUser,
    onClickTranslate,
    onClickCopyURL,
    onClickCopyATURI,
    onClickCopyDID,
    onClickCopyJSON,
    onClickReport,
    onClickDelete,
}: MoreDropDownMenuProps) => {
    const { t } = useTranslation()
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
                    <DropdownSection title="Actions">
                        <DropdownItem
                            key="0"
                            startContent={<FontAwesomeIcon icon={faLanguage} />}
                            onClick={() => {
                                onClickTranslate()
                            }}
                        >
                            {t("pages.postOnlyPage.translate")}
                        </DropdownItem>
                    </DropdownSection>
                    <DropdownSection title="Copy">
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
                            startContent={<FontAwesomeIcon icon={faAt} />}
                            onClick={() => {
                                onClickCopyATURI()
                            }}
                        >
                            {t("pages.postOnlyPage.copyATURI")}
                        </DropdownItem>
                        <DropdownItem
                            key="3"
                            startContent={<FontAwesomeIcon icon={faUser} />}
                            onClick={() => {
                                onClickCopyDID()
                            }}
                        >
                            {t("pages.postOnlyPage.copyDID")}
                        </DropdownItem>
                        <DropdownItem
                            key="4"
                            startContent={<FontAwesomeIcon icon={faCode} />}
                            onClick={() => {
                                onClickCopyJSON()
                            }}
                        >
                            {t("components.ViewPostCard.copyJSON")}
                        </DropdownItem>
                    </DropdownSection>
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

export default memo(MoreDropDownMenu)
