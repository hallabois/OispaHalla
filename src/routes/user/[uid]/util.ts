import { leaderboard_endpoint } from "$lib/stores/leaderboardstore";

export type Score = {
    _id: string
    size: number
    score: number
    breaks: number
    history: string
    user: string
    hash: string
    createdAt: string
    updatedAt: string
}

export type leaderBoardDataOk = {
    _id: string,
    screenName: string,
    scores: {[key: number]: Score},
    uid: string,
    createdAt: string,
    updatedAt: string,
    __v: number,
}

export type leaderBoardDataResult = {
    err: string | null,
    data: leaderBoardDataOk | null
};

export async function getLeaderBoardData(uid: string, admin_token: string): Promise<leaderBoardDataResult> {
    // ADMIN_TOKEN must match the ADMIN_TOKEN that of the lb backend
    let url = `${leaderboard_endpoint}/admin/user/uid/${uid}?token=${encodeURIComponent(admin_token)}`;
    console.log("getting lb user data for user", uid);
    let resp = await fetch(url);
    if(resp.ok) {
        let json = await resp.json();
        return {data: json, err: null};
    }
    console.warn("lb user data err", resp);
    return {err: resp.statusText, data: null};
}

export function numberWithSpaces(x: number): string {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}