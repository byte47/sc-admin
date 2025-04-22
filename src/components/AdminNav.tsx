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
  Menu,
} from "lucide-react";
import { useState } from "react";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/stats", label: "Stats", icon: BarChart },
  { href: "/admin/lists", label: "Manage Lists", icon: List },
  { href: "/admin/verification", label: "Verification", icon: ClipboardCheck },
  { href: "/admin/messages", label: "Messages", icon: MessagesSquare },
  { href: "/admin/logs", label: "API Logs", icon: FileText },
  { href: "/admin/history", label: "History", icon: History },
];

export default function AdminNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className='relative'>
      {/* Mobile Hamburger */}
      <button
        className='md:hidden flex items-center px-3 py-2 mb-2'
        onClick={() => setOpen((v) => !v)}
        aria-label='Open navigation menu'
      >
        <Menu className='h-6 w-6' />
      </button>
      {/* Links - hidden on mobile unless open */}
      <div
        className={`${
          open ? "block" : "hidden"
        } md:block bg-white md:bg-transparent absolute md:static left-0 top-10 w-full md:w-auto z-20 shadow md:shadow-none border md:border-none rounded md:rounded-none`}
      >
        <div className='px-4 py-6 space-y-1 md:space-y-1'>
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
                onClick={() => setOpen(false)}
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
              onClick={() => setOpen(false)}
            >
              <Home className='mr-2 h-4 w-4' />
              Main Site
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
