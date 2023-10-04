'use client';
import {isMobile} from "react-device-detect";
import {useEffect, useState} from "react";
import {
    Accordion,
    AccordionItem,
    Button,
    ButtonGroup,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger, Select, SelectItem, Switch
} from "@nextui-org/react";

export default function Root() {

    return(
        <>
            <div className={'h-full w-full bg-white'}>
                <Accordion variant="light" defaultExpandedKeys={["general"]}>
                    <AccordionItem key="general" aria-label="General" title="General">
                        <div>
                            <div>Theme Color</div>
                            <ButtonGroup>
                                <Button>System</Button>
                                <Button>Light</Button>
                                <Button>Dark</Button>
                            </ButtonGroup>
                        </div>
                        <div className={'flex'}>
                            <div>Language</div>
                            <Dropdown>
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
                        <div>
                            <div>Notification</div>
                            <div className={'flex justify-between items-center'}>
                                <div>FF外からの引用リポスト通知を受け取らない</div>
                                <Switch></Switch>
                            </div>
                        </div>
                        <div>
                            <div>翻訳先の言語</div>
                            <Select
                                label="Select an animal"
                                className="max-w-xs"
                            >
                                <SelectItem key={'a'} value={'a'}>a</SelectItem>
                            </Select>
                        </div>
                    </AccordionItem>
                </Accordion>
            </div>
        </>
    )
}