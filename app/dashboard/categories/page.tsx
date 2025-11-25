"use client";

import { useEffect, useState } from "react";
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

const categorySchema = z.object({
  name: z.string().min(1, "Tên danh mục là bắt buộc"),
  type: z.enum(["INCOME", "EXPENSE"]),
  icon: z.string().optional(),
  color: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "INCOME" | "EXPENSE">("all");
  const { isOpen, onOpen, onClose } = useDisclosure();

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

  useEffect(() => {
    fetchCategories();
  }, [filter]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const url =
        filter === "all" ? "/api/categories" : `/api/categories?type=${filter}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        onClose();
        reset();
        fetchCategories();
      }
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  const handleAddNew = () => {
    reset({
      type: "EXPENSE",
    });
    onOpen();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quản lý Danh mục</h1>
        <Button
          color="primary"
          onPress={handleAddNew}
          startContent={<span>➕</span>}
        >
          Thêm danh mục
        </Button>
      </div>

      <Card>
        <CardBody>
          <div className="flex gap-2 mb-4">
            <Button
              color={filter === "all" ? "primary" : "default"}
              variant={filter === "all" ? "solid" : "flat"}
              onPress={() => setFilter("all")}
            >
              Tất cả
            </Button>
            <Button
              color={filter === "INCOME" ? "success" : "default"}
              variant={filter === "INCOME" ? "solid" : "flat"}
              onPress={() => setFilter("INCOME")}
            >
              Thu nhập
            </Button>
            <Button
              color={filter === "EXPENSE" ? "danger" : "default"}
              variant={filter === "EXPENSE" ? "solid" : "flat"}
              onPress={() => setFilter("EXPENSE")}
            >
              Chi tiêu
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <Table aria-label="Bảng danh mục">
              <TableHeader>
                <TableColumn>TÊN</TableColumn>
                <TableColumn>LOẠI</TableColumn>
                <TableColumn>ICON</TableColumn>
                <TableColumn>NGÀY TẠO</TableColumn>
              </TableHeader>
              <TableBody emptyContent="Chưa có danh mục nào">
                {categories.map((category) => (
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
                      {new Date(category.createdAt).toLocaleDateString("vi-VN")}
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
