'use client';
import {isMobile} from "react-device-detect";

import {
    Accordion,
    AccordionItem,
    Button,
    ButtonGroup,
    Switch,
    Select,
    SelectItem,
    Spinner
} from "@nextui-org/react";
import {useCallback, useEffect, useState} from "react";
import {viewProfilePage} from "@/app/profile/[identifier]/styles";
import {viewSettingsPage} from "@/app/settings/styles"
import {useRouter} from "next/navigation";
import {useUserPreferencesAtom} from "@/app/_atoms/preferences";
import {useAgent} from "@/app/_atoms/agent";
import {BskyLabelPreference} from "@atproto/api/";

export default function Root() {
    const router = useRouter()
    const ToTranslateLanguages: string[] = [
        'English',
        'Japanese',
        'Chinese',
        'Korean',
        'French',
        'German',
        'Spanish',
        'Italian',
        'Russian',
        'Portuguese',
        'Arabic',
        'Turkish',
        'Hindi',
        'Indonesian',
        'Thai',
    ]
    const [userPreferences, setUserPreferences] = useUserPreferencesAtom()
    const [agent] = useAgent()
    const [darkMode, setDarkMode] = useState(false);
    const color = darkMode ? 'dark' : 'light'
    const [isLoading, setIsLoading] = useState(false)
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


    const {contentLabels} = userPreferences || {}


    const handleButtonClick = async (key: any, value: BskyLabelPreference) => {
        if(isLoading) return
        setIsLoading(true)
        // ここでボタンの状態を更新
        const newContentLabels = { ...contentLabels };
        newContentLabels[key] = value;
        //@ts-ignore
        setUserPreferences((prevUserPreferences) => ({
            ...prevUserPreferences,
            contentLabels: newContentLabels,
        }));

        // そして、APIなどで設定を保存する等の操作を実行
        await agent?.setContentLabelPref(key, value);
        setIsLoading(false)
    };


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
                            <div>Display Language</div>
                            <Select
                                color={"default"}
                                size={'sm'}
                                label="Languages"
                                variant={'flat'}
                                className={`${accordion({color:color})} max-w-xs`}
                            >
                                {ToTranslateLanguages.map((language) => {
                                    return(
                                        <SelectItem key={language}>{language}</SelectItem>
                                    )

                                })}
                            </Select>
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
                                label="Select a Language"
                                className={`${accordion({color:color})} max-w-xs`}
                            >
                                {ToTranslateLanguages.map((language) => {
                                    return(
                                        <SelectItem key={language}>{language}</SelectItem>
                                    )

                                })}
                            </Select>
                        </div>
                    </AccordionItem>
                    <AccordionItem key="contentFiltering" aria-label="Accordion 1" title="Content Filtering" className={`${accordion({color:color})} relative`}>
                        {Object.entries(userPreferences?.contentLabels || {}).map(([key, value]) => (
                            <div key={key} className={'flex justify-between items-center pt-[5px] pb-[5px]'}>
                                <div>
                                    {
                                        key === 'nsfw' ? 'Explicit Sexual Images' : (
                                            key === 'nudity' ? 'Other Nudity' : (
                                                key === 'spam' ? 'Spam' : (
                                                    key === 'gore' ? 'Violent / Bloody' : (
                                                        key === 'hate' ? 'Hate Group Iconography' : (
                                                            key === 'impersonation' ? 'Impersonation' : (
                                                                key === 'suggestive' ? 'Sexually Suggestive' : key
                                                            )
                                                        )
                                                    )
                                                )
                                            )
                                        )
                                    }
                                </div>
                                <div className={''}>
                                    <ButtonGroup>
                                        <Button
                                            size="sm"
                                            isDisabled={contentLabels && contentLabels[key] === 'hide'}
                                            onClick={async () => {
                                                await handleButtonClick(key, 'hide');
                                            }}
                                        >
                                            Hide
                                        </Button>
                                        <Button
                                            size="sm"
                                            isDisabled={contentLabels && contentLabels[key] === 'warn'}
                                            onClick={async () => {
                                                await handleButtonClick(key, 'warn');
                                            }}
                                        >
                                            Warn
                                        </Button>
                                        <Button
                                            size="sm"
                                            isDisabled={contentLabels && contentLabels[key] === 'ignore'}
                                            onClick={async () => {
                                                await handleButtonClick(key, 'ignore');
                                            }}
                                        >
                                            Show
                                        </Button>
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