// useGetListInfo.ts

export const useGetListInfo = async (
    url: string,
    agent: any,
    setIsOGPGetProcessing: React.Dispatch<React.SetStateAction<boolean>>,
    setGetListData: React.Dispatch<React.SetStateAction<any>>
) => {
    if (!agent) return
    const regex = /\/([^/]+)\/lists\/([^/]+)/
    const matches = url.match(regex)
    if (matches) {
        const did = matches[1]
        const feedName = matches[2]
        try {
            setIsOGPGetProcessing(true)
            const { data } = await agent.app.bsky.graph.getList({
                list: `at://${did}/app.bsky.graph.list/${feedName}`,
            })
            setGetListData(data.list)
        } catch (e) {
            console.log(e)
        } finally {
            setIsOGPGetProcessing(false)
        }
    }
}
