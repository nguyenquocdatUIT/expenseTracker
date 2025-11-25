"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Progress } from "@heroui/progress";
import { Switch } from "@heroui/switch";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, addMonths } from "date-fns";

const budgetSchema = z.object({
  name: z.string().min(1, "Tên ngân sách là bắt buộc"),
  amount: z.number().positive("Số tiền phải lớn hơn 0"),
  period: z.enum([
    "DAILY",
    "WEEKLY",
    "MONTHLY",
    "QUARTERLY",
    "YEARLY",
    "CUSTOM",
  ]),
  startDate: z.string(),
  endDate: z.string().optional(),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  alertEnabled: z.boolean(),
  alertAt: z.number().min(0).max(100),
  isRecurring: z.boolean(),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const [filter, setFilter] = useState<"all" | "active">("active");

  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      period: "MONTHLY",
      startDate: format(new Date(), "yyyy-MM-dd"),
      alertEnabled: true,
      alertAt: 80,
      isRecurring: true,
    },
  });

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
  }, [filter]);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      // TODO: Kết nối API thật sau
      await new Promise((resolve) => setTimeout(resolve, 300));

      const dummyBudgets = [
        {
          id: "1",
          name: "Ngân sách ăn uống",
          amount: 5000000,
          spent: 3500000,
          period: "MONTHLY",
          startDate: new Date(),
          category: { name: "Ăn uống", icon: "🍕" },
          alertEnabled: true,
          alertAt: 80,
          isRecurring: true,
          progress: 70,
          isOverBudget: false,
          shouldAlert: false,
          remaining: 1500000,
        },
        {
          id: "2",
          name: "Ngân sách di chuyển",
          amount: 3000000,
          spent: 2700000,
          period: "MONTHLY",
          startDate: new Date(),
          category: { name: "Di chuyển", icon: "🚗" },
          alertEnabled: true,
          alertAt: 80,
          isRecurring: true,
          progress: 90,
          isOverBudget: false,
          shouldAlert: true,
          remaining: 300000,
        },
      ];

      setBudgets(dummyBudgets);
    } catch (error) {
      console.error("Error fetching budgets:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // TODO: Kết nối API thật sau
      await new Promise((resolve) => setTimeout(resolve, 100));

      const dummyCategories = [
        { id: "1", name: "Ăn uống", type: "EXPENSE", icon: "🍕" },
        { id: "2", name: "Di chuyển", type: "EXPENSE", icon: "🚗" },
        { id: "3", name: "Mua sắm", type: "EXPENSE", icon: "🛍️" },
      ];

      setCategories(dummyCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const onSubmit = async (data: BudgetFormData) => {
    try {
      // TODO: Kết nối API thật sau
      await new Promise((resolve) => setTimeout(resolve, 300));

      onClose();
      reset();
      setEditingBudget(null);
      fetchBudgets();
    } catch (error) {
      console.error("Error saving budget:", error);
    }
  };

  const handleEdit = (budget: any) => {
    setEditingBudget(budget);
    reset({
      name: budget.name,
      amount: budget.amount,
      period: budget.period,
      startDate: format(new Date(budget.startDate), "yyyy-MM-dd"),
      endDate: budget.endDate
        ? format(new Date(budget.endDate), "yyyy-MM-dd")
        : "",
      categoryId: budget.categoryId,
      alertEnabled: budget.alertEnabled,
      alertAt: budget.alertAt,
      isRecurring: budget.isRecurring,
    });
    onOpen();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa ngân sách này?")) return;

    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchBudgets();
      }
    } catch (error) {
      console.error("Error deleting budget:", error);
    }
  };

  const handleAddNew = () => {
    setEditingBudget(null);
    const now = new Date();
    reset({
      period: "MONTHLY",
      startDate: format(now, "yyyy-MM-dd"),
      endDate: format(addMonths(now, 1), "yyyy-MM-dd"),
      alertEnabled: true,
      alertAt: 80,
      isRecurring: true,
    });
    onOpen();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getProgressColor = (progress: number, isOverBudget: boolean) => {
    if (isOverBudget) return "danger";
    if (progress >= 80) return "warning";
    if (progress >= 50) return "primary";
    return "success";
  };

  const getPeriodLabel = (period: string) => {
    const labels: any = {
      DAILY: "Hàng ngày",
      WEEKLY: "Hàng tuần",
      MONTHLY: "Hàng tháng",
      QUARTERLY: "Hàng quý",
      YEARLY: "Hàng năm",
      CUSTOM: "Tùy chỉnh",
    };
    return labels[period] || period;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Ngân sách</h1>
          <p className="text-default-500">Theo dõi và kiểm soát chi tiêu</p>
        </div>
        <Button
          color="primary"
          onPress={handleAddNew}
          startContent={<span>➕</span>}
        >
          Tạo ngân sách
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === "active" ? "solid" : "flat"}
          color="primary"
          onPress={() => setFilter("active")}
        >
          Đang hoạt động
        </Button>
        <Button
          variant={filter === "all" ? "solid" : "flat"}
          color="primary"
          onPress={() => setFilter("all")}
        >
          Tất cả
        </Button>
      </div>

      {/* Budgets Grid */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      ) : budgets.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <p className="text-lg text-default-400">Chưa có ngân sách nào</p>
            <Button color="primary" onPress={handleAddNew} className="mt-4">
              Tạo ngân sách đầu tiên
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => (
            <Card
              key={budget.id}
              className={budget.shouldAlert ? "border-2 border-warning" : ""}
            >
              <CardHeader className="flex justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{budget.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Chip size="sm" variant="flat">
                      {budget.category?.icon} {budget.category?.name}
                    </Chip>
                    <Chip size="sm" variant="flat" color="primary">
                      {getPeriodLabel(budget.period)}
                    </Chip>
                  </div>
                </div>
                {budget.shouldAlert && (
                  <Chip color="warning" size="sm">
                    ⚠️
                  </Chip>
                )}
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {/* Amount Info */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-default-500">Đã chi</span>
                      <span className="font-semibold">
                        {formatCurrency(budget.spent)} /{" "}
                        {formatCurrency(budget.amount)}
                      </span>
                    </div>
                    <Progress
                      value={Math.min(budget.progress, 100)}
                      color={getProgressColor(
                        budget.progress,
                        budget.isOverBudget
                      )}
                      size="lg"
                      showValueLabel
                    />
                  </div>

                  {/* Remaining */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-default-500">Còn lại</span>
                    <span
                      className={`font-semibold ${budget.remaining < 0 ? "text-danger" : "text-success"}`}
                    >
                      {formatCurrency(budget.remaining)}
                    </span>
                  </div>

                  {/* Date Range */}
                  <div className="text-xs text-default-400">
                    {format(new Date(budget.startDate), "dd/MM/yyyy")}
                    {budget.endDate &&
                      ` - ${format(new Date(budget.endDate), "dd/MM/yyyy")}`}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="flat"
                      color="primary"
                      onPress={() => handleEdit(budget)}
                      className="flex-1"
                    >
                      Sửa
                    </Button>
                    <Button
                      size="sm"
                      variant="flat"
                      color="danger"
                      onPress={() => handleDelete(budget.id)}
                      className="flex-1"
                    >
                      Xóa
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader>
              {editingBudget ? "Chỉnh sửa ngân sách" : "Tạo ngân sách mới"}
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Input
                  label="Tên ngân sách"
                  {...register("name")}
                  placeholder="VD: Ngân sách ăn uống tháng 11"
                  isInvalid={!!errors.name}
                  errorMessage={errors.name?.message}
                />

                <Input
                  label="Số tiền"
                  type="number"
                  {...register("amount", { valueAsNumber: true })}
                  isInvalid={!!errors.amount}
                  errorMessage={errors.amount?.message}
                />

                <Select
                  label="Chu kỳ"
                  {...register("period")}
                  selectedKeys={[watch("period")]}
                  onChange={(e) => setValue("period", e.target.value as any)}
                  isInvalid={!!errors.period}
                  errorMessage={errors.period?.message}
                >
                  <SelectItem key="DAILY" value="DAILY">
                    Hàng ngày
                  </SelectItem>
                  <SelectItem key="WEEKLY" value="WEEKLY">
                    Hàng tuần
                  </SelectItem>
                  <SelectItem key="MONTHLY" value="MONTHLY">
                    Hàng tháng
                  </SelectItem>
                  <SelectItem key="QUARTERLY" value="QUARTERLY">
                    Hàng quý
                  </SelectItem>
                  <SelectItem key="YEARLY" value="YEARLY">
                    Hàng năm
                  </SelectItem>
                  <SelectItem key="CUSTOM" value="CUSTOM">
                    Tùy chỉnh
                  </SelectItem>
                </Select>

                <Select
                  label="Danh mục"
                  {...register("categoryId")}
                  selectedKeys={
                    watch("categoryId") ? [watch("categoryId")] : []
                  }
                  onChange={(e) => setValue("categoryId", e.target.value)}
                  isInvalid={!!errors.categoryId}
                  errorMessage={errors.categoryId?.message}
                >
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </Select>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Ngày bắt đầu"
                    type="date"
                    {...register("startDate")}
                    isInvalid={!!errors.startDate}
                    errorMessage={errors.startDate?.message}
                  />

                  <Input
                    label="Ngày kết thúc (tùy chọn)"
                    type="date"
                    {...register("endDate")}
                  />
                </div>

                <Input
                  label="Cảnh báo khi đạt (%)"
                  type="number"
                  {...register("alertAt", { valueAsNumber: true })}
                  description="Nhận cảnh báo khi chi tiêu đạt phần trăm này"
                  isInvalid={!!errors.alertAt}
                  errorMessage={errors.alertAt?.message}
                />

                <div className="flex flex-col gap-3">
                  <Switch
                    {...register("alertEnabled")}
                    isSelected={watch("alertEnabled")}
                    onValueChange={(value) => setValue("alertEnabled", value)}
                  >
                    Bật cảnh báo
                  </Switch>

                  <Switch
                    {...register("isRecurring")}
                    isSelected={watch("isRecurring")}
                    onValueChange={(value) => setValue("isRecurring", value)}
                  >
                    Tự động làm mới theo chu kỳ
                  </Switch>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Hủy
              </Button>
              <Button color="primary" type="submit">
                {editingBudget ? "Cập nhật" : "Tạo"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
