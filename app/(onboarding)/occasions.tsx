import ProgressBar from "@/components/custom/progress-bar";
import { router, Link } from "expo-router";
import { Pressable, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ocassionsPlaceholder = [
    {
        name: 'Work',
        icon: <Text className="text-2xl mr-2">💼</Text>,
    },
    {
        name: 'Everyday',
        icon: <Text className="text-2xl mr-2">👕</Text>,
    },
    {
        name: 'Events',
        icon: <Text className="text-2xl mr-2">🤵</Text>,
    },
    {
        name: 'Fitness',
        icon: <Text className="text-2xl mr-2">🏃‍♂️</Text>,
    },
    {
        name: 'Nights out',
        icon: <Text className="text-2xl mr-2">🎉</Text>,
    },
]

type Occasion = {
    name: string;
    icon: React.ReactNode;
}

function OccasionCard({ occasion }: { occasion: Occasion }) {
    return (
        <Pressable className="bg-white rounded-lg p-4 items-center flex-row shadow-md h-14 border-[#E5E3DF] border">  
            {occasion.icon}
            <Text className="text-center font-InterMedium ml-2">{occasion.name}</Text>
        </Pressable>
    );
}


export default function OccassionsScreen() {
    return (
        <SafeAreaView className="flex-1 bg-[#F7F6F3]">
            <View className="flex-1 px-6 my-8">
                <View className="flex flex-row justify-between items-center mb-4">
                    {/* Back */}
                    <Pressable onPress={() => router.back()} className="">
                        <Text className="text-gray-500 font-InterMedium">Back</Text>
                    </Pressable>

                    {/* Skip */}
                    <Link href="/" asChild>
                        <Pressable className="">
                            <Text className="text-gray-500 font-InterMedium">Skip</Text>
                        </Pressable>
                    </Link>
                </View>

                {/* Progress bar */}
                <ProgressBar progress={3} total={5} />

                {/* Top section */}
                <View className="flex items-center justify-center mt-10">
                    <Text className="text-2xl font-InterSemiBold text-center">
                        When do you usually get dressed?
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}