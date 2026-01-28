import { supabase } from "@/libs/supabase";
import { useQuery } from "@tanstack/react-query";


export function useGetUser() {
    return useQuery({
        queryKey: ['current-user'],
        queryFn: async () => {
            const { data: { user }, error } = await supabase.auth.getUser();

            if (error) {
                console.error("Error fetching user:", error);
                return null;
            }

            return user;
        }
    })
}