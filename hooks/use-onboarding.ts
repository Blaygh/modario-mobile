import { supabase } from "@/libs/supabase";
import { StyleDirection } from "@/types";
import { useQuery } from "@tanstack/react-query";


export type ColorRow = {
    family: string;
    hex: string;
    key: string;
    sort_order: number;
    label: string;
}

export type AvoidPreset = {
        description: string,
        key: string,
        label: string
        sort_order: number
}


export interface OnboardingBundle {
    style_cards: {
        id: string, 
        title: string, 
        variant: { img_url: string }
    }[],
    colors: ColorRow[],
    avoid_presets: AvoidPreset[],
    occasions: {
        key: string,
        label: string,
        sort_order: number
    }[]
}

interface OnboardingState {
    id: string;
    created_at: string;
    user_id: string;
    color_picks: string[] | null;
    color_avoids: string[] | null;
    style_direction: StyleDirection;
    style_picks: string[] | null;
    occasions: string[] | null;
    is_complete: boolean | null;
    avatar_choice: string | null;
}

export function useGetOnboardingBundle() {
    return useQuery({
        queryKey: ['onboarding-bundle'],
        queryFn: async (): Promise<OnboardingBundle> => {
            // get the user
            const { data: { user }, error } = await supabase.auth.getUser();

            if (error || !user) {
                console.error("Error fetching user:", error);
                throw new Error("User not authenticated");
            }

            // get the style direction in the onboarding state
            const {data, error: obsError} = await supabase.from("onboarding_states")
            .select("style_direction")
            .eq("user_id", user?.id)
            .single();

            if (obsError || !data.style_direction) {
                console.error("Error fetching onboarding state:", obsError);
                throw new Error("Onboarding state not found");
            }

            const res = await supabase.functions.invoke('get-onboarding-bundle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: {
                    style_direction: data.style_direction,
                }
            });
            
            return res.data;
        }
    });
}

export function useGetOnboardingState() {
    return useQuery({
        queryKey: ['onboarding-state'],
        queryFn: async () => {
            // get the user
            const { data: { user }, error } = await supabase.auth.getUser();

            if (error || !user) {
                console.error("Error fetching user:", error);
                return null;
            }

            const { data, error: obError } = await supabase.from("onboarding_states")
                .select("*")
                .eq("user_id", user?.id)
                .single();

            if (obError) {
                console.error("Error fetching onboarding state:", obError);
                return null;
            }

            return data as OnboardingState | null;
        }
    });
}

