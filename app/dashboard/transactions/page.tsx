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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import {
  useGetTransactionsV1TransactionsGet,
  useCreateTransactionV1TransactionsPost,
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

  // Mutations
  const { mutate: createTransaction, isPending: isCreating } =
    useCreateTransactionV1TransactionsPost();
  const { mutate: deleteTransaction } =
    useDeleteTransactionV1TransactionsTransactionIdDelete();

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
      type: "EXPENSE",
      date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    },
  });

  const transactionType = watch("type");

  const onSubmit = handleSubmit(async (data: TransactionFormData) => {
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
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleAddNew = () => {
    reset({
      type: "EXPENSE",
      date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    });
    onOpen();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Giao dịch</h1>
        <Button
          onPress={handleAddNew}
          className="bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold"
          startContent={<span>➕</span>}
        >
          Thêm giao dịch
        </Button>
      </div>

      <Card className="border-gray-200 dark:border-gray-700">
        <CardHeader>
          <div className="flex flex-row gap-2 flex-wrap items-end w-full">
            <Select
              label="Loại"
              className="flex-1 min-w-[150px]"
              selectedKeys={
                filters.transaction_type ? [filters.transaction_type] : []
              }
              onChange={(e) => {
                setFilters({
                  ...filters,
                  transaction_type: e.target.value as TransactionType,
                });
              }}
            >
              <SelectItem key="INCOME">Thu nhập</SelectItem>
              <SelectItem key="EXPENSE">Chi tiêu</SelectItem>
              <SelectItem key="TRANSFER">Chuyển khoản</SelectItem>
            </Select>

            <Select
              label="Danh mục"
              className="flex-1 min-w-[150px]"
              selectedKeys={
                filters.category_id ? [String(filters.category_id)] : []
              }
              onChange={(e) => {
                setFilters({
                  ...filters,
                  category_id: Number(e.target.value),
                });
              }}
            >
              {(categories || []).map((cat) => (
                <SelectItem key={cat.id}>{cat.name}</SelectItem>
              ))}
            </Select>

            <Select
              label="Ví"
              className="flex-1 min-w-[150px]"
              selectedKeys={
                filters.wallet_id ? [String(filters.wallet_id)] : []
              }
              onChange={(e) => {
                setFilters({
                  ...filters,
                  wallet_id: Number(e.target.value),
                });
              }}
            >
              {(wallets || []).map((wallet) => (
                <SelectItem key={wallet.id}>{wallet.name}</SelectItem>
              ))}
            </Select>

            <Button
              variant="flat"
              className="shrink-0 h-12"
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
                      <Button
                        size="sm"
                        color="danger"
                        variant="light"
                        onPress={() => handleDelete(transaction.id)}
                      >
                        Xóa
                      </Button>
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
                  size="sm"
                  isDisabled={page === 1}
                  onPress={() => setPage(page - 1)}
                >
                  Trước
                </Button>
                <span className="flex items-center px-3">
                  Trang {page} / {transactionsData.pages}
                </span>
                <Button
                  size="sm"
                  isDisabled={page === transactionsData.pages}
                  onPress={() => setPage(page + 1)}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <form onSubmit={onSubmit}>
            <ModalHeader className="flex flex-col gap-1 bg-gradient-to-r from-sky-500 to-blue-600 text-white">
              Thêm giao dịch mới
            </ModalHeader>
            <ModalBody className="py-6">
              <div className="space-y-4">
                <Select
                  label="Loại giao dịch"
                  selectedKeys={[transactionType]}
                  onChange={(e) =>
                    setValue("type", e.target.value as TransactionType)
                  }
                  isInvalid={!!errors.type}
                  errorMessage={errors.type?.message}
                >
                  <SelectItem key="INCOME">Thu nhập</SelectItem>
                  <SelectItem key="EXPENSE">Chi tiêu</SelectItem>
                  <SelectItem key="TRANSFER">Chuyển khoản</SelectItem>
                </Select>

                <Input
                  label="Số tiền"
                  type="number"
                  {...register("amount", { valueAsNumber: true })}
                  placeholder="0"
                  isInvalid={!!errors.amount}
                  errorMessage={errors.amount?.message}
                />

                <Input
                  label="Ngày giờ"
                  type="datetime-local"
                  {...register("date")}
                  isInvalid={!!errors.date}
                  errorMessage={errors.date?.message}
                />

                <Select
                  label="Danh mục"
                  selectedKeys={
                    watch("category_id") ? [String(watch("category_id"))] : []
                  }
                  onChange={(e) => {
                    setValue("category_id", Number(e.target.value), {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                  isInvalid={!!errors.category_id}
                  errorMessage={errors.category_id?.message}
                >
                  {(categories || []).map((cat) => (
                    <SelectItem key={String(cat.id)}>{cat.name}</SelectItem>
                  ))}
                </Select>

                <Select
                  label="Ví"
                  selectedKeys={
                    watch("wallet_id") ? [String(watch("wallet_id"))] : []
                  }
                  onChange={(e) => {
                    setValue("wallet_id", Number(e.target.value), {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                  isInvalid={!!errors.wallet_id}
                  errorMessage={errors.wallet_id?.message}
                >
                  {(wallets || []).map((wallet) => (
                    <SelectItem key={String(wallet.id)}>
                      {wallet.name} - {formatCurrency(wallet.balance)}
                    </SelectItem>
                  ))}
                </Select>

                {transactionType === "TRANSFER" && (
                  <Select
                    label="Ví đích"
                    selectedKeys={
                      watch("to_wallet_id")
                        ? [String(watch("to_wallet_id"))]
                        : []
                    }
                    onChange={(e) => {
                      setValue("to_wallet_id", Number(e.target.value), {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                    isInvalid={!!errors.to_wallet_id}
                    errorMessage={errors.to_wallet_id?.message}
                  >
                    {(wallets || []).map((wallet) => (
                      <SelectItem key={String(wallet.id)}>
                        {wallet.name} - {formatCurrency(wallet.balance)}
                      </SelectItem>
                    ))}
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
              <Button variant="light" onPress={onClose}>
                Hủy
              </Button>
              <Button
                type="submit"
                isLoading={isCreating}
                className="bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold"
              >
                Thêm
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
