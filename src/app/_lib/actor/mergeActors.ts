import { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs"

export const mergeActors = (
    newActors: ProfileView[] | null,
    actors: ProfileView[] | null
): ProfileView[] => {
    if (newActors === null) {
        return actors || []
    }

    if (actors === null) {
        return newActors || []
    }

    const didsSet = new Set<string>()
    const allActors = [...newActors, ...actors]

    let mergedPosts: ProfileView[] = []

    for (const actor of allActors) {
        console.log(typeof actor)
        if (actor) {
            if (didsSet.has(actor.did)) {
                continue
            }
            mergedPosts = [...mergedPosts, actor]

            didsSet.add(actor.did)
        }
    }

    return mergedPosts
}
