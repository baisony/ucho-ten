import {
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Selection,
    ModalHeader,
} from "@nextui-org/react"
import { faCheck } from "@fortawesome/free-solid-svg-icons"
import { LANGUAGES } from "../_constants/lanuages"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

interface LanguagesSelectionModalProps {
    isOpen: boolean
    onOpenChange: (isOpen: boolean) => void
    onSelectionChange: (keys: Selection) => void
    PostLanguage: string[]
}

const LanguagesSelectionModal = ({
    isOpen,
    onOpenChange,
    onSelectionChange,
    PostLanguage,
}: LanguagesSelectionModalProps) => {
    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            placement={"bottom"}
            className={"z-[100] max-w-[600px] text-black dark:text-white"}
            hideCloseButton
        >
            <ModalContent>
                {() => (
                    <>
                        <ModalHeader>Select Languages</ModalHeader>
                        <ModalBody>
                            <div className="flex flex-col gap-3">
                                <Table
                                    hideHeader
                                    //color={selectedColor}
                                    disallowEmptySelection
                                    selectionMode="single"
                                    selectedKeys={PostLanguage}
                                    defaultSelectedKeys={PostLanguage}
                                    onSelectionChange={onSelectionChange}
                                    aria-label="Language table"
                                >
                                    <TableHeader>
                                        <TableColumn>Languages</TableColumn>
                                        <TableColumn> </TableColumn>
                                        <TableColumn> </TableColumn>
                                        <TableColumn> </TableColumn>
                                    </TableHeader>
                                    <TableBody>
                                        {LANGUAGES.map((item) => {
                                            return (
                                                <TableRow key={item.code}>
                                                    <TableCell>
                                                        {item.name}
                                                    </TableCell>
                                                    <TableCell> </TableCell>
                                                    <TableCell> </TableCell>
                                                    <TableCell>
                                                        {PostLanguage.includes(
                                                            item.code
                                                        ) && (
                                                            <FontAwesomeIcon
                                                                icon={faCheck}
                                                            />
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </ModalBody>
                        <ModalFooter></ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}

export default LanguagesSelectionModal
