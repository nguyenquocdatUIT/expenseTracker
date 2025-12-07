"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Spinner } from "@heroui/spinner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(1, "Tên là bắt buộc"),
  email: z.string().email("Email không hợp lệ"),
  currency: z.string().default("VND"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mật khẩu hiện tại là bắt buộc"),
    newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Xác nhận mật khẩu là bắt buộc"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(profileSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // TODO: Kết nối API thật sau
      await new Promise((resolve) => setTimeout(resolve, 300));

      const dummyProfile = {
        name: "Nguyễn Văn A",
        email: "user@example.com",
        currency: "VND",
      };

      reset(dummyProfile);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitProfile = async (data: ProfileFormData) => {
    try {
      // TODO: Kết nối API thật sau
      await new Promise((resolve) => setTimeout(resolve, 300));

      setMessage("Cập nhật thông tin thành công!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Có lỗi xảy ra!");
    }
  };

  const onSubmitPassword = async (data: PasswordFormData) => {
    try {
      // TODO: Kết nối API thật sau
      await new Promise((resolve) => setTimeout(resolve, 300));

      setPasswordMessage("Đổi mật khẩu thành công!");
      resetPassword();
      setTimeout(() => setPasswordMessage(""), 3000);
    } catch (error) {
      console.error("Error changing password:", error);
      setPasswordMessage("Có lỗi xảy ra!");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold">Thông tin cá nhân</h1>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Thông tin tài khoản</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-4">
            <Input
              label="Tên"
              {...register("name")}
              isInvalid={!!errors.name}
              errorMessage={errors.name?.message}
            />

            <Input
              label="Email"
              type="email"
              {...register("email")}
              isInvalid={!!errors.email}
              errorMessage={errors.email?.message}
              isDisabled
            />

            <Select
              label="Tiền tệ"
              {...register("currency")}
              defaultSelectedKeys={["VND"]}
            >
              <SelectItem key="VND">VND - Việt Nam Đồng</SelectItem>
              <SelectItem key="USD">USD - Đô la Mỹ</SelectItem>
              <SelectItem key="EUR">EUR - Euro</SelectItem>
            </Select>

            {message && (
              <p
                className={`text-sm ${
                  message.includes("thành công")
                    ? "text-success"
                    : "text-danger"
                }`}
              >
                {message}
              </p>
            )}

            <Button type="submit" color="primary">
              Cập nhật thông tin
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Đổi mật khẩu</h2>
        </CardHeader>
        <CardBody>
          <form
            onSubmit={handleSubmitPassword(onSubmitPassword)}
            className="space-y-4"
          >
            <Input
              label="Mật khẩu hiện tại"
              type="password"
              {...registerPassword("currentPassword")}
              isInvalid={!!passwordErrors.currentPassword}
              errorMessage={passwordErrors.currentPassword?.message}
            />

            <Input
              label="Mật khẩu mới"
              type="password"
              {...registerPassword("newPassword")}
              isInvalid={!!passwordErrors.newPassword}
              errorMessage={passwordErrors.newPassword?.message}
            />

            <Input
              label="Xác nhận mật khẩu mới"
              type="password"
              {...registerPassword("confirmPassword")}
              isInvalid={!!passwordErrors.confirmPassword}
              errorMessage={passwordErrors.confirmPassword?.message}
            />

            {passwordMessage && (
              <p
                className={`text-sm ${
                  passwordMessage.includes("thành công")
                    ? "text-success"
                    : "text-danger"
                }`}
              >
                {passwordMessage}
              </p>
            )}

            <Button type="submit" color="primary">
              Đổi mật khẩu
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
