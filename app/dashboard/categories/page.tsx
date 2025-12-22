"use client";

import { useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
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
  useGetCategoriesV1CategoriesGet,
  useCreateCategoryV1CategoriesPost,
  type CategoryType,
} from "@/lib/api";

const categorySchema = z.object({
  name: z.string().min(1, "Tên danh mục là bắt buộc"),
  type: z.enum(["INCOME", "EXPENSE"] as const),
  icon: z.string().optional(),
  color: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function CategoriesPage() {
  const [filter, setFilter] = useState<"all" | CategoryType | null>("all");
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Fetch categories
  const {
    data: categories,
    isLoading,
    refetch,
  } = useGetCategoriesV1CategoriesGet();

  // Create category mutation
  const { mutate: createCategory, isPending: isCreating } =
    useCreateCategoryV1CategoriesPost();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      type: "EXPENSE",
    },
  });

  const onSubmit = async (data: CategoryFormData) => {
    console.log("Submitting category:", data);
    createCategory(
      { data },
      {
        onSuccess: () => {
          onClose();
          reset();
          refetch();
        },
        onError: (error) => {
          console.error("Error saving category:", error);
        },
      }
    );
  };

  const handleAddNew = () => {
    reset({
      type: "EXPENSE",
    });
    onOpen();
  };

  // Filter categories
  const filteredCategories =
    filter === "all" || !filter
      ? categories
      : categories?.filter((cat) => cat.type === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
          Quản lý Danh mục
        </h1>
        <Button
          className="bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          onPress={handleAddNew}
          startContent={<span>➕</span>}
        >
          Thêm danh mục
        </Button>
      </div>

      <Card className="shadow-lg border border-gray-200 dark:border-gray-800">
        <CardBody>
          <div className="flex gap-2 mb-4">
            <Button
              className={
                filter === "all"
                  ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white"
                  : "bg-white dark:bg-gray-800"
              }
              variant={filter === "all" ? "solid" : "flat"}
              onPress={() => setFilter("all")}
            >
              Tất cả
            </Button>
            <Button
              className={
                filter === "INCOME"
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                  : "bg-white dark:bg-gray-800"
              }
              variant={filter === "INCOME" ? "solid" : "flat"}
              onPress={() => setFilter("INCOME")}
            >
              Thu nhập
            </Button>
            <Button
              className={
                filter === "EXPENSE"
                  ? "bg-gradient-to-r from-red-500 to-rose-600 text-white"
                  : "bg-white dark:bg-gray-800"
              }
              variant={filter === "EXPENSE" ? "solid" : "flat"}
              onPress={() => setFilter("EXPENSE")}
            >
              Chi tiêu
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <Table aria-label="Bảng danh mục">
              <TableHeader>
                <TableColumn>TÊN</TableColumn>
                <TableColumn>LOẠI</TableColumn>
                <TableColumn>ICON</TableColumn>
                <TableColumn>MÀU</TableColumn>
              </TableHeader>
              <TableBody emptyContent="Chưa có danh mục nào">
                {(filteredCategories || []).map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>
                      <Chip
                        color={
                          category.type === "INCOME" ? "success" : "danger"
                        }
                        size="sm"
                      >
                        {category.type === "INCOME" ? "Thu nhập" : "Chi tiêu"}
                      </Chip>
                    </TableCell>
                    <TableCell>{category.icon || "—"}</TableCell>
                    <TableCell>
                      {category.color ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.color}
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader>Thêm danh mục mới</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Input
                  label="Tên danh mục"
                  {...register("name")}
                  placeholder="VD: Ăn uống, Lương"
                  isInvalid={!!errors.name}
                  errorMessage={errors.name?.message}
                />

                <Select
                  label="Loại"
                  selectedKeys={watch("type") ? [watch("type")] : []}
                  onChange={(e) => {
                    console.log("Selected type:", e.target.value);
                    setValue("type", e.target.value as CategoryType, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                  isInvalid={!!errors.type}
                  errorMessage={errors.type?.message}
                >
                  <SelectItem key="INCOME">Thu nhập</SelectItem>
                  <SelectItem key="EXPENSE">Chi tiêu</SelectItem>
                </Select>

                <Input
                  label="Icon (tùy chọn)"
                  {...register("icon")}
                  placeholder="VD: 🍕, 💰"
                />

                <Input
                  label="Màu (tùy chọn)"
                  {...register("color")}
                  placeholder="VD: #FF0000"
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Hủy
              </Button>
              <Button color="primary" type="submit" isLoading={isCreating}>
                Thêm
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
