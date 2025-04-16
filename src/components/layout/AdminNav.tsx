import Link from "next/link";
import { cn } from "@/lib/utils";

type NavLinkProps = {
  href: string;
  children: React.ReactNode;
  active?: boolean;
};

function NavLink({ href, children, active }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "block px-4 py-2 text-sm rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors",
        active ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-600"
      )}
    >
      {children}
    </Link>
  );
}

export default function AdminNav({ currentPath }: { currentPath: string }) {
  return (
    <nav className='w-full py-4 mb-6 border-b'>
      <div className='container flex items-center justify-between'>
        <div className='flex space-x-1'>
          <h1 className='text-xl font-bold'>Access Monitor</h1>
        </div>
        <div className='flex space-x-2'>
          <NavLink href='/admin' active={currentPath === "/admin"}>
            Dashboard
          </NavLink>
          <NavLink
            href='/admin/verification'
            active={currentPath.includes("/admin/verification")}
          >
            Verification Queue
          </NavLink>
          <NavLink
            href='/admin/lists'
            active={currentPath.includes("/admin/lists")}
          >
            Manage Lists
          </NavLink>
          <NavLink
            href='/admin/history'
            active={currentPath.includes("/admin/history")}
          >
            History
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
