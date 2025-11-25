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
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const walletSchema = z.object({
  name: z.string().min(1, "Tên ví là bắt buộc"),
  type: z.enum([
    "CASH",
    "BANK_ACCOUNT",
    "CREDIT_CARD",
    "E_WALLET",
    "INVESTMENT",
    "OTHER",
  ]),
  balance: z.number().default(0),
  currency: z.string().default("VND"),
  icon: z.string().optional(),
  color: z.string().optional(),
  isDefault: z.boolean().optional(),
});

type WalletFormData = z.infer<typeof walletSchema>;

export default function WalletsPage() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingWallet, setEditingWallet] = useState<any>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<WalletFormData>({
    resolver: zodResolver(walletSchema),
    defaultValues: {
      type: "CASH",
      balance: 0,
      currency: "VND",
      isDefault: false,
    },
  });

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/wallets");
      if (response.ok) {
        const data = await response.json();
        setWallets(data);
      }
    } catch (error) {
      console.error("Error fetching wallets:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: WalletFormData) => {
    try {
      const response = await fetch("/api/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          balance: Number(data.balance),
        }),
      });

      if (response.ok) {
        onClose();
        reset();
        fetchWallets();
      }
    } catch (error) {
      console.error("Error saving wallet:", error);
    }
  };

  const handleAddNew = () => {
    setEditingWallet(null);
    reset({
      type: "CASH",
      balance: 0,
      currency: "VND",
      isDefault: false,
    });
    onOpen();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getWalletTypeLabel = (type: string) => {
    const labels: any = {
      CASH: "Tiền mặt",
      BANK_ACCOUNT: "Tài khoản ngân hàng",
      CREDIT_CARD: "Thẻ tín dụng",
      E_WALLET: "Ví điện tử",
      INVESTMENT: "Đầu tư",
      OTHER: "Khác",
    };
    return labels[type] || type;
  };

  const getTotalBalance = () => {
    return wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Ví</h1>
          <p className="text-default-500">
            Tổng tài sản: {formatCurrency(getTotalBalance())}
          </p>
        </div>
        <Button
          color="primary"
          onPress={handleAddNew}
          startContent={<span>➕</span>}
        >
          Thêm ví
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      ) : wallets.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <p className="text-lg text-default-400">Chưa có ví nào</p>
            <Button color="primary" onPress={handleAddNew} className="mt-4">
              Thêm ví đầu tiên
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {wallets.map((wallet) => (
            <Card key={wallet.id}>
              <CardHeader className="flex justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{wallet.name}</h3>
                  <Chip size="sm" variant="flat" className="mt-1">
                    {getWalletTypeLabel(wallet.type)}
                  </Chip>
                </div>
                {wallet.isDefault && (
                  <Chip color="primary" size="sm">
                    Mặc định
                  </Chip>
                )}
              </CardHeader>
              <CardBody>
                <div className="text-3xl font-bold text-primary mb-4">
                  {formatCurrency(wallet.balance)}
                </div>
                <p className="text-xs text-default-400">
                  Tạo lúc:{" "}
                  {new Date(wallet.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader>Thêm ví mới</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Input
                  label="Tên ví"
                  {...register("name")}
                  placeholder="VD: Ví tiền mặt"
                  isInvalid={!!errors.name}
                  errorMessage={errors.name?.message}
                />

                <Select
                  label="Loại ví"
                  {...register("type")}
                  selectedKeys={[watch("type")]}
                  onChange={(e) => setValue("type", e.target.value as any)}
                  isInvalid={!!errors.type}
                  errorMessage={errors.type?.message}
                >
                  <SelectItem key="CASH" value="CASH">
                    Tiền mặt
                  </SelectItem>
                  <SelectItem key="BANK_ACCOUNT" value="BANK_ACCOUNT">
                    Tài khoản ngân hàng
                  </SelectItem>
                  <SelectItem key="CREDIT_CARD" value="CREDIT_CARD">
                    Thẻ tín dụng
                  </SelectItem>
                  <SelectItem key="E_WALLET" value="E_WALLET">
                    Ví điện tử
                  </SelectItem>
                  <SelectItem key="INVESTMENT" value="INVESTMENT">
                    Đầu tư
                  </SelectItem>
                  <SelectItem key="OTHER" value="OTHER">
                    Khác
                  </SelectItem>
                </Select>

                <Input
                  label="Số dư ban đầu"
                  type="number"
                  {...register("balance", { valueAsNumber: true })}
                  isInvalid={!!errors.balance}
                  errorMessage={errors.balance?.message}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Hủy
              </Button>
              <Button color="primary" type="submit">
                Thêm
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
