"use client"
import zazen from "@/../public/images/404page/zazen_obousan.png"
import fortyfour from "@/../public/images/404page/404.png"
import Image from "next/image"
import { useStatusCodeAtPage } from "@/app/_atoms/statusCode"
import { useEffect } from "react"
import { useCurrentMenuType } from "@/app/_atoms/headerMenu"

const PageNotFound = () => {
    const [, setStatusCode] = useStatusCodeAtPage()
    const [currentMenuType, setCurrentMenuType] = useCurrentMenuType()
    setCurrentMenuType("notFound")
    useEffect(() => {
        setStatusCode(404)
    }, [])
    return (
        <div className="w-full h-full flex justify-center items-center">
            <div className="flex flex-col items-center ">
                <Image src={fortyfour} alt="404" />
                <Image src={zazen} alt="404" height={150} className="mt-5" />
            </div>
        </div>
    )
}

export default PageNotFound
