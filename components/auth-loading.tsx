"use client";

import { Spinner } from "@heroui/spinner";

export default function AuthLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-white via-sky-50 to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" color="primary" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Đang kiểm tra phiên đăng nhập...
        </p>
      </div>
    </div>
  );
}
