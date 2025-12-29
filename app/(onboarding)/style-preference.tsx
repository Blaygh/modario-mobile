import { View, Text, Pressable, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Grid, GridItem } from '@/components/ui/grid';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/libs/supabase";
import { Link } from "expo-router";
import ProgressBar from "@/components/custom/progress-bar";
import { Image } from "expo-image";
import { useState } from "react";
import FontAwesome from '@expo/vector-icons/FontAwesome';

const placeholder = [
    {
        id: 1,
        image_url: 'https://images.pexels.com/photos/1375849/pexels-photo-1375849.jpeg',
    },
    {
        id: 2,
        image_url: 'https://images.pexels.com/photos/1799829/pexels-photo-1799829.jpeg',
    },
    {
        id: 3,
        image_url: 'https://via.placeholder.com/150',
    },
    {
        id: 4,
        image_url: 'https://via.placeholder.com/150',
    },
    {
        id: 5,
        image_url: 'https://via.placeholder.com/150',
    },
    {
        id: 6,
        image_url: 'https://via.placeholder.com/150',
    },
]


export default function StylePreferenceScreen() {
    const [selectedCards, setSelectedCards] = useState<number[]>([]);

    // get the style preference outfit items
    // eslint-disable-next-line no-empty-pattern
    const { } = useQuery({
        queryKey: ['style-preference-outfits'],
        queryFn: async () => {
            const { data, error } = await supabase.from('outfits').select('*');
            if (error) {
                throw new Error(error.message);
            }

            return data;
        },
    })

    const handleSelectCard = (id: number) => {
        if (selectedCards.includes(id)) {
            setSelectedCards(selectedCards.filter(cardId => cardId !== id));
        } else {
            if (selectedCards.length < 3) {
                setSelectedCards([...selectedCards, id]);
            }
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-[#F7F6F3]">
            <View className="flex-1 px-6 my-8">
                {/* Skip */}
                <Link href="/" asChild>
                    <Pressable className="flex flex-row justify-end mb-4">
                        <Text className="text-gray-500 font-InterMedium">Skip</Text>
                    </Pressable>
                </Link>

                {/* Progress bar */}
                <ProgressBar progress={1} total={5} />
                {/* Top section */}
                <View className="flex items-center justify-center mt-10">
                    <Text className="mt-3 text-2xl font-InterBold text-[#1A1A1A] tracking-wider">
                        What styles feel like you?
                    </Text>
                    <Text className="mt-2 text-lg font-InterMedium text-gray-700 text-center">
                        Tap 2–3 outfits you’d wear
                    </Text>
                </View>

                {/* Grid of outfits */}
                <Grid className="gap-3 mt-8" _extra={{ className: 'grid-cols-2' }}>
                    {placeholder.map((item) => (
                        <GridItem
                            key={item.id}
                            className="w-full h-48 bg-gray-300 rounded-lg overflow-hidden"
                            _extra={{ className: "" }}
                            style={{
                                borderWidth: selectedCards.includes(item.id) ? 3 : 0,
                                borderColor: selectedCards.includes(item.id) ? '#660033' : 'transparent',
                                
                            }}
                        >
                            <TouchableOpacity
                                className="w-full h-full relative"
                                onPress={() => handleSelectCard(item.id)}
                                activeOpacity={0.8}
                            >
                                {/* Check mark */}
                                {selectedCards.includes(item.id) && (
                                    <View className="absolute top-2 right-2 z-10 shadow-lg">
                                        <FontAwesome name="check-circle" size={20} color="#660033" />
                                    </View>
                                )}
                                <Image
                                    source={{ uri: item.image_url }}
                                    style={{ width: '100%', height: '100%' }}
                                    contentFit="cover"
                                    alt="Outfit Image"
                                />
                            </TouchableOpacity>
                        </GridItem>
                    ))}
                </Grid>

                {/* Continue */}
                <View className="mt-6 mb-4">
                    <Link href="/(onboarding)/color-preference" asChild>
                        <TouchableOpacity
                            className={`rounded-3xl py-3 px-4 items-center ${selectedCards.length >= 2 ? 'bg-primary-700' : 'bg-gray-400'}`}
                            disabled={selectedCards.length < 2}
                        >
                            <Text className="text-white font-InterMedium text-base tracking-wide">
                                Continue
                            </Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
        </SafeAreaView>
    );
}