"use client";

import { useEffect, useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
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
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

import {
  useGetRecurringTransactionsV1RecurringTransactionsGet,
  useCreateRecurringTransactionV1RecurringTransactionsPost,
  useUpdateRecurringTransactionV1RecurringTransactionsRecurringIdPatch,
  useDeleteRecurringTransactionV1RecurringTransactionsRecurringIdDelete,
  useGetCategoriesV1CategoriesGet,
  useGetWalletsV1WalletsGet,
} from "@/lib/api";

const recurringSchema = z.object({
  amount: z.number().positive("Số tiền phải lớn hơn 0"),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  description: z.string().optional(),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
  startDate: z.string(),
  endDate: z.string().optional(),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  walletId: z.string().min(1, "Vui lòng chọn ví"),
  notifyBefore: z.number().optional(),
  isActive: z.boolean(),
});

type RecurringFormData = z.infer<typeof recurringSchema>;

export default function RecurringTransactionsPage() {
  const [recurring, setRecurring] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRecurring, setEditingRecurring] = useState<any>(null);
  const [toasts, setToasts] = useState<
    { id: number; type: "success" | "error"; message: string }[]
  >([]);
  const [isSaving, setIsSaving] = useState(false);
  const [filter, setFilter] = useState<"all" | "active">("active");

  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<RecurringFormData>({
    resolver: zodResolver(recurringSchema),
    defaultValues: {
      type: "EXPENSE",
      frequency: "MONTHLY",
      startDate: format(new Date(), "yyyy-MM-dd"),
      isActive: true,
    },
  });

  const transactionType = watch("type");

  // Use generated API hooks
  const {
    data: recurringData,
    isLoading: recurringLoading,
    refetch: refetchRecurring,
  } = useGetRecurringTransactionsV1RecurringTransactionsGet();

  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetCategoriesV1CategoriesGet();

  const { data: walletsData, isLoading: walletsLoading } =
    useGetWalletsV1WalletsGet();

  const { mutate: createRecurring } =
    useCreateRecurringTransactionV1RecurringTransactionsPost();
  const { mutate: updateRecurring } =
    useUpdateRecurringTransactionV1RecurringTransactionsRecurringIdPatch();
  const { mutate: deleteRecurring } =
    useDeleteRecurringTransactionV1RecurringTransactionsRecurringIdDelete();

  useEffect(() => {
    setLoading(recurringLoading || categoriesLoading || walletsLoading);
  }, [recurringLoading, categoriesLoading, walletsLoading]);

  const displayRecurring = recurringData || [];
  const displayCategories = categoriesData || [];
  const displayWallets = walletsData || [];

  const pushToast = (type: "success" | "error", message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);

    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };

  const onSubmit = async (data: RecurringFormData) => {
    try {
      const payload = {
        amount: Number(data.amount),
        type: data.type as any,
        description: data.description || undefined,
        frequency: data.frequency as any,
        start_date: new Date(data.startDate).toISOString(),
        end_date: data.endDate
          ? new Date(data.endDate).toISOString()
          : undefined,
        category_id: Number(data.categoryId),
        wallet_id: Number(data.walletId),
        notify_before: data.notifyBefore || undefined,
        is_active: data.isActive,
      };

      setIsSaving(true);
      if (editingRecurring && editingRecurring.id) {
        updateRecurring(
          { recurringId: Number(editingRecurring.id), data: payload },
          {
            onSuccess: () => {
              onClose();
              reset();
              setEditingRecurring(null);
              refetchRecurring();
              pushToast("success", "Cập nhật giao dịch định kỳ thành công");
              setIsSaving(false);
            },
            onError: (err) => {
              console.error("Update recurring error:", err);
              pushToast("error", "Cập nhật thất bại");
              setIsSaving(false);
            },
          }
        );
      } else {
        createRecurring(
          { data: payload },
          {
            onSuccess: () => {
              onClose();
              reset();
              refetchRecurring();
              pushToast("success", "Tạo giao dịch định kỳ thành công");
              setIsSaving(false);
            },
            onError: (err) => {
              console.error("Create recurring error:", err);
              pushToast("error", "Tạo thất bại");
              setIsSaving(false);
            },
          }
        );
      }
    } catch (error) {
      console.error("Error saving recurring transaction:", error);
      setIsSaving(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingRecurring(item);
    reset({
      amount: item.amount,
      type: item.type,
      description: item.description || "",
      frequency: item.frequency,
      startDate: format(new Date(item.start_date), "yyyy-MM-dd"),
      endDate: item.end_date
        ? format(new Date(item.end_date), "yyyy-MM-dd")
        : "",
      categoryId: String(item.category_id),
      walletId: String(item.wallet_id),
      notifyBefore: item.notify_before || 0,
      isActive: item.is_active,
    });
    onOpen();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa giao dịch định kỳ này?")) return;

    deleteRecurring(
      { recurringId: Number(id) },
      {
        onSuccess: () => {
          refetchRecurring();
          pushToast("success", "Xóa thành công");
        },
        onError: (err) => {
          console.error("Delete recurring error:", err);
          pushToast("error", "Xóa thất bại");
        },
      }
    );
  };

  const handleAddNew = () => {
    setEditingRecurring(null);
    reset({
      type: "EXPENSE",
      frequency: "MONTHLY",
      startDate: format(new Date(), "yyyy-MM-dd"),
      isActive: true,
    });
    onOpen();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getFrequencyLabel = (freq: string) => {
    const labels: any = {
      DAILY: "Hàng ngày",
      WEEKLY: "Hàng tuần",
      MONTHLY: "Hàng tháng",
      YEARLY: "Hàng năm",
    };

    return labels[freq] || freq;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "INCOME":
        return "success";
      case "EXPENSE":
        return "danger";
      case "TRANSFER":
        return "warning";
      default:
        return "default";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "INCOME":
        return "Thu nhập";
      case "EXPENSE":
        return "Chi tiêu";
      case "TRANSFER":
        return "Chuyển khoản";
      default:
        return type;
    }
  };

  const filteredCategories = displayCategories as any[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Giao dịch Định kỳ</h1>
          <p className="text-default-500">
            Quản lý các giao dịch tự động lặp lại
          </p>
        </div>
        <Button
          color="primary"
          startContent={<span>➕</span>}
          onPress={handleAddNew}
        >
          Tạo giao dịch định kỳ
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          color="primary"
          variant={filter === "active" ? "solid" : "flat"}
          onPress={() => setFilter("active")}
        >
          Đang hoạt động
        </Button>
        <Button
          color="primary"
          variant={filter === "all" ? "solid" : "flat"}
          onPress={() => setFilter("all")}
        >
          Tất cả
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardBody>
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : displayRecurring.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-default-400">
                Chưa có giao dịch định kỳ nào
              </p>
              <Button className="mt-4" color="primary" onPress={handleAddNew}>
                Tạo giao dịch định kỳ đầu tiên
              </Button>
            </div>
          ) : (
            <Table aria-label="Recurring transactions table">
              <TableHeader>
                <TableColumn>LOẠI</TableColumn>
                <TableColumn>MÔ TẢ</TableColumn>
                <TableColumn>SỐ TIỀN</TableColumn>
                <TableColumn>TẦN SUẤT</TableColumn>
                <TableColumn>LẦN TIẾP THEO</TableColumn>
                <TableColumn>TRẠNG THÁI</TableColumn>
                <TableColumn>THAO TÁC</TableColumn>
              </TableHeader>
              <TableBody>
                {displayRecurring.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Chip
                        color={getTypeColor(item.type)}
                        size="sm"
                        variant="flat"
                      >
                        {getTypeLabel(item.type)}
                      </Chip>
                    </TableCell>
                    <TableCell>{item.description || "-"}</TableCell>
                    <TableCell>
                      <span
                        className={
                          item.type === "INCOME"
                            ? "text-success font-semibold"
                            : item.type === "EXPENSE"
                              ? "text-danger font-semibold"
                              : "font-semibold"
                        }
                      >
                        {item.type === "EXPENSE" && "-"}
                        {item.type === "INCOME" && "+"}
                        {formatCurrency(item.amount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat">
                        {getFrequencyLabel(item.frequency)}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const nd = item.next_date ?? item.nextDate;

                        return nd ? format(new Date(nd), "dd/MM/yyyy") : "-";
                      })()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={
                          (item.is_active ?? item.isActive)
                            ? "success"
                            : "default"
                        }
                        size="sm"
                        variant="flat"
                      >
                        {(item.is_active ?? item.isActive)
                          ? "Hoạt động"
                          : "Tạm dừng"}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          color="primary"
                          size="sm"
                          variant="light"
                          onPress={() => handleEdit(item)}
                        >
                          Sửa
                        </Button>
                        <Button
                          color="danger"
                          size="sm"
                          variant="light"
                          onPress={() => handleDelete(item.id)}
                        >
                          Xóa
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} size="2xl" onClose={onClose}>
        <ModalContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader>
              {editingRecurring
                ? "Chỉnh sửa giao dịch định kỳ"
                : "Tạo giao dịch định kỳ mới"}
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <input type="hidden" {...register("categoryId")} />
                <input type="hidden" {...register("walletId")} />
                <input type="hidden" {...register("type")} />
                <input type="hidden" {...register("frequency")} />
                <Select
                  errorMessage={errors.type?.message}
                  isInvalid={!!errors.type}
                  label="Loại giao dịch"
                  selectedKeys={watch("type") ? [String(watch("type"))] : []}
                  onChange={(e) =>
                    setValue("type", String(e.target.value) as any, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                >
                  <SelectItem key="INCOME">Thu nhập</SelectItem>
                  <SelectItem key="EXPENSE">Chi tiêu</SelectItem>
                  <SelectItem key="TRANSFER">Chuyển khoản</SelectItem>
                </Select>

                <Input
                  label="Số tiền"
                  type="number"
                  {...register("amount", { valueAsNumber: true })}
                  errorMessage={errors.amount?.message}
                  isInvalid={!!errors.amount}
                />

                <Select
                  errorMessage={errors.frequency?.message}
                  isInvalid={!!errors.frequency}
                  label="Tần suất"
                  selectedKeys={
                    watch("frequency") ? [String(watch("frequency"))] : []
                  }
                  onChange={(e) =>
                    setValue("frequency", String(e.target.value) as any, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                >
                  <SelectItem key="DAILY">Hàng ngày</SelectItem>
                  <SelectItem key="WEEKLY">Hàng tuần</SelectItem>
                  <SelectItem key="MONTHLY">Hàng tháng</SelectItem>
                  <SelectItem key="YEARLY">Hàng năm</SelectItem>
                </Select>

                <Select
                  errorMessage={errors.categoryId?.message}
                  isInvalid={!!errors.categoryId}
                  label="Danh mục"
                  selectedKeys={
                    watch("categoryId")
                      ? new Set([String(watch("categoryId"))])
                      : new Set([])
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
                  items={(filteredCategories || []).map((cat: any) => ({
                    id: String(cat.id),
                    name: cat.name,
                    icon: cat.icon || "",
                  }))}
                >
                  {(item: any) => (
                    <SelectItem key={item.id} textValue={item.name}>
                      {item.icon} {item.name}
                    </SelectItem>
                  )}
                </Select>

                <Select
                  errorMessage={errors.walletId?.message}
                  isInvalid={!!errors.walletId}
                  label="Ví"
                  selectedKeys={
                    watch("walletId")
                      ? new Set([String(watch("walletId"))])
                      : new Set([])
                  }
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0];
                    if (selectedKey) {
                      setValue("walletId", String(selectedKey), {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }
                  }}
                  items={(displayWallets || []).map((wallet: any) => ({
                    id: String(wallet.id),
                    name: wallet.name,
                  }))}
                >
                  {(item: any) => (
                    <SelectItem key={item.id} textValue={item.name}>
                      {item.name}
                    </SelectItem>
                  )}
                </Select>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Ngày bắt đầu"
                    type="date"
                    {...register("startDate")}
                    errorMessage={errors.startDate?.message}
                    isInvalid={!!errors.startDate}
                  />

                  <Input
                    label="Ngày kết thúc (tùy chọn)"
                    type="date"
                    {...register("endDate")}
                  />
                </div>

                <Input
                  label="Mô tả"
                  {...register("description")}
                  placeholder="VD: Lương hàng tháng"
                />

                <Input
                  label="Thông báo trước (ngày)"
                  type="number"
                  {...register("notifyBefore", { valueAsNumber: true })}
                  description="Nhận thông báo X ngày trước khi giao dịch được thực thi"
                />

                <Switch
                  {...register("isActive")}
                  isSelected={watch("isActive")}
                  onValueChange={(value) => setValue("isActive", value)}
                >
                  Kích hoạt
                </Switch>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Hủy
              </Button>
              <Button color="primary" type="submit">
                {editingRecurring ? "Cập nhật" : "Tạo"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
