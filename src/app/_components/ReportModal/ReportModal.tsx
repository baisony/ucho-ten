import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Select,
    SelectItem,
    Spinner,
    Textarea,
} from "@nextui-org/react"
import { useState } from "react"
import { useAgent } from "@/app/_atoms/agent"
import { ViewQuoteCard } from "@/app/_components/ViewQuoteCard"
import type { ComAtprotoModerationCreateReport } from "@atproto/api"
import { useTranslation } from "react-i18next"
import { reportModalStyle } from "@/app/_components/ReportModal/styles"
import { isMobile } from "react-device-detect"

/**
 * SetttingsModal props.
 */
export type ReportModalProps = {
    postUri?: string
    postCid?: string
    profile?: any
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
    placement?: "top" | "center"
    className?: string
    target: "post" | "account"
    post?: any
    nextQueryParams: URLSearchParams
}

/**
 * SetttingsModal component.
 */
export const ReportModal = (props: ReportModalProps) => {
    const {
        postUri,
        postCid,
        profile,
        isOpen,
        onOpenChange,
        placement,
        target,
        post,
        nextQueryParams,
    } = props
    const { appearanceTextColor } = reportModalStyle()
    const [agent] = useAgent()
    const { t } = useTranslation()
    const [reportReasonText, setReportReasonText] = useState<string>("")
    const [reportReasonType, setReportReasonType] = useState<string>("")
    const [isReportSending, setIsReportSending] = useState<boolean>(false)
    const [isReportSuccess, setIsReportSuccess] = useState<boolean | null>(null)
    const reasonList: Record<string, { reasonType: string; reason: string }> = {
        spam: {
            reasonType: "com.atproto.moderation.defs#reasonSpam",
            reason: t("text.spam"),
        },
        misleading: {
            reasonType: "com.atproto.moderation.defs#reasonMisleading",
            reason: t("text.misleading"),
        },
        sexual: {
            reasonType: "com.atproto.moderation.defs#reasonSexual",
            reason: t("text.sexual"),
        },
        copyright: { reasonType: "__copyright__", reason: t("text.copyright") },
        rude: {
            reasonType: "com.atproto.moderation.defs#reasonRude",
            reason: t("text.rude"),
        },
        violation: {
            reasonType: "com.atproto.moderation.defs#reasonViolation",
            reason: t("text.violation"),
        },
        other: {
            reasonType: "com.atproto.moderation.defs#reasonOther",
            reason: t("text.other"),
        },
    }

    const submitReport = async () => {
        setIsReportSending(true)
        console.log(profile)
        try {
            const reportJson: ComAtprotoModerationCreateReport.InputSchema = {
                reasonType: reportReasonType,
                subject: {
                    $type:
                        target === "post"
                            ? "com.atproto.repo.strongRef"
                            : "com.atproto.admin.defs#repoRef",
                },
                reason: reportReasonText,
            }
            if (target === "post") {
                reportJson.subject.cid = postCid || post?.cid
                reportJson.subject.uri = postUri || post?.uri
            } else if (target === "account") {
                reportJson.subject.did = profile?.did
            } else {
                return undefined
            }
            const report = await agent?.createModerationReport(reportJson)
            setIsReportSending(false)
            console.log(report)
            return report
        } catch (e: any) {
            console.log(e)
            setIsReportSending(false)
            return undefined
        }
    }

    const handleSendButtonPush = async () => {
        //console.log(reportReasonText)
        //console.log(reportReasonType)
        const result = await submitReport()
        if (result?.success) {
            setIsReportSuccess(true)
            const _sleep = (ms: number) =>
                new Promise((resolve) => setTimeout(resolve, ms))
            await _sleep(2000)
        } else {
            setIsReportSuccess(false)
        }
    }
    //console.log(post)
    return (
        <Modal
            isOpen={isOpen}
            placement={placement}
            onOpenChange={onOpenChange}
            hideCloseButton
            className={`${appearanceTextColor()} ${
                isMobile && `mt-[env(safe-area-inset-top)]`
            }`}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>
                            <div>Report {target}</div>
                        </ModalHeader>
                        <ModalBody>
                            <div
                                className={
                                    "w-full h-[50%] max-h-[250px] overflow-y-scroll"
                                }
                            >
                                <ViewQuoteCard
                                    profile={profile}
                                    postJson={post}
                                    nextQueryParams={nextQueryParams}
                                    isEmbedReportModal={true}
                                />
                            </div>
                            <div
                                className={"flex items-center justify-between"}
                            >
                                <div className={"mr-[10px]"}>
                                    <span>{t("modal.report.reason")}</span>
                                </div>
                                <Select
                                    onSelectionChange={(e: any) => {
                                        setReportReasonType(
                                            reasonList[e.currentKey].reasonType
                                        )
                                    }}
                                    className={
                                        "w-[300px] text-black dark:text-white"
                                    }
                                    size={"sm"}
                                    aria-label={"Select-reason"}
                                >
                                    <SelectItem
                                        key={"spam"}
                                        className={appearanceTextColor()}
                                    >
                                        {reasonList.spam.reason}
                                    </SelectItem>
                                    <SelectItem
                                        key={"sexual"}
                                        className={appearanceTextColor()}
                                    >
                                        {reasonList.sexual.reason}
                                    </SelectItem>
                                    <SelectItem
                                        key={"copyRight"}
                                        className={appearanceTextColor()}
                                    >
                                        {reasonList.copyright.reason}
                                    </SelectItem>
                                    <SelectItem
                                        key={"rude"}
                                        className={appearanceTextColor()}
                                    >
                                        {reasonList.rude.reason}
                                    </SelectItem>
                                    <SelectItem
                                        key={"violation"}
                                        className={appearanceTextColor()}
                                    >
                                        {reasonList.violation.reason}
                                    </SelectItem>
                                    <SelectItem
                                        key={"misleading"}
                                        className={appearanceTextColor()}
                                    >
                                        {reasonList.misleading.reason}
                                    </SelectItem>
                                    <SelectItem
                                        key={"other"}
                                        className={appearanceTextColor()}
                                    >
                                        {reasonList.other.reason}
                                    </SelectItem>
                                </Select>
                            </div>
                            <div>
                                <div style={{ width: "100%", height: "100%" }}>
                                    <Textarea
                                        width={"100%"}
                                        variant={"bordered"}
                                        minRows={9}
                                        isInvalid={
                                            reportReasonType ===
                                                "com.atproto.moderation.defs#reasonOther" &&
                                            reportReasonText.length == 0
                                        }
                                        required={
                                            reportReasonType ===
                                            "com.atproto.moderation.defs#reasonOther"
                                        }
                                        onChange={(e) => {
                                            setReportReasonText(e.target.value)
                                            console.log(e)
                                        }}
                                        placeholder={t(
                                            "modal.report.placeholder"
                                        )}
                                    />
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button onPress={onClose}>
                                {t("button.close")}
                            </Button>
                            <Button
                                onPress={() => {
                                    void handleSendButtonPush()
                                    setIsReportSuccess(false)
                                    onClose()
                                }}
                                color={
                                    !isReportSending && isReportSuccess
                                        ? "success"
                                        : "danger"
                                }
                                isDisabled={
                                    !!(
                                        (reportReasonType ===
                                            "com.atproto.moderation.defs#reasonOther" &&
                                            reportReasonText.length === 0) ||
                                        reportReasonType === "" ||
                                        isReportSending ||
                                        isReportSuccess
                                    )
                                }
                            >
                                {!isReportSending &&
                                    isReportSuccess === null &&
                                    t("button.send")}
                                {isReportSending && <Spinner size="sm" />}
                                {!isReportSending &&
                                    isReportSuccess &&
                                    t("button.success")}
                                {!isReportSending &&
                                    isReportSuccess === false &&
                                    t("button.failed")}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
