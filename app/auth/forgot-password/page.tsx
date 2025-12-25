"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Link } from "@heroui/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(result.error || "Đã xảy ra lỗi");
      }
    } catch (err) {
      setError("Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="flex flex-col gap-1 px-6 pt-6">
            <div className="mb-2 text-4xl">✅</div>
            <h1 className="text-2xl font-bold">Email đã được gửi</h1>
          </CardHeader>
          <CardBody className="px-6">
            <p className="mb-4 text-default-500">
              Nếu email của bạn tồn tại trong hệ thống, chúng tôi đã gửi link
              đặt lại mật khẩu đến email của bạn.
            </p>
            <p className="mb-6 text-sm text-default-400">
              Vui lòng kiểm tra hộp thư đến và spam.
            </p>
            <Link href="/auth/signin">
              <Button className="w-full" color="primary">
                Quay lại đăng nhập
              </Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-1 px-6 pt-6">
          <h1 className="text-2xl font-bold">Quên mật khẩu</h1>
          <p className="text-sm text-default-500">
            Nhập email của bạn để nhận link đặt lại mật khẩu
          </p>
        </CardHeader>
        <CardBody className="px-6">
          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            {error && (
              <div className="rounded-lg bg-danger-50 p-3 text-sm text-danger">
                {error}
              </div>
            )}

            <Input
              {...register("email")}
              errorMessage={errors.email?.message}
              isInvalid={!!errors.email}
              label="Email"
              placeholder="email@example.com"
              type="email"
            />

            <Button
              className="w-full"
              color="primary"
              isLoading={isLoading}
              type="submit"
            >
              Gửi link đặt lại mật khẩu
            </Button>

            <div className="text-center">
              <Link href="/auth/signin" size="sm">
                ← Quay lại đăng nhập
              </Link>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
