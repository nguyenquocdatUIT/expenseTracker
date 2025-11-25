"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Pagination } from "@heroui/pagination";
import { Spinner } from "@heroui/spinner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

const transactionSchema = z.object({
  amount: z.number().positive("Số tiền phải lớn hơn 0"),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  description: z.string().optional(),
  date: z.string(),
  notes: z.string().optional(),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  walletId: z.string().min(1, "Vui lòng chọn ví"),
  toWalletId: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    type: "",
    categoryId: "",
    walletId: "",
    search: "",
    period: "",
  });
  const [editingTransaction, setEditingTransaction] = useState<any>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      type: "EXPENSE",
    },
  });

  const transactionType = watch("type");

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
    fetchWallets();
  }, [page, filters]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      // TODO: Kết nối API thật sau
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Dummy data
      const dummyTransactions = [
        {
          id: "1",
          amount: 500000,
          type: "EXPENSE",
          description: "Mua đồ ăn",
          date: new Date(),
          category: { name: "Ăn uống", icon: "🍕" },
          wallet: { name: "Ví tiền mặt" },
        },
        {
          id: "2",
          amount: 2000000,
          type: "INCOME",
          description: "Lương tháng 11",
          date: new Date(),
          category: { name: "Lương", icon: "💰" },
          wallet: { name: "Ngân hàng" },
        },
        {
          id: "3",
          amount: 300000,
          type: "EXPENSE",
          description: "Đổ xăng",
          date: new Date(),
          category: { name: "Di chuyển", icon: "🚗" },
          wallet: { name: "Ví tiền mặt" },
        },
      ];

      setTransactions(dummyTransactions);
      setTotalPages(1);
    } catch (error) {
      console.error("Error fetching transactions:", error);
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
        { id: "4", name: "Lương", type: "INCOME", icon: "💰" },
        { id: "5", name: "Đầu tư", type: "INCOME", icon: "📈" },
      ];

      setCategories(dummyCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchWallets = async () => {
    try {
      // TODO: Kết nối API thật sau
      await new Promise((resolve) => setTimeout(resolve, 100));

      const dummyWallets = [
        { id: "1", name: "Ví tiền mặt", type: "CASH", balance: 5000000 },
        { id: "2", name: "Ngân hàng", type: "BANK_ACCOUNT", balance: 70000000 },
        { id: "3", name: "Ví điện tử", type: "E_WALLET", balance: 2000000 },
      ];

      setWallets(dummyWallets);
    } catch (error) {
      console.error("Error fetching wallets:", error);
    }
  };

  const onSubmit = async (data: TransactionFormData) => {
    try {
      // TODO: Kết nối API thật sau
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Giả lập lưu thành công
      onClose();
      reset();
      setEditingTransaction(null);
      fetchTransactions();
    } catch (error) {
      console.error("Error saving transaction:", error);
    }
  };

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
    reset({
      amount: transaction.amount,
      type: transaction.type,
      description: transaction.description || "",
      date: format(new Date(transaction.date), "yyyy-MM-dd'T'HH:mm"),
      notes: transaction.notes || "",
      categoryId: transaction.categoryId,
      walletId: transaction.walletId,
      toWalletId: transaction.toWalletId || "",
    });
    onOpen();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa giao dịch này?")) return;

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchTransactions();
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const handleAddNew = () => {
    setEditingTransaction(null);
    reset({
      date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      type: "EXPENSE",
    });
    onOpen();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
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
          <h1 className="text-3xl font-bold">Quản lý Giao dịch</h1>
          <p className="text-default-500">Theo dõi thu chi của bạn</p>
        </div>
        <Button
          color="primary"
          onPress={handleAddNew}
          startContent={<span>➕</span>}
        >
          Thêm giao dịch
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="grid gap-4 md:grid-cols-5">
            <Input
              placeholder="Tìm kiếm..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              isClearable
              onClear={() => setFilters({ ...filters, search: "" })}
            />
            <Select
              placeholder="Loại giao dịch"
              selectedKeys={filters.type ? [filters.type] : []}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <SelectItem key="" value="">
                Tất cả
              </SelectItem>
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
            <Select
              placeholder="Danh mục"
              selectedKeys={filters.categoryId ? [filters.categoryId] : []}
              onChange={(e) =>
                setFilters({ ...filters, categoryId: e.target.value })
              }
            >
              <SelectItem key="" value="">
                Tất cả
              </SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </SelectItem>
              ))}
            </Select>
            <Select
              placeholder="Ví"
              selectedKeys={filters.walletId ? [filters.walletId] : []}
              onChange={(e) =>
                setFilters({ ...filters, walletId: e.target.value })
              }
            >
              <SelectItem key="" value="">
                Tất cả
              </SelectItem>
              {wallets.map((wallet) => (
                <SelectItem key={wallet.id} value={wallet.id}>
                  {wallet.name}
                </SelectItem>
              ))}
            </Select>
            <Select
              placeholder="Thời gian"
              selectedKeys={filters.period ? [filters.period] : []}
              onChange={(e) =>
                setFilters({ ...filters, period: e.target.value })
              }
            >
              <SelectItem key="" value="">
                Tất cả
              </SelectItem>
              <SelectItem key="day" value="day">
                Hôm nay
              </SelectItem>
              <SelectItem key="week" value="week">
                Tuần này
              </SelectItem>
              <SelectItem key="month" value="month">
                Tháng này
              </SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardBody>
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              <Table aria-label="Transactions table">
                <TableHeader>
                  <TableColumn>NGÀY</TableColumn>
                  <TableColumn>LOẠI</TableColumn>
                  <TableColumn>DANH MỤC</TableColumn>
                  <TableColumn>MÔ TẢ</TableColumn>
                  <TableColumn>VÍ</TableColumn>
                  <TableColumn>SỐ TIỀN</TableColumn>
                  <TableColumn>THAO TÁC</TableColumn>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {format(new Date(transaction.date), "dd/MM/yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <Chip
                          color={getTypeColor(transaction.type)}
                          variant="flat"
                          size="sm"
                        >
                          {getTypeLabel(transaction.type)}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        {transaction.category?.icon}{" "}
                        {transaction.category?.name}
                      </TableCell>
                      <TableCell>{transaction.description || "-"}</TableCell>
                      <TableCell>{transaction.wallet?.name}</TableCell>
                      <TableCell>
                        <span
                          className={
                            transaction.type === "INCOME"
                              ? "text-success font-semibold"
                              : transaction.type === "EXPENSE"
                                ? "text-danger font-semibold"
                                : "font-semibold"
                          }
                        >
                          {transaction.type === "EXPENSE" && "-"}
                          {transaction.type === "INCOME" && "+"}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="light"
                            color="primary"
                            onPress={() => handleEdit(transaction)}
                          >
                            Sửa
                          </Button>
                          <Button
                            size="sm"
                            variant="light"
                            color="danger"
                            onPress={() => handleDelete(transaction.id)}
                          >
                            Xóa
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination
                    total={totalPages}
                    page={page}
                    onChange={setPage}
                    showControls
                  />
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader>
              {editingTransaction
                ? "Chỉnh sửa giao dịch"
                : "Thêm giao dịch mới"}
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

                {transactionType === "TRANSFER" && (
                  <Select
                    label="Chuyển đến ví"
                    {...register("toWalletId")}
                    selectedKeys={
                      watch("toWalletId") ? [watch("toWalletId")] : []
                    }
                    onChange={(e) => setValue("toWalletId", e.target.value)}
                  >
                    {wallets.map((wallet) => (
                      <SelectItem key={wallet.id} value={wallet.id}>
                        {wallet.name}
                      </SelectItem>
                    ))}
                  </Select>
                )}

                <Input
                  label="Ngày giờ"
                  type="datetime-local"
                  {...register("date")}
                  isInvalid={!!errors.date}
                  errorMessage={errors.date?.message}
                />

                <Input
                  label="Mô tả"
                  {...register("description")}
                  placeholder="VD: Mua sắm tạp hóa"
                />

                <Input
                  label="Ghi chú"
                  {...register("notes")}
                  placeholder="Ghi chú thêm..."
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Hủy
              </Button>
              <Button color="primary" type="submit">
                {editingTransaction ? "Cập nhật" : "Thêm"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
