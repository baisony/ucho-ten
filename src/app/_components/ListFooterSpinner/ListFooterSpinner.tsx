import { Spinner } from "@nextui-org/react"

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const ListFooterSpinner = ({ context: { hasMore } }) => {
    return (
        hasMore && (
            <div className="flex justify-center mt-4 mb-4">
                <Spinner />
            </div>
        )
    )
}
