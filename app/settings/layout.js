import SettingsSidebar from "@/app/_components/SettingsSidebar";

export default async function SettingsLayout({ children }) {
  return (
    <>
      <SettingsSidebar />
      {children}
    </>
  );
}
