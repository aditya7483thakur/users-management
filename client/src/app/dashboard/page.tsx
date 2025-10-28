import AddThemeButton from "@/components/AddThemeButton";
import ThemeBoxes from "@/components/ThemeBoxes";

export default function DashboardHome() {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Home</h2>
        <AddThemeButton />
      </div>
      <ThemeBoxes />
    </section>
  );
}
