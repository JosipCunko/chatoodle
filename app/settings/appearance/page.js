import Appearance from "@/app/_components/Appearance";

export default function AppearancePage() {
  return (
    <div className="flex-1 bg-background">
      <div className="max-w-4xl mx-auto p-8">
        <div className="grid grid-cols-[1fr]">
          {/* Settings Content */}
          <div className="bg-surface p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-6">Appearance</h2>
            <Appearance />
          </div>
        </div>
      </div>
    </div>
  );
}
