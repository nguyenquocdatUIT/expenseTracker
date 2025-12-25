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

import { useRegisterV1AuthRegisterPost } from "@/lib/api";

const registerSchema = z
  .object({
    full_name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
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

  const { mutate: registerUser, isPending } = useRegisterV1AuthRegisterPost();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError("");

    registerUser(
      {
        data: {
          full_name: data.full_name,
          email: data.email,
          password: data.password,
        },
      },
      {
        onSuccess: (response) => {
          console.log("Đăng ký thành công:", response);
          // Redirect to signin page với thông báo thành công
          router.push("/auth/signin?registered=true");
        },
        onError: (err: any) => {
          console.error("Lỗi đăng ký:", err);
          setError(
            err?.response?.data?.detail || "Đã xảy ra lỗi. Vui lòng thử lại.",
          );
        },
      },
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-800">
        <CardHeader className="flex flex-col gap-1 px-6 pt-6 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-t-lg">
          <h1 className="text-2xl font-bold">Đăng ký</h1>
          <p className="text-sm text-sky-50">Tạo tài khoản mới để bắt đầu</p>
        </CardHeader>
        <CardBody className="px-6 py-8">
          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <Input
              {...register("full_name")}
              classNames={{
                input: "bg-white dark:bg-gray-900",
                inputWrapper:
                  "border-gray-200 dark:border-gray-700 hover:border-sky-400",
              }}
              errorMessage={errors.full_name?.message}
              isInvalid={!!errors.full_name}
              label="Họ và tên"
              placeholder="Nguyễn Văn A"
            />

            <Input
              {...register("email")}
              classNames={{
                input: "bg-white dark:bg-gray-900",
                inputWrapper:
                  "border-gray-200 dark:border-gray-700 hover:border-sky-400",
              }}
              errorMessage={errors.email?.message}
              isInvalid={!!errors.email}
              label="Email"
              placeholder="email@example.com"
              type="email"
            />

            <Input
              {...register("password")}
              classNames={{
                input: "bg-white dark:bg-gray-900",
                inputWrapper:
                  "border-gray-200 dark:border-gray-700 hover:border-sky-400",
              }}
              errorMessage={errors.password?.message}
              isInvalid={!!errors.password}
              label="Mật khẩu"
              placeholder="Nhập mật khẩu"
              type="password"
            />

            <Input
              {...register("confirmPassword")}
              classNames={{
                input: "bg-white dark:bg-gray-900",
                inputWrapper:
                  "border-gray-200 dark:border-gray-700 hover:border-sky-400",
              }}
              errorMessage={errors.confirmPassword?.message}
              isInvalid={!!errors.confirmPassword}
              label="Xác nhận mật khẩu"
              placeholder="Nhập lại mật khẩu"
              type="password"
            />

            <Button
              className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              isLoading={isPending}
              type="submit"
            >
              Đăng ký
            </Button>
          </form>
        </CardBody>
        <CardFooter className="px-6 pb-6 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Đã có tài khoản?{" "}
            <Link
              className="text-sky-600 hover:text-sky-700 font-semibold"
              href="/auth/signin"
              size="sm"
            >
              Đăng nhập
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
