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
import { LANGUAGES } from "../_constants/lanuages"

interface LanguagesSelectionModalProps {
    isOpen: boolean
    onOpenChange: (isOpen: boolean) => void
    onSelectionChange: (keys: Selection) => any
    postContentLanguages: Set<string>
}

const LanguagesSelectionModal = ({
    isOpen,
    onOpenChange,
    onSelectionChange,
    postContentLanguages,
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
                                    selectionMode="multiple"
                                    selectedKeys={postContentLanguages}
                                    defaultSelectedKeys={postContentLanguages}
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
                                                    <TableCell> </TableCell>
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
