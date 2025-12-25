import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import Link from "next/link";

import { ExpenseTrackerLogo } from "@/components/logo";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-6">
          <div className="transform hover:scale-110 transition-transform duration-300">
            <ExpenseTrackerLogo />
          </div>
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
          ExpenseTracker
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Quản lý chi tiêu cá nhân thông minh, hiệu quả và dễ dàng
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-4xl w-full mt-8">
        <Card className="border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
          <CardBody className="text-center p-6">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold mb-2 text-sky-600">
              Quản lý ví
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Theo dõi nhiều ví và tài khoản một cách dễ dàng
            </p>
          </CardBody>
        </Card>

        <Card className="border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
          <CardBody className="text-center p-6">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2 text-blue-600">
              Phân tích chi tiết
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Biểu đồ và báo cáo chi tiêu trực quan
            </p>
          </CardBody>
        </Card>

        <Card className="border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
          <CardBody className="text-center p-6">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2 text-sky-600">
              Ngân sách thông minh
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Thiết lập và theo dõi ngân sách hiệu quả
            </p>
          </CardBody>
        </Card>
      </div>

      <div className="flex gap-4 mt-8">
        <Link href="/auth/register">
          <Button
            className="bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all px-8"
            size="lg"
          >
            Bắt đầu miễn phí
          </Button>
        </Link>
        <Link href="/auth/signin">
          <Button
            className="border-2 border-sky-500 text-sky-600 font-semibold hover:bg-sky-50 dark:hover:bg-sky-950 transition-all px-8"
            size="lg"
            variant="bordered"
          >
            Đăng nhập
          </Button>
        </Link>
      </div>
    </div>
  );
}
