import { View } from "react-native";



export default function ProgressBar({ progress, total }: { progress: number, total:number }) {
    return (
        <View className="flex flex-row w-full gap-3 items-center">
            {Array.from({ length: total }).map((_, index) => (
                <View
                    key={index}
                    className={`flex-1 h-2 rounded-full ${index < progress ? 'bg-primary-700' : 'bg-gray-300'}`}
                />
            ))}
        </View>
    )
}