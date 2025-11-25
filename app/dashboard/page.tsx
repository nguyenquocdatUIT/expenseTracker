"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";
import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsData {
  summary: {
    income: number;
    expense: number;
    balance: number;
    totalBalance: number;
  };
  expensesByCategory: Array<{
    category: string;
    amount: number;
    color?: string;
    icon?: string;
  }>;
  topCategories: Array<{
    category: string;
    amount: number;
    count: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    income: number;
    expense: number;
    balance: number;
  }>;
  wallets: Array<{
    name: string;
    type: string;
    balance: number;
  }>;
}

const COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#95E1D3",
  "#F38181",
  "#AA96DA",
  "#FCBAD3",
  "#A8E6CF",
  "#FFD3B6",
];

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // TODO: Kết nối API thật sau
      // const response = await fetch(`/api/analytics?period=${period}`);
      // const data = await response.json();

      // Dummy data tạm thời
      await new Promise((resolve) => setTimeout(resolve, 500));
      const data: AnalyticsData = {
        summary: {
          income: 50000000,
          expense: 35000000,
          balance: 15000000,
          totalBalance: 75000000,
        },
        expensesByCategory: [
          { category: "Ăn uống", amount: 12000000, icon: "🍕" },
          { category: "Di chuyển", amount: 8000000, icon: "🚗" },
          { category: "Mua sắm", amount: 7000000, icon: "🛍️" },
          { category: "Giải trí", amount: 5000000, icon: "🎮" },
          { category: "Khác", amount: 3000000, icon: "📦" },
        ],
        topCategories: [
          { category: "Ăn uống", amount: 12000000, count: 45 },
          { category: "Di chuyển", amount: 8000000, count: 30 },
          { category: "Mua sắm", amount: 7000000, count: 15 },
        ],
        monthlyTrend: [
          {
            month: "T7",
            income: 45000000,
            expense: 30000000,
            balance: 15000000,
          },
          {
            month: "T8",
            income: 48000000,
            expense: 32000000,
            balance: 16000000,
          },
          {
            month: "T9",
            income: 47000000,
            expense: 31000000,
            balance: 16000000,
          },
          {
            month: "T10",
            income: 49000000,
            expense: 33000000,
            balance: 16000000,
          },
          {
            month: "T11",
            income: 50000000,
            expense: 35000000,
            balance: 15000000,
          },
        ],
        wallets: [
          { name: "Ví tiền mặt", type: "CASH", balance: 5000000 },
          { name: "Ngân hàng", type: "BANK_ACCOUNT", balance: 70000000 },
        ],
      };

      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Không thể tải dữ liệu</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-default-500">Tổng quan tài chính của bạn</p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={period === "month" ? "solid" : "flat"}
            color="primary"
            onClick={() => setPeriod("month")}
          >
            Tháng này
          </Button>
          <Button
            size="sm"
            variant={period === "year" ? "solid" : "flat"}
            color="primary"
            onClick={() => setPeriod("year")}
          >
            Năm này
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500">Thu nhập</p>
                <p className="text-2xl font-bold text-success">
                  {formatCurrency(analytics.summary.income)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success-50">
                <span className="text-2xl">📈</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500">Chi tiêu</p>
                <p className="text-2xl font-bold text-danger">
                  {formatCurrency(analytics.summary.expense)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-50">
                <span className="text-2xl">📉</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500">Số dư</p>
                <p
                  className={`text-2xl font-bold ${analytics.summary.balance >= 0 ? "text-success" : "text-danger"}`}
                >
                  {formatCurrency(analytics.summary.balance)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500">Tổng tài sản</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(analytics.summary.totalBalance)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning-50">
                <span className="text-2xl">👛</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Chi tiêu theo danh mục</h3>
          </CardHeader>
          <CardBody>
            {analytics.expensesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.expensesByCategory}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {analytics.expensesByCategory.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-default-400">
                Chưa có dữ liệu chi tiêu
              </div>
            )}
          </CardBody>
        </Card>

        {/* Line Chart */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Xu hướng 6 tháng</h3>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#17C964"
                  name="Thu nhập"
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="#F31260"
                  name="Chi tiêu"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Top Categories and Wallets */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Top chi tiêu</h3>
            <Link href="/dashboard/analytics">
              <Button size="sm" variant="light" color="primary">
                Xem chi tiết →
              </Button>
            </Link>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {analytics.topCategories.slice(0, 5).map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Chip
                      size="sm"
                      variant="flat"
                      color={
                        index === 0
                          ? "danger"
                          : index === 1
                            ? "warning"
                            : "default"
                      }
                    >
                      #{index + 1}
                    </Chip>
                    <span className="font-medium">{category.category}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(category.amount)}
                    </p>
                    <p className="text-xs text-default-400">
                      {category.count} giao dịch
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Ví của bạn</h3>
            <Link href="/dashboard/wallets">
              <Button size="sm" variant="light" color="primary">
                Quản lý →
              </Button>
            </Link>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {analytics.wallets.map((wallet, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{wallet.name}</p>
                    <p className="text-sm text-default-400">{wallet.type}</p>
                  </div>
                  <p className="font-semibold">
                    {formatCurrency(wallet.balance)}
                  </p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Thao tác nhanh</h3>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/transactions?action=add">
              <Button color="primary" startContent={<span>➕</span>}>
                Thêm giao dịch
              </Button>
            </Link>
            <Link href="/dashboard/budgets?action=add">
              <Button color="secondary" startContent={<span>💰</span>}>
                Tạo ngân sách
              </Button>
            </Link>
            <Link href="/dashboard/recurring?action=add">
              <Button color="success" startContent={<span>🔄</span>}>
                Giao dịch định kỳ
              </Button>
            </Link>
            <Button
              color="warning"
              startContent={<span>📊</span>}
              onClick={() =>
                window.open("/api/export/transactions?format=csv", "_blank")
              }
            >
              Xuất báo cáo
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
