import type { PageLoad } from "./$types";

export const load = (( url ) => {
    return { url: url.url.toString() };
}) satisfies PageLoad;