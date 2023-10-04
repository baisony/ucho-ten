'use client';
import {isMobile} from "react-device-detect";
import {useEffect, useState} from "react";

import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell} from "@nextui-org/react";
import {Accordion, AccordionItem, Tooltip} from "@nextui-org/react";
import {viewMutewordsPage} from "@/app/settings/mute/words/styles";
import {
    LeadingActions,
    SwipeableList,
    SwipeableListItem,
    SwipeAction,
    TrailingActions,
} from 'react-swipeable-list';
import 'react-swipeable-list/dist/styles.css';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTrash} from "@fortawesome/free-solid-svg-icons";


export default function Root() {

    const [darkMode, setDarkMode] = useState(false);
    const color = darkMode ? 'dark' : 'light'
    const { background, accordion, button } = viewMutewordsPage();

    const modeMe = (e:any) => {
        setDarkMode(!!e.matches);
    };

    useEffect(() => {
        console.log('hoge')
        const matchMedia = window.matchMedia("(prefers-color-scheme: dark)");

        setDarkMode(matchMedia.matches);
        matchMedia.addEventListener("change", modeMe);

        return () => matchMedia.removeEventListener("change", modeMe);
    }, []);

    return(
        <>
            <div className={background({color:color})}>
                <Table removeWrapper aria-label="Example static collection table"
                       onRowAction={(key) => alert(`Opening item ${key}...`)}
                       className={color}
                >
                    <TableHeader>
                        <TableColumn>Mute Accounts Categories</TableColumn>
                    </TableHeader>
                    <TableBody>
                        <TableRow key="1" className={'cursor-pointer'}>
                            <TableCell>
                                <Accordion>
                                    <AccordionItem
                                        aria-label="下ネタ"
                                        title="下ネタ"
                                    >
                                        a
                                    </AccordionItem>
                                    <AccordionItem>
                                        a
                                    </AccordionItem>
                                    <AccordionItem>
                                        a
                                    </AccordionItem>
                                    <AccordionItem>
                                        a
                                    </AccordionItem>
                                </Accordion>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <Table removeWrapper aria-label="Example static collection table"
                       onRowAction={(key) => alert(`Opening item ${key}...`)}
                       className={color}
                >
                    <TableHeader>
                        <TableColumn>Time Limit Mute Accounts</TableColumn>
                        <TableColumn>period</TableColumn>
                    </TableHeader>
                    <TableBody>
                        <TableRow key="1" className={'cursor-pointer'}>
                            <TableCell>イーロン</TableCell>
                            <TableCell>~ 23/12/26</TableCell>
                        </TableRow>
                        <TableRow key="2" className={'cursor-pointer'}>
                            <TableCell>イーロン</TableCell>
                            <TableCell>~ 23/12/26</TableCell>
                        </TableRow>
                        <TableRow key="3" className={'cursor-pointer'}>
                            <TableCell>イーロン</TableCell>
                            <TableCell>~ 23/12/26</TableCell>
                        </TableRow>
                        <TableRow key="4" className={'cursor-pointer'}>
                            <TableCell>イーロン</TableCell>
                            <TableCell>~ 23/12/26</TableCell>
                        </TableRow>
                        <TableRow key="5" className={'cursor-pointer'}>
                            <TableCell>イーロン</TableCell>
                            <TableCell>~ 23/12/26</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <Table removeWrapper aria-label="Example static collection table"
                       className={color}
                >
                    <TableHeader>
                        <TableColumn>Forever Mute Accounts</TableColumn>
                        <TableColumn> </TableColumn>
                    </TableHeader>
                    <TableBody>
                        <TableRow key="1" className={'cursor-pointer'}>
                            <TableCell>イーロン</TableCell>
                            <TableCell><FontAwesomeIcon icon={faTrash} className={'text-red-500'}/></TableCell>
                        </TableRow>
                        <TableRow key="2" className={'cursor-pointer'}>
                            <TableCell>イーロン</TableCell>
                            <TableCell><FontAwesomeIcon icon={faTrash} className={'text-red-500'}/></TableCell>
                        </TableRow>
                        <TableRow key="3" className={'cursor-pointer'}>
                            <TableCell>イーロン</TableCell>
                            <TableCell><FontAwesomeIcon icon={faTrash} className={'text-red-500'}/></TableCell>
                        </TableRow>
                        <TableRow key="4" className={'cursor-pointer'}>
                            <TableCell>イーロン</TableCell>
                            <TableCell><FontAwesomeIcon icon={faTrash} className={'text-red-500'}/></TableCell>
                        </TableRow>
                        <TableRow key="5" className={'cursor-pointer'}>
                            <TableCell>イーロン</TableCell>
                            <TableCell><FontAwesomeIcon icon={faTrash} className={'text-red-500'}/></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </>
    )
}