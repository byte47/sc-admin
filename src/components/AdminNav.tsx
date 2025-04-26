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
  { href: "/admin/history", label: "History", icon: History },
  { href: "/admin/logs", label: "Request Body", icon: FileText },
];

const listSubLinks = [
  { href: "/admin/lists/blocked-names", label: "Blocked Names" },
  { href: "/admin/lists/blocked-slugs", label: "Blocked Slugs" },
  { href: "/admin/lists/allowed-names", label: "Allowed Names" },
  { href: "/admin/lists/allowed-slugs", label: "Allowed Slugs" },
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
            const isActive =
              pathname === link.href ||
              (link.href === "/admin/lists" &&
                pathname.startsWith("/admin/lists"));
            if (link.href === "/admin/lists") {
              return (
                <div key={link.href}>
                  <Link
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
                  {/* Submenu */}
                  {pathname.startsWith("/admin/lists") && (
                    <div className='ml-7 mt-1 space-y-1'>
                      {listSubLinks.map((sublink) => (
                        <Link
                          key={sublink.href}
                          href={sublink.href}
                          className={`block px-2 py-1 rounded text-xs font-normal transition-colors ${
                            pathname === sublink.href
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                          }`}
                          onClick={() => setOpen(false)}
                        >
                          {sublink.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
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
