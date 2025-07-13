import { MyPositionList } from "@/components/MyPositionList";

export default function MyPositionsPage() {
    return (
        <div className="max-w-4xl mx-auto mt-12">
            <h2 className="text-2xl font-bold mb-6">My Positions</h2>
            <MyPositionList />
        </div>
    );
} 