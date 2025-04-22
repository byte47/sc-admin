import { Metadata } from "next";
import DashboardTables from "./admin/DashboardTables";

export const metadata: Metadata = {
  title: "Admin Dashboard - Access Monitor",
  description: "Admin dashboard for the Access Monitor application",
};

export default function AdminDashboard() {
  return <DashboardTables />;
}
