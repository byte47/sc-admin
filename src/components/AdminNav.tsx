"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  List,
  ClipboardCheck,
  History,
  MessagesSquare,
  FileText,
  BarChart,
  Home,
} from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/stats", label: "Stats", icon: BarChart },
  { href: "/admin/lists", label: "Manage Lists", icon: List },
  { href: "/admin/verification", label: "Verification", icon: ClipboardCheck },
  { href: "/admin/messages", label: "Messages", icon: MessagesSquare },
  { href: "/admin/logs", label: "API Logs", icon: FileText },
  { href: "/admin/history", label: "History", icon: History },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className='px-4 py-6 space-y-1'>
      {links.map((link) => {
        const IconComponent = link.icon;
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
            }`}
          >
            <IconComponent className='mr-2 h-4 w-4' />
            {link.label}
          </Link>
        );
      })}
      <div className='mt-6 pt-4 border-t'>
        <Link
          href='/'
          className='flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:bg-primary/5 hover:text-primary'
        >
          <Home className='mr-2 h-4 w-4' />
          Main Site
        </Link>
      </div>
    </nav>
  );
}
