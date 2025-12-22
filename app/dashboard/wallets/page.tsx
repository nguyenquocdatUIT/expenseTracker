"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
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
import {
  useGetWalletsV1WalletsGet,
  useCreateWalletV1WalletsPost,
  useUpdateWalletV1WalletsWalletIdPatch,
  useDeleteWalletV1WalletsWalletIdDelete,
} from "@/lib/api";

const walletSchema = z.object({
  name: z.string().min(1, "Tên ví là bắt buộc"),
  currency: z.string(),
  initial_balance: z.number(),
});

type WalletFormData = z.infer<typeof walletSchema>;

export default function WalletsPage() {
  const [editingWallet, setEditingWallet] = useState<any>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Fetch wallets
  const { data: wallets, isLoading, refetch } = useGetWalletsV1WalletsGet();

  // Create wallet mutation
  const { mutate: createWallet, isPending: isCreating } =
    useCreateWalletV1WalletsPost();

  // Update wallet mutation
  const { mutate: updateWallet, isPending: isUpdating } =
    useUpdateWalletV1WalletsWalletIdPatch();

  // Delete wallet mutation
  const { mutate: deleteWallet } = useDeleteWalletV1WalletsWalletIdDelete();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WalletFormData>({
    resolver: zodResolver(walletSchema),
    defaultValues: {
      currency: "VND",
      initial_balance: 0,
    },
  });

  const onSubmit = handleSubmit(async (data: WalletFormData) => {
    if (editingWallet) {
      // Update existing wallet
      updateWallet(
        {
          walletId: editingWallet.id,
          data: {
            name: data.name,
            currency: data.currency,
          },
        },
        {
          onSuccess: () => {
            onClose();
            reset();
            setEditingWallet(null);
            refetch();
          },
          onError: (error) => {
            console.error("Error updating wallet:", error);
          },
        }
      );
    } else {
      // Create new wallet
      createWallet(
        { data },
        {
          onSuccess: () => {
            onClose();
            reset();
            refetch();
          },
          onError: (error) => {
            console.error("Error creating wallet:", error);
          },
        }
      );
    }
  });

  const handleAddNew = () => {
    setEditingWallet(null);
    reset({
      currency: "VND",
      initial_balance: 0,
    });
    onOpen();
  };

  const handleEdit = (wallet: any) => {
    setEditingWallet(wallet);
    reset({
      name: wallet.name,
      currency: wallet.currency,
      initial_balance: wallet.balance,
    });
    onOpen();
  };

  const handleDelete = (walletId: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa ví này?")) {
      deleteWallet(
        { walletId },
        {
          onSuccess: () => {
            refetch();
          },
          onError: (error) => {
            console.error("Error deleting wallet:", error);
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

  const getTotalBalance = () => {
    return (wallets || []).reduce((sum, wallet) => sum + wallet.balance, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
            Quản lý Ví
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Tổng tài sản:{" "}
            <span className="font-semibold text-sky-600">
              {formatCurrency(getTotalBalance())}
            </span>
          </p>
        </div>
        <Button
          className="bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          onPress={handleAddNew}
          startContent={<span>➕</span>}
        >
          Thêm ví
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner size="lg" color="primary" />
        </div>
      ) : !wallets || wallets.length === 0 ? (
        <Card className="shadow-lg border border-gray-200 dark:border-gray-800">
          <CardBody className="text-center py-12">
            <p className="text-lg text-gray-400">Chưa có ví nào</p>
            <Button
              className="bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all mt-4"
              onPress={handleAddNew}
            >
              Thêm ví đầu tiên
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {wallets.map((wallet) => (
            <Card
              key={wallet.id}
              className="shadow-lg border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-all"
            >
              <CardHeader className="flex justify-between bg-gradient-to-r from-sky-50 to-blue-50 dark:from-gray-800 dark:to-gray-700">
                <div>
                  <h3 className="text-lg font-semibold text-sky-700 dark:text-sky-400">
                    {wallet.name}
                  </h3>
                  <Chip
                    size="sm"
                    variant="flat"
                    className="mt-1 bg-sky-100 text-sky-700"
                  >
                    {wallet.currency}
                  </Chip>
                </div>
              </CardHeader>
              <CardBody>
                <div className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent mb-4">
                  {formatCurrency(wallet.balance)}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="flat"
                    className="border border-sky-500 text-sky-600 hover:bg-sky-50"
                    onPress={() => handleEdit(wallet)}
                  >
                    Sửa
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    className="border border-red-500 text-red-600 hover:bg-red-50"
                    onPress={() => handleDelete(wallet.id)}
                  >
                    Xóa
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <form onSubmit={onSubmit}>
            <ModalHeader className="flex flex-col gap-1 bg-gradient-to-r from-sky-500 to-blue-600 text-white">
              {editingWallet ? "Cập nhật ví" : "Thêm ví mới"}
            </ModalHeader>
            <ModalBody className="py-6">
              <div className="space-y-4">
                <Input
                  label="Tên ví"
                  {...register("name")}
                  placeholder="VD: Ví tiền mặt"
                  isInvalid={!!errors.name}
                  errorMessage={errors.name?.message}
                  classNames={{
                    input: "bg-white dark:bg-gray-900",
                    inputWrapper:
                      "border-gray-200 dark:border-gray-700 hover:border-sky-400",
                  }}
                />

                <Input
                  label="Tiền tệ"
                  {...register("currency")}
                  placeholder="VND"
                  isInvalid={!!errors.currency}
                  errorMessage={errors.currency?.message}
                  classNames={{
                    input: "bg-white dark:bg-gray-900",
                    inputWrapper:
                      "border-gray-200 dark:border-gray-700 hover:border-sky-400",
                  }}
                />

                {!editingWallet && (
                  <Input
                    label="Số dư ban đầu"
                    type="number"
                    {...register("initial_balance", { valueAsNumber: true })}
                    placeholder="0"
                    isInvalid={!!errors.initial_balance}
                    errorMessage={errors.initial_balance?.message}
                    classNames={{
                      input: "bg-white dark:bg-gray-900",
                      inputWrapper:
                        "border-gray-200 dark:border-gray-700 hover:border-sky-400",
                    }}
                  />
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Hủy
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold"
                isLoading={isCreating || isUpdating}
              >
                {editingWallet ? "Cập nhật" : "Thêm"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
