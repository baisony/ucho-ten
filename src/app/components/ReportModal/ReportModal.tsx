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
import React, { useState } from "react"
import { useAgent } from "@/app/_atoms/agent"
import { ViewPostCard } from "@/app/components/ViewPostCard"
import { ViewQuoteCard } from "@/app/components/ViewQuoteCard"
import type { ComAtprotoModerationCreateReport } from "@atproto/api"

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
    color: "light" | "dark"
    target: "post" | "account"
    post?: any
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
        className,
        color,
        target,
        post,
    } = props
    const [agent] = useAgent()
    const [reportReasonText, setReportReasonText] = useState<string>("")
    const [reportReasonType, setReportReasonType] = useState<string>("")
    const [isReportSending, setIsReportSending] = useState<boolean>(false)
    const [isReportSuccess, setIsReportSuccess] = useState<boolean | null>(null)
    const reasonList: Record<string, { reasonType: string; reason: string }> = {
        spam: {
            reasonType: "com.atproto.moderation.defs#reasonSpam",
            reason: "スパム行為",
        },
        misleading: {
            reasonType: "com.atproto.moderation.defs#reasonMisleading",
            reason: "誤解を招くコンテンツ",
        },
        sexual: {
            reasonType: "com.atproto.moderation.defs#reasonSexual",
            reason: "望まない性的コンテンツ",
        },
        copyright: { reasonType: "__copyright__", reason: "著作権侵害" },
        rude: {
            reasonType: "com.atproto.moderation.defs#reasonRude",
            reason: "反社会的な行動/言動",
        },
        violation: {
            reasonType: "com.atproto.moderation.defs#reasonViolation",
            reason: "緊急性を要する違法行為",
        },
        other: {
            reasonType: "com.atproto.moderation.defs#reasonOther",
            reason: "その他",
        },
    }
    const reasonTypeToReason: Record<string, string> = {
        "com.atproto.moderation.defs#reasonMisleading": "misleading",
        "com.atproto.moderation.defs#reasonSpam": "spam",
        "com.atproto.moderation.defs#reasonSexual": "sexual",
        __copyright__: "copyRight",
        "com.atproto.moderation.defs#reasonRude": "rude",
        "com.atproto.moderation.defs#reasonViolation": "violation",
        "com.atproto.moderation.defs#reasonOther": "other",
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
    return (
        <Modal
            isOpen={isOpen}
            placement={placement}
            onOpenChange={onOpenChange}
            className={`${className} ${color} ${
                color === `dark` ? `text-white` : `text-black`
            }`}
            hideCloseButton
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
                                    color={color}
                                    profile={profile}
                                />
                            </div>
                            <div
                                className={"flex items-center justify-between"}
                            >
                                <div className={"mr-[10px]"}>
                                    <span>Select reason</span>
                                </div>
                                <Select
                                    onSelectionChange={(e: any) => {
                                        setReportReasonType(
                                            //@ts-ignore
                                            reasonList[e.currentKey].reasonType
                                        )
                                    }}
                                    className={"w-[300px]"}
                                    size={"sm"}
                                    aria-label={"Select-reason"}
                                >
                                    <SelectItem key={"spam"}>
                                        {reasonList.spam.reason}
                                    </SelectItem>
                                    <SelectItem key={"sexual"}>
                                        {reasonList.sexual.reason}
                                    </SelectItem>
                                    <SelectItem key={"copyRight"}>
                                        {reasonList.copyright.reason}
                                    </SelectItem>
                                    <SelectItem key={"rude"}>
                                        {reasonList.rude.reason}
                                    </SelectItem>
                                    <SelectItem key={"violation"}>
                                        {reasonList.violation.reason}
                                    </SelectItem>
                                    <SelectItem key={"misleading"}>
                                        {reasonList.misleading.reason}
                                    </SelectItem>
                                    <SelectItem key={"other"}>
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
                                        errorMessage="The description should be at least 255 characters long."
                                        required={
                                            reportReasonType ===
                                            "com.atproto.moderation.defs#reasonOther"
                                        }
                                        onChange={(e) => {
                                            setReportReasonText(e.target.value)
                                            console.log(e)
                                        }}
                                        placeholder={"Description"}
                                    />
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button onPress={onClose}>cancel</Button>
                            <Button
                                onPress={() => {
                                    handleSendButtonPush
                                    setIsReportSuccess(false)
                                    onClose
                                }}
                                color={
                                    !isReportSending && isReportSuccess
                                        ? "success"
                                        : "danger"
                                }
                                disabled={
                                    !!(
                                        (reportReasonType ===
                                            "com.atproto.moderation.defs#reasonOther" &&
                                            reportReasonText.length == 0) ||
                                        reportReasonType === "" ||
                                        isReportSending ||
                                        isReportSuccess
                                    )
                                }
                            >
                                {!isReportSending &&
                                    isReportSuccess === null &&
                                    "send"}
                                {isReportSending && <Spinner size="sm" />}
                                {!isReportSending &&
                                    isReportSuccess &&
                                    "success"}
                                {!isReportSending &&
                                    isReportSuccess === false &&
                                    "failed"}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
