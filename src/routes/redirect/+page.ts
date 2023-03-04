import { browser } from '$app/environment';
import { pb } from '$lib/pocketbase';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
 
export const load = (async ({ url }) => {
    const params = url.searchParams;

    if (!browser) {
        return;
    }
    
    const json = window.localStorage.getItem('provider');
        if (!json) {
            throw redirect(300, '/');
        }
        const provider = JSON.parse(json);
        
        if (provider.state !== params.get("state")) {
            throw "State parameters don't match.";
        }
        let code = params.get("code");
        if (!code) {
            throw redirect(300, '/');
        }
        try {
            await pb.collection('users').authWithOAuth2(
                provider.name,
                code,
                provider.codeVerifier,
                "https://todo.chrisch.dev/redirect",
            )
        } catch {
            throw redirect(300, '/');
        }
        throw redirect(300, '/');
}) satisfies PageLoad;