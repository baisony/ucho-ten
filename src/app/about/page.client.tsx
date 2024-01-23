"use client"
import { useCurrentMenuType } from "../_atoms/headerMenu"
import { useLayoutEffect } from "react"

export default function Root() {
    const [, setCurrentMenuType] = useCurrentMenuType()
    useLayoutEffect(() => {
        setCurrentMenuType("about")
    }, [])

    return <></>
}
