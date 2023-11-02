"use client"
import { isMobile } from "react-device-detect"
import { useCurrentMenuType } from "../_atoms/headerMenu"

export default function Root() {
    const [, setCurrentMenuType] = useCurrentMenuType()
    setCurrentMenuType("about")
    
    return <></>
}
