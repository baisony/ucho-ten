import { useUserPreferencesAtom } from "@/app/_atoms/preferences"
import { useState } from "react"
import { DummyHeader } from "@/app/_components/DummyHeader"
import { Button, ButtonGroup, Switch } from "@nextui-org/react"
import { BskyAgent, BskyLabelPreference, BskyPreferences } from "@atproto/api"
import { TFunction } from "i18next"

interface SettingsContentFilteringPageProps {
    t: TFunction
    nextQueryParams: URLSearchParams
    agent: BskyAgent | null
    userPreferences: BskyPreferences | null
}

export const SettingsContentFilteringPage = ({
    t,
    agent,
    userPreferences,
}: SettingsContentFilteringPageProps) => {
    const [, setUserPreferences] = useUserPreferencesAtom()
    const { contentLabels } = userPreferences || {}

    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isAdultContentEnabled] = useState(false)

    const handleButtonClick = async (key: any, value: BskyLabelPreference) => {
        if (isLoading) return
        setIsLoading(true)
        // ここでボタンの状態を更新
        const newContentLabels = { ...contentLabels }
        newContentLabels[key] = value
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        setUserPreferences((prevUserPreferences) => ({
            ...prevUserPreferences,
            contentLabels: newContentLabels,
        }))

        // そして、APIなどで設定を保存する等の操作を実行
        await agent?.setContentLabelPref(key, value)
        setIsLoading(false)
    }

    const handleAdultContentEnabledChange = async (e: any) => {
        if (isLoading) return
        setIsLoading(true)
        const newAdultContentEnabled = e.target.checked
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        setUserPreferences((prevUserPreferences) => ({
            ...prevUserPreferences,
            adultContentEnabled: newAdultContentEnabled,
        }))
        await agent?.setAdultContentEnabled(newAdultContentEnabled)
        setIsLoading(false)
    }

    return (
        <>
            <DummyHeader />
            <div
                className={
                    "w-full flex justify-between text-black dark:text-white"
                }
            ></div>
            {userPreferences?.birthDate && (
                <div
                    className={
                        "w-full flex justify-between text-black dark:text-white"
                    }
                >
                    <div>Enable Adult Content</div>
                    <div>
                        <Switch
                            onChange={async (e) => {
                                await handleAdultContentEnabledChange(e)
                            }}
                            defaultSelected={
                                userPreferences?.adultContentEnabled
                            }
                        />
                    </div>
                </div>
            )}
            {Object.entries(userPreferences?.contentLabels || {}).map(
                ([key]) => (
                    <div
                        key={key}
                        className={
                            "flex justify-between items-center pt-[5px] pb-[5px] text-black dark:text-white bg-white dark:bg-[#16191F] w-full"
                        }
                    >
                        <div>
                            {key === "nsfw"
                                ? t("pages.contentfiltering.nsfw")
                                : key === "nudity"
                                  ? t("pages.contentfiltering.otherNudity")
                                  : key === "spam"
                                    ? t("pages.contentfiltering.spam")
                                    : key === "gore"
                                      ? t("pages.contentfiltering.violence")
                                      : key === "hate"
                                        ? t("pages.contentfiltering.hate")
                                        : key === "impersonation"
                                          ? t(
                                                "pages.contentfiltering.impersonation"
                                            )
                                          : key === "suggestive"
                                            ? t(
                                                  "pages.contentfiltering.sexuallySuggestive"
                                              )
                                            : key}
                        </div>
                        <div className={""}>
                            <ButtonGroup
                                isDisabled={
                                    !isAdultContentEnabled &&
                                    (key === "nsfw" ||
                                        key === "nudity" ||
                                        key === "suggestive")
                                }
                            >
                                <Button
                                    size="sm"
                                    isDisabled={
                                        contentLabels &&
                                        contentLabels[key] === "hide"
                                    }
                                    onClick={async () => {
                                        await handleButtonClick(key, "hide")
                                    }}
                                >
                                    {t("button.hide")}
                                </Button>
                                <Button
                                    size="sm"
                                    isDisabled={
                                        contentLabels &&
                                        contentLabels[key] === "warn"
                                    }
                                    onClick={async () => {
                                        await handleButtonClick(key, "warn")
                                    }}
                                >
                                    {t("button.warn")}
                                </Button>
                                <Button
                                    size="sm"
                                    isDisabled={
                                        contentLabels &&
                                        contentLabels[key] === "ignore"
                                    }
                                    onClick={async () => {
                                        await handleButtonClick(key, "ignore")
                                    }}
                                >
                                    {t("button.show")}
                                </Button>
                            </ButtonGroup>
                        </div>
                    </div>
                )
            )}
        </>
    )
}

export default SettingsContentFilteringPage
