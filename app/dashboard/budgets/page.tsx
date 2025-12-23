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
import {
  useGetBudgetsV1BudgetsGet,
  useCreateBudgetV1BudgetsPost,
  useUpdateBudgetV1BudgetsBudgetIdPatch,
  useDeleteBudgetV1BudgetsBudgetIdDelete,
  useGetCategoriesV1CategoriesGet,
} from "@/lib/api";

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

  // Use generated API hooks
  const {
    data: budgetsData,
    isLoading: budgetsLoading,
    refetch: refetchBudgets,
  } = useGetBudgetsV1BudgetsGet();

  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetCategoriesV1CategoriesGet();

  const { mutate: createBudget, isPending: isCreating } =
    useCreateBudgetV1BudgetsPost();

  const { mutate: updateBudget } = useUpdateBudgetV1BudgetsBudgetIdPatch();

  const { mutate: deleteBudget } = useDeleteBudgetV1BudgetsBudgetIdDelete();

  useEffect(() => {
    setLoading(budgetsLoading || categoriesLoading);
  }, [budgetsLoading, categoriesLoading]);

  const displayBudgets = budgetsData || [];
  const displayCategories = categoriesData || [];
  const [toasts, setToasts] = useState<
    { id: number; type: "success" | "error"; message: string }[]
  >([]);
  const [isSaving, setIsSaving] = useState(false);

  const pushToast = (type: "success" | "error", message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3500);
  };

  const onSubmit = async (data: BudgetFormData) => {
    try {
      // Map form data to API payload
      const payload = {
        category_id: Number(data.categoryId),
        amount_limit: Number(data.amount),
        period_type: data.period as any,
        start_date: data.startDate || undefined,
        end_date: data.endDate || undefined,
      };

      setIsSaving(true);
      if (editingBudget && editingBudget.id) {
        updateBudget(
          { budgetId: Number(editingBudget.id), data: payload },
          {
            onSuccess: () => {
              onClose();
              reset();
              setEditingBudget(null);
              refetchBudgets();
              pushToast("success", "Cập nhật ngân sách thành công");
              setIsSaving(false);
            },
            onError: (err) => {
              console.error("Update budget error:", err);
              pushToast("error", "Cập nhật ngân sách thất bại");
              setIsSaving(false);
            },
          }
        );
      } else {
        createBudget(
          { data: payload },
          {
            onSuccess: () => {
              onClose();
              reset();
              refetchBudgets();
              pushToast("success", "Tạo ngân sách thành công");
              setIsSaving(false);
            },
            onError: (err) => {
              console.error("Create budget error:", err);
              pushToast("error", "Tạo ngân sách thất bại");
              setIsSaving(false);
            },
          }
        );
      }
    } catch (error) {
      console.error("Error saving budget:", error);
    }
  };

  const handleEdit = (budget: any) => {
    setEditingBudget(budget);
    reset({
      name: budget.category?.name || "",
      amount: budget.amount_limit,
      period: budget.period_type,
      startDate: budget.start_date
        ? format(new Date(budget.start_date), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      endDate: budget.end_date
        ? format(new Date(budget.end_date), "yyyy-MM-dd")
        : "",
      categoryId: String(budget.category_id),
      alertEnabled: budget.is_near_limit,
      alertAt: Math.round(budget.usage_percentage || 0),
      isRecurring: true,
    });
    onOpen();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa ngân sách này?")) return;

    deleteBudget(
      { budgetId: Number(id) },
      {
        onSuccess: () => {
          refetchBudgets();
        },
        onError: (err) => console.error("Delete budget error:", err),
      }
    );
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
      {/* Toast container */}
      <div className="fixed right-4 top-4 z-50 flex flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`max-w-sm px-4 py-2 rounded shadow-lg text-white ${
              t.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Ngân sách</h1>
          <p className="text-gray-500">Theo dõi và kiểm soát chi tiêu</p>
        </div>
        <Button
          onPress={handleAddNew}
          className="bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold"
          startContent={<span>➕</span>}
        >
          Tạo ngân sách
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === "active" ? "solid" : "flat"}
          onPress={() => setFilter("active")}
          className={
            filter === "active"
              ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold"
              : "text-sky-600 hover:bg-sky-50"
          }
        >
          Đang hoạt động
        </Button>
        <Button
          variant={filter === "all" ? "solid" : "flat"}
          onPress={() => setFilter("all")}
          className={
            filter === "all"
              ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold"
              : "text-sky-600 hover:bg-sky-50"
          }
        >
          Tất cả
        </Button>
      </div>

      {/* Budgets Grid */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      ) : displayBudgets.length === 0 ? (
        <Card className="border-gray-200 dark:border-gray-700">
          <CardBody className="text-center py-12">
            <p className="text-lg text-gray-400">Chưa có ngân sách nào</p>
            <Button
              onPress={handleAddNew}
              className="mt-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold"
            >
              Tạo ngân sách đầu tiên
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displayBudgets.map((budget: any) => (
            <Card
              key={budget.id}
              className={budget.shouldAlert ? "border-2 border-warning" : ""}
            >
              <CardHeader className="flex justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {budget.category?.name || `Ngân sách ${budget.id}`}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Chip size="sm" variant="flat">
                      {budget.category?.icon} {budget.category?.name}
                    </Chip>
                    <Chip
                      size="sm"
                      variant="flat"
                      className="bg-sky-100 text-sky-700"
                    >
                      {getPeriodLabel(budget.period_type)}
                    </Chip>
                  </div>
                </div>
                {budget.is_near_limit && (
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
                        {formatCurrency(budget.used_amount || 0)} /{" "}
                        {formatCurrency(budget.amount_limit || 0)}
                      </span>
                    </div>
                    <Progress
                      value={Math.min(budget.usage_percentage || 0, 100)}
                      color={getProgressColor(
                        budget.usage_percentage || 0,
                        budget.is_exceeded
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
                      {formatCurrency(budget.remaining_amount || 0)}
                    </span>
                  </div>

                  {/* Date Range */}
                  <div className="text-xs text-default-400">
                    {budget.start_date &&
                      format(new Date(budget.start_date), "dd/MM/yyyy")}
                    {budget.end_date &&
                      ` - ${format(new Date(budget.end_date), "dd/MM/yyyy")}`}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="flat"
                      onPress={() => handleEdit(budget)}
                      className="flex-1 bg-sky-100 text-sky-700 hover:bg-sky-200"
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
                {/* Ensure RHF knows about categoryId when using controlled Select */}
                <input type="hidden" {...register("categoryId")} />
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
                  selectedKeys={watch("period") ? [watch("period")] : []}
                  onChange={(e) => setValue("period", e.target.value as any)}
                  isInvalid={!!errors.period}
                  errorMessage={errors.period?.message}
                >
                  <SelectItem key="WEEKLY">Hàng tuần</SelectItem>
                  <SelectItem key="MONTHLY">Hàng tháng</SelectItem>
                  <SelectItem key="CUSTOM">Tùy chỉnh</SelectItem>
                </Select>

                <Select
                  label="Danh mục"
                  selectedKeys={
                    watch("categoryId") ? [watch("categoryId")] : []
                  }
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0];
                    if (selectedKey) {
                      setValue("categoryId", String(selectedKey), {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }
                  }}
                  isDisabled={categoriesLoading}
                  isInvalid={!!errors.categoryId}
                  errorMessage={errors.categoryId?.message}
                >
                  {displayCategories.map((cat: any) => (
                    <SelectItem key={String(cat.id)}>
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
              <Button
                type="submit"
                className="bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold"
                isLoading={isSaving}
                disabled={isSaving}
              >
                {editingBudget ? "Cập nhật" : "Tạo"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
