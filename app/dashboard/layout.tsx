"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@heroui/button";
import { Avatar } from "@heroui/avatar";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Divider } from "@heroui/divider";
import { ExpenseTrackerLogo } from "@/components/logo";
import { useAuth } from "@/contexts/AuthContext";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: "📊" },
  { name: "Giao dịch", href: "/dashboard/transactions", icon: "💳" },
  { name: "Ngân sách", href: "/dashboard/budgets", icon: "💰" },
  { name: "Giao dịch định kỳ", href: "/dashboard/recurring", icon: "🔄" },
  // { name: "Phân tích", href: "/dashboard/analytics", icon: "📈" },
  { name: "Ví", href: "/dashboard/wallets", icon: "👛" },
  { name: "Danh mục", href: "/dashboard/categories", icon: "📁" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { logout } = useAuth();

  // TODO: Kết nối API thật sau
  const dummyUser = {
    name: "Nguyễn Văn A",
    email: "user@example.com",
  };

  const handleSignOut = () => {
    logout();
  };

  return (
    <div className="fixed inset-0 flex bg-default-50 overflow-hidden z-50">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r border-divider bg-background md:block flex-shrink-0">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <Link href="/" className="flex h-16 items-center px-6">
            <ExpenseTrackerLogo />
            {/* <h1 className="text-xl font-bold text-primary">Expense Tracker</h1> */}
          </Link>

          <Divider />

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-default-600 hover:bg-default-100 hover:text-default-900"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <Divider />

          {/* User Menu */}
          <div className="p-4">
            <Dropdown placement="top">
              <DropdownTrigger>
                <Button
                  variant="flat"
                  className="w-full justify-start gap-3"
                  startContent={<Avatar size="sm" name={dummyUser.name} />}
                >
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">
                      {dummyUser.name}
                    </span>
                    <span className="text-xs text-default-400">
                      {dummyUser.email}
                    </span>
                  </div>
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="User menu">
                <DropdownItem key="profile" href="/dashboard/profile">
                  👤 Hồ sơ
                </DropdownItem>
                <DropdownItem key="settings" href="/dashboard/settings">
                  ⚙️ Cài đặt
                </DropdownItem>
                <DropdownItem
                  key="logout"
                  color="danger"
                  onClick={handleSignOut}
                >
                  🚪 Đăng xuất
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between border-b border-divider bg-background px-4 md:hidden">
          <Link href="/">
            <ExpenseTrackerLogo />
          </Link>

          <Dropdown>
            <DropdownTrigger>
              <Avatar as="button" size="sm" name={dummyUser.name} />
            </DropdownTrigger>
            <DropdownMenu aria-label="User menu mobile">
              <>
                {navigation.map((item) => (
                  <DropdownItem key={item.href} href={item.href}>
                    {item.icon} {item.name}
                  </DropdownItem>
                ))}
                <DropdownItem key="divider" isReadOnly>
                  <Divider />
                </DropdownItem>
                <DropdownItem key="profile" href="/dashboard/profile">
                  👤 Hồ sơ
                </DropdownItem>
                <DropdownItem
                  key="logout"
                  color="danger"
                  onClick={handleSignOut}
                >
                  🚪 Đăng xuất
                </DropdownItem>
              </>
            </DropdownMenu>
          </Dropdown>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
