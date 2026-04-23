"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileCheck, ChevronLeft } from "lucide-react";
import { ROUTES } from "@/constants";

const NAV_ITEMS = [
  { label: "Dashboard", href: ROUTES.ADMIN, icon: LayoutDashboard },
  { label: "Revendications", href: ROUTES.ADMIN_REVENDICATIONS, icon: FileCheck },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-michelin-black text-white h-14 flex items-center px-4 gap-4">
      <Link href="/" className="flex items-center gap-1 text-sm text-white/60 hover:text-white transition-colors mr-2">
        <ChevronLeft size={16} />
        <span>App</span>
      </Link>
      <span className="text-xs font-semibold tracking-widest uppercase text-michelin-red">
        Admin
      </span>
      <nav className="flex items-center gap-1 ml-auto">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                active
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
