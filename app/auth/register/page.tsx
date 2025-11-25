"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Link } from "@heroui/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const registerSchema = z
  .object({
    name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Đã xảy ra lỗi");
        return;
      }

      // Redirect to signin page
      router.push("/auth/signin?registered=true");
    } catch (err) {
      setError("Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-1 px-6 pt-6">
          <h1 className="text-2xl font-bold">Đăng ký</h1>
          <p className="text-sm text-default-500">
            Tạo tài khoản mới để bắt đầu
          </p>
        </CardHeader>
        <CardBody className="px-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            {error && (
              <div className="rounded-lg bg-danger-50 p-3 text-sm text-danger">
                {error}
              </div>
            )}

            <Input
              {...register("name")}
              label="Họ và tên"
              placeholder="Nguyễn Văn A"
              isInvalid={!!errors.name}
              errorMessage={errors.name?.message}
            />

            <Input
              {...register("email")}
              label="Email"
              type="email"
              placeholder="email@example.com"
              isInvalid={!!errors.email}
              errorMessage={errors.email?.message}
            />

            <Input
              {...register("password")}
              label="Mật khẩu"
              type="password"
              placeholder="Nhập mật khẩu"
              isInvalid={!!errors.password}
              errorMessage={errors.password?.message}
            />

            <Input
              {...register("confirmPassword")}
              label="Xác nhận mật khẩu"
              type="password"
              placeholder="Nhập lại mật khẩu"
              isInvalid={!!errors.confirmPassword}
              errorMessage={errors.confirmPassword?.message}
            />

            <Button
              type="submit"
              color="primary"
              isLoading={isLoading}
              className="w-full"
            >
              Đăng ký
            </Button>
          </form>
        </CardBody>
        <CardFooter className="px-6 pb-6">
          <p className="text-sm text-default-500">
            Đã có tài khoản?{" "}
            <Link href="/auth/signin" size="sm">
              Đăng nhập
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
