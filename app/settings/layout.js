import SettingsSidebar from "@/app/_components/SettingsSidebar";

export default function SettingsLayout({ children }) {
  return (
    <>
      <SettingsSidebar />
      {children}
    </>
  );
}
