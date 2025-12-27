"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
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
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subMonths,
  startOfDay,
  endOfDay,
} from "date-fns";

import {
  useGetSpendingByCategoryV1AnalyticsSpendingByCategoryGet,
  useGetSpendingTrendV1AnalyticsSpendingTrendGet,
  useGetTopCategoriesV1AnalyticsTopCategoriesGet,
  useGetWalletsV1WalletsGet,
  useGetCategoriesV1CategoriesGet,
  exportTransactionsCsvV1ReportsTransactionsCsvGet,
  exportTransactionsPdfV1ReportsTransactionsPdfGet,
} from "@/lib/api";

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
  "#EB5757", // Ăn uống - Soft Red
  "#27AE60", // Di chuyển - Jungle Green
  "#F2994A", // Mua sắm - SelFin Orange
  "#9B51E0", // Giải trí - Amethyst
  "#2D9CDB", // Khác - Ocean Blue
];

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"month" | "year" | "custom">("month");
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  // compute date range for API calls based on `period`
  const getDateRange = () => {
    const now = new Date();

    if (period === "custom" && customDateFrom && customDateTo) {
      return {
        date_from: format(
          startOfDay(new Date(customDateFrom)),
          "yyyy-MM-dd'T'HH:mm:ss"
        ),
        date_to: format(
          endOfDay(new Date(customDateTo)),
          "yyyy-MM-dd'T'HH:mm:ss"
        ),
      };
    }

    if (period === "month") {
      return {
        date_from: format(
          startOfDay(startOfMonth(now)),
          "yyyy-MM-dd'T'HH:mm:ss"
        ),
        date_to: format(endOfDay(endOfMonth(now)), "yyyy-MM-dd'T'HH:mm:ss"),
      };
    }

    return {
      date_from: format(startOfDay(startOfYear(now)), "yyyy-MM-dd'T'HH:mm:ss"),
      date_to: format(endOfDay(endOfYear(now)), "yyyy-MM-dd'T'HH:mm:ss"),
    };
  };

  // Hooks for analytics
  const { date_from, date_to } = getDateRange();

  const { data: spendingByCategory } =
    useGetSpendingByCategoryV1AnalyticsSpendingByCategoryGet({
      date_from,
      date_to,
    });

  console.log("spendingByCategory:", spendingByCategory);
  const trendFrom = format(
    startOfDay(subMonths(new Date(), 5)),
    "yyyy-MM-dd'T'HH:mm:ss"
  );
  const trendTo = format(endOfDay(new Date()), "yyyy-MM-dd'T'HH:mm:ss");
  const { data: spendingTrend } =
    useGetSpendingTrendV1AnalyticsSpendingTrendGet({
      date_from: trendFrom,
      date_to: trendTo,
      group_by: "month",
    });
  const { data: topCategories } =
    useGetTopCategoriesV1AnalyticsTopCategoriesGet({
      date_from,
      date_to,
      limit: 5,
    });
  const { data: wallets } = useGetWalletsV1WalletsGet();
  const { data: categories } = useGetCategoriesV1CategoriesGet();

  useEffect(() => {
    setLoading(
      !spendingByCategory || !spendingTrend || !topCategories || !wallets
    );
    if (spendingByCategory && spendingTrend && topCategories && wallets) {
      // Calculate total income and expense from spending trend
      const totalIncome = (spendingTrend || []).reduce(
        (s: number, t: any) => s + (t.total_income || 0),
        0
      );
      const totalExpense = (spendingTrend || []).reduce(
        (s: number, t: any) => s + (t.total_expense || 0),
        0
      );

      // Map API responses to AnalyticsData
      const summary = {
        income: totalIncome,
        expense: totalExpense,
        balance: (wallets || []).reduce(
          (s: number, w: any) => s + (w.balance || 0),
          0
        ),
        totalBalance: (wallets || []).reduce(
          (s: number, w: any) => s + (w.balance || 0),
          0
        ),
      };

      const expensesByCategory = (spendingByCategory || [])
        .filter((c: any) => {
          // Filter by category if selected
          if (selectedCategoryId) {
            const categoryName = c.category_name || c.category || c.name;
            const selectedCategory = (categories || []).find(
              (cat: any) => String(cat.id) === selectedCategoryId
            );
            return categoryName === selectedCategory?.name;
          }
          return true;
        })
        .map((c: any) => ({
          category: c.category_name || c.category || c.name,
          amount: Number(c.total_amount ?? c.amount ?? 0),
          color: c.color,
          icon: c.icon,
        })) as AnalyticsData["expensesByCategory"];

      const topCats = (topCategories || []).map((t: any) => ({
        category: t.category_name || t.category,
        amount: t.total_amount || t.amount,
        count: t.transaction_count || t.count || 0,
      }));

      const monthlyTrend = (spendingTrend || []).map((t: any) => ({
        month: t.period || t.label || t.month || t.date,
        income: t.total_income || 0,
        expense: t.total_expense || 0,
        balance: (t.total_income || 0) - (t.total_expense || 0),
      }));

      const mappedWallets = (wallets || []).map((w: any) => ({
        name: w.name,
        type: w.currency || "UNKNOWN",
        balance: w.balance,
      }));

      const totalBalance = mappedWallets.reduce(
        (s: number, w: any) => s + (w.balance || 0),
        0
      );

      summary.balance = totalBalance;
      summary.totalBalance = totalBalance;

      setAnalytics({
        summary,
        expensesByCategory,
        topCategories: topCats,
        monthlyTrend,
        wallets: mappedWallets,
      });
    }
  }, [
    spendingByCategory,
    spendingTrend,
    topCategories,
    wallets,
    period,
    selectedCategoryId,
    customDateFrom,
    customDateTo,
    categories,
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
            Tổng quan tài chính
          </h1>
          <p className="text-gray-500">
            Theo dõi thu nhập, chi tiêu và số dư của bạn bên dưới
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-gray-200 dark:border-gray-700">
        <CardBody>
          <div className="flex flex-col gap-4">
            {/* Period Buttons */}
            <div className="flex gap-2 flex-wrap">
              <Button
                className={
                  period === "month"
                    ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold"
                    : "text-sky-600 hover:bg-sky-50"
                }
                size="sm"
                variant={period === "month" ? "solid" : "flat"}
                onClick={() => setPeriod("month")}
              >
                Tháng này
              </Button>
              <Button
                className={
                  period === "year"
                    ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold"
                    : "text-sky-600 hover:bg-sky-50"
                }
                size="sm"
                variant={period === "year" ? "solid" : "flat"}
                onClick={() => setPeriod("year")}
              >
                Năm này
              </Button>
              <Button
                className={
                  period === "custom"
                    ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold"
                    : "text-sky-600 hover:bg-sky-50"
                }
                size="sm"
                variant={period === "custom" ? "solid" : "flat"}
                onClick={() => setPeriod("custom")}
              >
                Tùy chỉnh
              </Button>
            </div>

            {/* Custom Date Range & Category Filter */}
            <div className="flex flex-row gap-3 flex-wrap items-end">
              {period === "custom" && (
                <>
                  <Input
                    label="Từ ngày"
                    type="date"
                    value={customDateFrom}
                    onChange={(e) => setCustomDateFrom(e.target.value)}
                    className="flex-1 min-w-[150px]"
                  />
                  <Input
                    label="Đến ngày"
                    type="date"
                    value={customDateTo}
                    onChange={(e) => setCustomDateTo(e.target.value)}
                    className="flex-1 min-w-[150px]"
                  />
                </>
              )}
              <Select
                label="Danh mục"
                placeholder="Tất cả danh mục"
                selectedKeys={
                  selectedCategoryId
                    ? new Set([selectedCategoryId])
                    : new Set([])
                }
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0];
                  setSelectedCategoryId(selectedKey ? String(selectedKey) : "");
                }}
                className="flex-1 min-w-[200px]"
                items={[
                  { id: "", name: "Tất cả", icon: "" },
                  ...(categories || []).map((cat: any) => ({
                    id: String(cat.id),
                    name: cat.name,
                    icon: cat.icon || "",
                  })),
                ]}
              >
                {(item: any) => (
                  <SelectItem key={item.id} textValue={item.name}>
                    {item.icon} {item.name}
                  </SelectItem>
                )}
              </Select>
              {(selectedCategoryId ||
                (period === "custom" && customDateFrom && customDateTo)) && (
                <Button
                  variant="flat"
                  color="danger"
                  size="sm"
                  onClick={() => {
                    setSelectedCategoryId("");
                    setCustomDateFrom("");
                    setCustomDateTo("");
                    setPeriod("month");
                  }}
                >
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Thu nhập</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(analytics.summary.income)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <span className="text-2xl">📈</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Chi tiêu</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(analytics.summary.expense)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <span className="text-2xl">📉</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Số dư</p>
                <p
                  className={`text-2xl font-bold ${analytics.summary.balance >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {formatCurrency(analytics.summary.balance)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tổng tài sản</p>
                <p className="text-2xl font-bold text-sky-600">
                  {formatCurrency(analytics.summary.totalBalance)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <span className="text-2xl">👛</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Pie Chart */}
        <Card className="border-gray-200 dark:border-gray-700">
          <CardHeader className="bg-gradient-to-r from-sky-500 to-blue-600 text-white">
            <h3 className="text-lg font-semibold">Chi tiêu theo danh mục</h3>
          </CardHeader>
          <CardBody>
            {analytics.expensesByCategory.length > 0 ? (
              <ResponsiveContainer height={300} width="100%">
                <PieChart>
                  <Pie
                    label={(entry: any) =>
                      `${entry.category}: ${formatCurrency(entry.amount)}`
                    }
                    cx="50%"
                    cy="50%"
                    data={analytics.expensesByCategory}
                    dataKey="amount"
                    nameKey="category"
                    outerRadius={100}
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
              <div className="flex h-[300px] items-center justify-center text-gray-400">
                Chưa có dữ liệu chi tiêu
              </div>
            )}
          </CardBody>
        </Card>

        {/* Line Chart */}
        <Card className="border-gray-200 dark:border-gray-700">
          <CardHeader className="bg-gradient-to-r from-sky-500 to-blue-600 text-white">
            <h3 className="text-lg font-semibold">Xu hướng 6 tháng</h3>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer height={300} width="100%">
              <LineChart
                data={analytics.monthlyTrend}
                margin={{ left: 20, right: 10, top: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis width={80} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Line
                  dataKey="income"
                  name="Thu nhập"
                  stroke="#0ea5e9"
                  type="monotone"
                />
                <Line
                  dataKey="expense"
                  name="Chi tiêu"
                  stroke="#F31260"
                  type="monotone"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Top Categories and Wallets */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-gray-200 dark:border-gray-700">
          <CardHeader className="flex items-center justify-between bg-gradient-to-r from-sky-500 to-blue-600 text-white">
            <h3 className="text-lg font-semibold">Top chi tiêu</h3>
            <Link href="/dashboard/analytics">
              <Button
                className="text-white hover:bg-white/10"
                size="sm"
                variant="light"
              >
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
                      color={
                        index === 0
                          ? "danger"
                          : index === 1
                            ? "warning"
                            : "default"
                      }
                      size="sm"
                      variant="flat"
                    >
                      #{index + 1}
                    </Chip>
                    <span className="font-medium">{category.category}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(category.amount)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {category.count} giao dịch
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card className="border-gray-200 dark:border-gray-700">
          <CardHeader className="flex items-center justify-between bg-gradient-to-r from-sky-500 to-blue-600 text-white">
            <h3 className="text-lg font-semibold">Ví của bạn</h3>
            <Link href="/dashboard/wallets">
              <Button
                className="text-white hover:bg-white/10"
                size="sm"
                variant="light"
              >
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
                    <p className="text-sm text-gray-400">{wallet.type}</p>
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
      <Card className="border-gray-200 dark:border-gray-700">
        <CardHeader className="bg-gradient-to-r from-sky-500 to-blue-600 text-white">
          <h3 className="text-lg font-semibold">Thao tác nhanh</h3>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/transactions?action=add">
              <Button
                className="bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold"
                startContent={<span>➕</span>}
              >
                Thêm giao dịch
              </Button>
            </Link>
            <Link href="/dashboard/budgets?action=add">
              <Button
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold"
                startContent={<span>💰</span>}
              >
                Tạo ngân sách
              </Button>
            </Link>
            <Link href="/dashboard/recurring?action=add">
              <Button
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold"
                startContent={<span>🔄</span>}
              >
                Giao dịch định kỳ
              </Button>
            </Link>
            <Button
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold"
              startContent={<span>📊</span>}
              onClick={async () => {
                try {
                  const response =
                    await exportTransactionsCsvV1ReportsTransactionsCsvGet({
                      date_from: format(
                        startOfMonth(new Date()),
                        "yyyy-MM-dd'T'HH:mm:ss"
                      ),
                      date_to: format(
                        endOfMonth(new Date()),
                        "yyyy-MM-dd'T'HH:mm:ss"
                      ),
                    });

                  // Create blob and download
                  const blob = new Blob([response as any], {
                    type: "text/csv",
                  });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `transactions-${format(new Date(), "yyyy-MM-dd")}.csv`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  window.URL.revokeObjectURL(url);
                } catch (error) {
                  console.error("Export failed:", error);
                  alert("Xuất báo cáo thất bại");
                }
              }}
            >
              Xuất báo cáo CSV
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
