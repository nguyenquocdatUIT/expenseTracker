"use client";

import { useState } from "react";
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
import { Spinner } from "@heroui/spinner";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

import {
  useGetTransactionsV1TransactionsGet,
  useCreateTransactionV1TransactionsPost,
  useUpdateTransactionV1TransactionsTransactionIdPatch,
  useDeleteTransactionV1TransactionsTransactionIdDelete,
  useGetCategoriesV1CategoriesGet,
  useGetWalletsV1WalletsGet,
  type TransactionType,
} from "@/lib/api";

const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"] as const),
  amount: z.number().positive("Số tiền phải lớn hơn 0"),
  date: z.string(),
  description: z.string().optional(),
  category_id: z.number().optional(),
  wallet_id: z.number().optional(),
  to_wallet_id: z.number().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [filters, setFilters] = useState<{
    transaction_type?: TransactionType;
    category_id?: number;
    wallet_id?: number;
  }>({});

  const { isOpen, onOpen, onClose } = useDisclosure();

  // Fetch data
  const {
    data: transactionsData,
    isLoading,
    refetch,
  } = useGetTransactionsV1TransactionsGet({
    page,
    size: 20,
    ...filters,
  });

  const { data: categories } = useGetCategoriesV1CategoriesGet();

  console.log("categories:", categories);
  const { data: wallets } = useGetWalletsV1WalletsGet();

  console.log("wallets:", wallets);
  console.log("filters:", filters);

  // Mutations
  const { mutate: createTransaction, isPending: isCreating } =
    useCreateTransactionV1TransactionsPost();
  const { mutate: updateTransaction, isPending: isUpdating } =
    useUpdateTransactionV1TransactionsTransactionIdPatch();
  const { mutate: deleteTransaction } =
    useDeleteTransactionV1TransactionsTransactionIdDelete();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    control,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "EXPENSE",
      date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    },
  });

  const transactionType = watch("type");

  const onSubmit = handleSubmit(async (data: TransactionFormData) => {
    if (editingTransaction) {
      // Update existing transaction
      updateTransaction(
        {
          transactionId: editingTransaction.id,
          data: {
            type: data.type,
            amount: data.amount,
            date: data.date,
            description: data.description || null,
            category_id: data.category_id || null,
            wallet_id: data.wallet_id || null,
            to_wallet_id: data.to_wallet_id || null,
          },
        },
        {
          onSuccess: () => {
            onClose();
            setEditingTransaction(null);
            reset({
              type: "EXPENSE",
              date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
            });
            refetch();
          },
          onError: (error) => {
            console.error("Error updating transaction:", error);
          },
        }
      );
    } else {
      // Create new transaction
      createTransaction(
        { data },
        {
          onSuccess: () => {
            onClose();
            reset({
              type: "EXPENSE",
              date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
            });
            refetch();
          },
          onError: (error) => {
            console.error("Error creating transaction:", error);
          },
        }
      );
    }
  });

  const handleDelete = (transactionId: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa giao dịch này?")) {
      deleteTransaction(
        { transactionId },
        {
          onSuccess: () => {
            refetch();
          },
        }
      );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleAddNew = () => {
    setEditingTransaction(null);
    reset({
      type: "EXPENSE",
      date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    });
    onOpen();
  };

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
    reset({
      type: transaction.type as TransactionType,
      amount: transaction.amount,
      date: format(new Date(transaction.date), "yyyy-MM-dd'T'HH:mm"),
      description: transaction.description || "",
      category_id: transaction.category_id || undefined,
      wallet_id: transaction.wallet_id || undefined,
      to_wallet_id: transaction.to_wallet_id || undefined,
    });
    onOpen();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
          Giao dịch
        </h1>
        <Button
          className="bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold"
          // xoá icon và color text
          onPress={handleAddNew}
        >
          Thêm giao dịch
        </Button>
      </div>

      <Card className="border-gray-200 dark:border-gray-700">
        <CardHeader>
          <div className="flex flex-row gap-2 flex-wrap items-end w-full">
            <Select
              className="flex-1 min-w-[150px]"
              label="Loại"
              selectedKeys={
                filters.transaction_type
                  ? new Set([filters.transaction_type])
                  : new Set([])
              }
              onSelectionChange={(keys) => {
                const selectedKey = Array.from(keys)[0];
                setFilters({
                  ...filters,
                  transaction_type: selectedKey as TransactionType,
                });
              }}
            >
              <SelectItem key="INCOME">Thu nhập</SelectItem>
              <SelectItem key="EXPENSE">Chi tiêu</SelectItem>
              <SelectItem key="TRANSFER">Chuyển khoản</SelectItem>
            </Select>

            <Select
              className="flex-1 min-w-[150px]"
              label="Danh mục"
              selectedKeys={
                filters.category_id
                  ? new Set([String(filters.category_id)])
                  : new Set([])
              }
              onSelectionChange={(keys) => {
                const selectedKey = Array.from(keys)[0];
                setFilters({
                  ...filters,
                  category_id: selectedKey ? Number(selectedKey) : undefined,
                });
              }}
              items={(categories || []).map((cat) => ({
                id: String(cat.id),
                name: cat.name,
              }))}
            >
              {(item: any) => (
                <SelectItem key={item.id} textValue={item.name}>
                  {item.name}
                </SelectItem>
              )}
            </Select>

            <Select
              className="flex-1 min-w-[150px]"
              label="Ví"
              selectedKeys={
                filters.wallet_id
                  ? new Set([String(filters.wallet_id)])
                  : new Set([])
              }
              onSelectionChange={(keys) => {
                const selectedKey = Array.from(keys)[0];
                setFilters({
                  ...filters,
                  wallet_id: selectedKey ? Number(selectedKey) : undefined,
                });
              }}
              items={(wallets || []).map((wallet) => ({
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

            <Button
              className="shrink-0 h-12"
              variant="flat"
              onPress={() => {
                setFilters({});
                refetch();
              }}
            >
              Xóa bộ lọc
            </Button>
          </div>
        </CardHeader>

        <CardBody>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <Table aria-label="Bảng giao dịch">
              <TableHeader>
                <TableColumn>NGÀY</TableColumn>
                <TableColumn>LOẠI</TableColumn>
                <TableColumn>SỐ TIỀN</TableColumn>
                <TableColumn>DANH MỤC</TableColumn>
                <TableColumn>VÍ</TableColumn>
                <TableColumn>MÔ TẢ</TableColumn>
                <TableColumn>THAO TÁC</TableColumn>
              </TableHeader>
              <TableBody emptyContent="Chưa có giao dịch nào">
                {(transactionsData?.items || []).map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {format(new Date(transaction.date), "dd/MM/yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={
                          transaction.type === "INCOME"
                            ? "success"
                            : transaction.type === "EXPENSE"
                              ? "danger"
                              : "primary"
                        }
                        size="sm"
                      >
                        {transaction.type === "INCOME"
                          ? "Thu"
                          : transaction.type === "EXPENSE"
                            ? "Chi"
                            : "Chuyển"}
                      </Chip>
                    </TableCell>
                    <TableCell
                      className={
                        transaction.type === "INCOME"
                          ? "text-success"
                          : "text-danger"
                      }
                    >
                      {transaction.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>{transaction.category?.name || "—"}</TableCell>
                    <TableCell>{transaction.wallet?.name || "—"}</TableCell>
                    <TableCell>{transaction.description || "—"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          color="primary"
                          size="sm"
                          variant="light"
                          onPress={() => handleEdit(transaction)}
                        >
                          Sửa
                        </Button>
                        <Button
                          color="danger"
                          size="sm"
                          variant="light"
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
          )}

          {transactionsData && transactionsData.pages > 1 && (
            <div className="flex justify-center mt-4">
              <div className="flex gap-2">
                <Button
                  isDisabled={page === 1}
                  size="sm"
                  onPress={() => setPage(page - 1)}
                >
                  Trước
                </Button>
                <span className="flex items-center px-3">
                  Trang {page} / {transactionsData.pages}
                </span>
                <Button
                  isDisabled={page === transactionsData.pages}
                  size="sm"
                  onPress={() => setPage(page + 1)}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      <Modal
        isOpen={isOpen}
        size="2xl"
        onClose={() => {
          onClose();
          setEditingTransaction(null);
        }}
      >
        <ModalContent>
          <form onSubmit={onSubmit}>
            <ModalHeader className="flex flex-col gap-1 bg-gradient-to-r from-sky-500 to-blue-600 text-white">
              {editingTransaction ? "Sửa giao dịch" : "Thêm giao dịch mới"}
            </ModalHeader>
            <ModalBody className="py-6">
              <div className="space-y-4">
                <Select
                  errorMessage={errors.type?.message}
                  isInvalid={!!errors.type}
                  label="Loại giao dịch"
                  selectedKeys={new Set([transactionType])}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0];
                    if (selectedKey) {
                      setValue("type", selectedKey as TransactionType);
                    }
                  }}
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
                  placeholder="0"
                />

                <Input
                  label="Ngày giờ"
                  type="datetime-local"
                  {...register("date")}
                  errorMessage={errors.date?.message}
                  isInvalid={!!errors.date}
                />

                <Select
                  errorMessage={errors.category_id?.message}
                  isInvalid={!!errors.category_id}
                  label="Danh mục"
                  disallowEmptySelection
                  selectedKeys={
                    watch("category_id")
                      ? new Set([String(watch("category_id"))])
                      : new Set([])
                  }
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0];
                    if (selectedKey) {
                      setValue("category_id", Number(selectedKey), {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }
                  }}
                  items={(categories || []).map((cat) => ({
                    id: String(cat.id),
                    name: cat.name,
                  }))}
                >
                  {(item: any) => (
                    <SelectItem key={item.id} textValue={item.name}>
                      {item.name}
                    </SelectItem>
                  )}
                </Select>

                <Select
                  errorMessage={errors.wallet_id?.message}
                  isInvalid={!!errors.wallet_id}
                  label="Ví"
                  selectedKeys={
                    watch("wallet_id")
                      ? new Set([String(watch("wallet_id"))])
                      : new Set([])
                  }
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0];
                    if (selectedKey) {
                      const walletId = Number(selectedKey);
                      setValue("wallet_id", walletId, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }
                  }}
                  items={(wallets || []).map((wallet) => ({
                    id: String(wallet.id),
                    name: wallet.name,
                    balance: wallet.balance,
                  }))}
                >
                  {(item: any) => (
                    <SelectItem key={item.id} textValue={item.name}>
                      {item.name} - {formatCurrency(item.balance)}
                    </SelectItem>
                  )}
                </Select>

                {transactionType === "TRANSFER" && (
                  <Select
                    errorMessage={errors.to_wallet_id?.message}
                    isInvalid={!!errors.to_wallet_id}
                    label="Ví đích"
                    disallowEmptySelection
                    selectedKeys={
                      watch("to_wallet_id")
                        ? new Set([String(watch("to_wallet_id"))])
                        : new Set([])
                    }
                    onSelectionChange={(keys) => {
                      const selectedKey = Array.from(keys)[0];
                      if (selectedKey) {
                        setValue("to_wallet_id", Number(selectedKey), {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }
                    }}
                    items={(wallets || []).map((wallet) => ({
                      id: String(wallet.id),
                      name: wallet.name,
                      balance: wallet.balance,
                    }))}
                  >
                    {(item: any) => (
                      <SelectItem key={item.id} textValue={item.name}>
                        {item.name} - {formatCurrency(item.balance)}
                      </SelectItem>
                    )}
                  </Select>
                )}

                <Input
                  label="Mô tả (tùy chọn)"
                  {...register("description")}
                  placeholder="VD: Mua đồ ăn"
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="light"
                onPress={() => {
                  onClose();
                  setEditingTransaction(null);
                }}
              >
                Hủy
              </Button>
              <Button
                className="bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold"
                isLoading={isCreating || isUpdating}
                type="submit"
              >
                {editingTransaction ? "Cập nhật" : "Thêm"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
