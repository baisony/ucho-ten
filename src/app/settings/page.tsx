'use client';
import {isMobile} from "react-device-detect";

import {Accordion, AccordionItem, Button, ButtonGroup, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Switch, Select, SelectItem} from "@nextui-org/react";
import {useEffect, useState} from "react";
import {viewProfilePage} from "@/app/profile/[identifier]/styles";
import {viewSettingsPage} from "@/app/settings/styles"
import {useRouter} from "next/navigation";

export default function Root() {
    const router = useRouter()
    const contentFilteringList = [
        {content: 'Explicit Sexual Images', value: 'Warn'},
        {content: 'Other Nudity', value: 'Warn'},
        {content: 'Sexually Suggestive', value: 'Warn'},
        {content: 'Violent / Bloody', value: 'Warn'},
        {content: 'Hate Group Iconography', value: 'Warn'},
        {content: 'Spam', value: 'Warn'},
        {content: 'Impersonation', value: 'Warn'},
    ]
    const [darkMode, setDarkMode] = useState(false);
    const color = darkMode ? 'dark' : 'light'
    const { background, accordion, button } = viewSettingsPage();

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
            <div className={`w-full ${background({color: color})}`}>
                <Accordion variant="light" defaultExpandedKeys={["general"]} className={accordion({color:color})}>
                    <AccordionItem key="general" aria-label="General" title="General" className={accordion({color:color})}>
                        <div className={'flex justify-between items-center pt-[5px] pb-[5px] h-[40px]'}>
                            <div>Theme Color</div>
                            <ButtonGroup>
                                <Button>System</Button>
                                <Button isDisabled={color === "light"}>Light</Button>
                                <Button isDisabled={color === "dark"}>Dark</Button>
                            </ButtonGroup>
                        </div>
                        <div className={'flex justify-between items-center pt-[5px] pb-[5px] h-[40px]'}>
                            <div>Language</div>
                            <Dropdown className={accordion({color:color})}>
                                <DropdownTrigger>
                                    <Button
                                        variant="bordered"
                                    >
                                        Select Language
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu aria-label="Select Languages">
                                    <DropdownItem key="japanese">日本語</DropdownItem>
                                    <DropdownItem key="english">English</DropdownItem>
                                    <DropdownItem key="hoge">hoge</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </div>
                        <div className={''}>
                            <div>Notification</div>
                            <div className={'flex justify-between items-center h-[40px]'}>
                                <div>FF外からの引用リポスト通知を受け取らない</div>
                                <Switch ></Switch>
                            </div>
                        </div>
                        <div className={'flex justify-between items-center pt-[5px] pb-[5px] h-[40px]'}>
                            <div>翻訳先の言語</div>
                            <Select
                                size={'sm'}
                                label="Select an animal"
                                className={`${accordion({color:color})} max-w-xs`}
                            >
                                <SelectItem key={'a'} value={'a'} className={accordion({color:color})}>a</SelectItem>
                            </Select>
                        </div>
                    </AccordionItem>
                    <AccordionItem key="contentFiltering" aria-label="Accordion 1" title="Content Filtering" className={`${accordion({color:color})}`}>
                        {contentFilteringList.map((item, index) => (
                            <div key={index}
                                className={'flex justify-between items-center pt-[5px] pb-[5px]'}
                            >
                                <div>{item.content}</div>
                                <div className={''}>
                                    <ButtonGroup>
                                        <Button size="sm" isDisabled={item.value === 'Hide'}>Hide</Button>
                                        <Button size="sm" isDisabled={item.value === 'Warn'}>Warn</Button>
                                        <Button size="sm" isDisabled={item.value === 'Show'}>Show</Button>
                                    </ButtonGroup>
                                </div>
                            </div>
                        ))}
                    </AccordionItem>
                    <AccordionItem key='mute' aria-label={'Mute'} title='Mute' className={accordion({color:color})} >
                        <div className={'flex justify-between items-center h-[60px] w-full select-none cursor-pointer'}
                             onClick={() => {
                                 router.push('/settings/mute/words')
                             }}
                        >
                            Mute Words
                        </div>
                        <div className={'flex justify-between items-center h-[60px] w-full select-none cursor-pointer'}
                            onClick={() => {
                                router.push('/settings/mute/accounts')
                            }}
                        >
                            Mute Accounts
                        </div>
                    </AccordionItem>
                </Accordion>
            </div>
        </>
    )
}