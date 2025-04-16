import { Metadata } from "next";
import AdminNav from "@/components/AdminNav";

export const metadata: Metadata = {
  title: "Admin Dashboard - Access Monitor",
  description: "Admin dashboard for the Access Monitor application",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex min-h-screen'>
      <aside className='w-64 border-r'>
        <AdminNav />
      </aside>
      <main className='flex-1 p-8'>{children}</main>
    </div>
  );
}
