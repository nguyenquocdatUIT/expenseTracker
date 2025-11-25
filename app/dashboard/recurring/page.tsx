"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
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
  const [categories, setCategories] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRecurring, setEditingRecurring] = useState<any>(null);
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

  useEffect(() => {
    fetchRecurring();
    fetchCategories();
    fetchWallets();
  }, [filter]);

  const fetchRecurring = async () => {
    try {
      setLoading(true);
      const url =
        filter === "active"
          ? "/api/recurring-transactions?active=true"
          : "/api/recurring-transactions";
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setRecurring(data);
      }
    } catch (error) {
      console.error("Error fetching recurring transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchWallets = async () => {
    try {
      const response = await fetch("/api/wallets");
      if (response.ok) {
        const data = await response.json();
        setWallets(data);
      }
    } catch (error) {
      console.error("Error fetching wallets:", error);
    }
  };

  const onSubmit = async (data: RecurringFormData) => {
    try {
      const url = editingRecurring
        ? `/api/recurring-transactions/${editingRecurring.id}`
        : "/api/recurring-transactions";
      const method = editingRecurring ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          amount: Number(data.amount),
          startDate: new Date(data.startDate).toISOString(),
          endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
        }),
      });

      if (response.ok) {
        onClose();
        reset();
        setEditingRecurring(null);
        fetchRecurring();
      }
    } catch (error) {
      console.error("Error saving recurring transaction:", error);
    }
  };

  const handleEdit = (item: any) => {
    setEditingRecurring(item);
    reset({
      amount: item.amount,
      type: item.type,
      description: item.description || "",
      frequency: item.frequency,
      startDate: format(new Date(item.startDate), "yyyy-MM-dd"),
      endDate: item.endDate ? format(new Date(item.endDate), "yyyy-MM-dd") : "",
      categoryId: item.categoryId,
      walletId: item.walletId,
      notifyBefore: item.notifyBefore || 0,
      isActive: item.isActive,
    });
    onOpen();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa giao dịch định kỳ này?")) return;

    try {
      const response = await fetch(`/api/recurring-transactions/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchRecurring();
      }
    } catch (error) {
      console.error("Error deleting recurring transaction:", error);
    }
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
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
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

  const filteredCategories = categories.filter((cat) =>
    transactionType === "TRANSFER" ? true : cat.type === transactionType
  );

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
          onPress={handleAddNew}
          startContent={<span>➕</span>}
        >
          Tạo giao dịch định kỳ
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

      {/* Table */}
      <Card>
        <CardBody>
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : recurring.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-default-400">
                Chưa có giao dịch định kỳ nào
              </p>
              <Button color="primary" onPress={handleAddNew} className="mt-4">
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
                {recurring.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Chip
                        color={getTypeColor(item.type)}
                        variant="flat"
                        size="sm"
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
                      {format(new Date(item.nextDate), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={item.isActive ? "success" : "default"}
                        variant="flat"
                      >
                        {item.isActive ? "Hoạt động" : "Tạm dừng"}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="light"
                          color="primary"
                          onPress={() => handleEdit(item)}
                        >
                          Sửa
                        </Button>
                        <Button
                          size="sm"
                          variant="light"
                          color="danger"
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
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader>
              {editingRecurring
                ? "Chỉnh sửa giao dịch định kỳ"
                : "Tạo giao dịch định kỳ mới"}
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Select
                  label="Loại giao dịch"
                  {...register("type")}
                  selectedKeys={[watch("type")]}
                  onChange={(e) => setValue("type", e.target.value as any)}
                  isInvalid={!!errors.type}
                  errorMessage={errors.type?.message}
                >
                  <SelectItem key="INCOME" value="INCOME">
                    Thu nhập
                  </SelectItem>
                  <SelectItem key="EXPENSE" value="EXPENSE">
                    Chi tiêu
                  </SelectItem>
                  <SelectItem key="TRANSFER" value="TRANSFER">
                    Chuyển khoản
                  </SelectItem>
                </Select>

                <Input
                  label="Số tiền"
                  type="number"
                  {...register("amount", { valueAsNumber: true })}
                  isInvalid={!!errors.amount}
                  errorMessage={errors.amount?.message}
                />

                <Select
                  label="Tần suất"
                  {...register("frequency")}
                  selectedKeys={[watch("frequency")]}
                  onChange={(e) => setValue("frequency", e.target.value as any)}
                  isInvalid={!!errors.frequency}
                  errorMessage={errors.frequency?.message}
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
                  <SelectItem key="YEARLY" value="YEARLY">
                    Hàng năm
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
                  {filteredCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </Select>

                <Select
                  label="Ví"
                  {...register("walletId")}
                  selectedKeys={watch("walletId") ? [watch("walletId")] : []}
                  onChange={(e) => setValue("walletId", e.target.value)}
                  isInvalid={!!errors.walletId}
                  errorMessage={errors.walletId?.message}
                >
                  {wallets.map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id}>
                      {wallet.name}
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
