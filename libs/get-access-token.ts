import { supabase } from "./supabase";


export default async function getAccessToken(): Promise<string | undefined> {
    try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
            console.error("Error fetching characters:", error);
            return;
        }
        const session = data.session;
        if (!session) {
            console.log("No active session found.");
            return;
        }
        const accessToken = session.access_token;
        if (!accessToken) {
            console.log("No access token found in the session.");
            return;
        }
        return accessToken;
    } catch (error) {
        throw new Error("Failed to get access token: " + error);
    }
}