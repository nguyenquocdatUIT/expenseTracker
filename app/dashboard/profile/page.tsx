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
import { useGetCurrentUserInfoV1AuthMeGet } from "@/lib/api";

const profileSchema = z.object({
  name: z.string().min(1, "Tên là bắt buộc"),
  email: z.string().email("Email không hợp lệ"),
  currency: z.string().default("VND"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mật khẩu hiện tại là bắt buộc"),
    newPassword: z.string().min(8, "Mật khẩu mới phải có ít nhất 8 ký tự"),
    confirmPassword: z.string().min(1, "Xác nhận mật khẩu là bắt buộc"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const [message, setMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  // Fetch current user info from API
  const { data: userInfo, isLoading } = useGetCurrentUserInfoV1AuthMeGet();

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
    if (userInfo) {
      reset({
        name: userInfo.full_name,
        email: userInfo.email,
        currency: "VND",
      });
    }
  }, [userInfo, reset]);

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

  if (isLoading) {
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
          <form className="space-y-4" onSubmit={handleSubmit(onSubmitProfile)}>
            <Input
              label="Tên"
              {...register("name")}
              errorMessage={errors.name?.message}
              isInvalid={!!errors.name}
            />

            <Input
              label="Email"
              type="email"
              {...register("email")}
              isDisabled
              errorMessage={errors.email?.message}
              isInvalid={!!errors.email}
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

            <Button color="primary" type="submit">
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
            className="space-y-4"
            onSubmit={handleSubmitPassword(onSubmitPassword)}
          >
            <Input
              label="Mật khẩu hiện tại"
              type="password"
              {...registerPassword("currentPassword")}
              errorMessage={passwordErrors.currentPassword?.message}
              isInvalid={!!passwordErrors.currentPassword}
            />

            <Input
              label="Mật khẩu mới"
              type="password"
              {...registerPassword("newPassword")}
              errorMessage={passwordErrors.newPassword?.message}
              isInvalid={!!passwordErrors.newPassword}
            />

            <Input
              label="Xác nhận mật khẩu mới"
              type="password"
              {...registerPassword("confirmPassword")}
              errorMessage={passwordErrors.confirmPassword?.message}
              isInvalid={!!passwordErrors.confirmPassword}
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

            <Button color="primary" type="submit">
              Đổi mật khẩu
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
