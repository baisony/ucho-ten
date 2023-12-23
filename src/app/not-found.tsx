"use client"
import zazen from "@/../public/images/404page/zazen_obousan.png"
import fortyfour from "@/../public/images/404page/404.png"
import Image from "next/image"
import { useStatusCodeAtPage } from "@/app/_atoms/statusCode"
import { useEffect } from "react"
import { useCurrentMenuType } from "@/app/_atoms/headerMenu"
import { useRouter } from "next/navigation"

const PageNotFound = () => {
    const router = useRouter()
    const [, setStatusCode] = useStatusCodeAtPage()
    const [, setCurrentMenuType] = useCurrentMenuType()
    setCurrentMenuType("notFound")
    useEffect(() => {
        setStatusCode(404)
    }, [])
    return (
        <div className="w-full h-full flex justify-center items-center">
            <div
                className="flex flex-col items-center hover:cursor-pointer text-black dark:text-white"
                onClick={() => {
                    router.back()
                }}
            >
                <Image src={fortyfour} alt="404" />
                <Image src={zazen} alt="404" height={150} className="mt-5" />
                <div>Go back</div>
            </div>
        </div>
    )
}

export default PageNotFound
