"use client";

import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Link } from "@heroui/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLoginV1AuthLoginPost } from "@/lib/api";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const signinSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

type SigninFormData = z.infer<typeof signinSchema>;

export default function SigninPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const { login: authLogin } = useAuth();

  const { mutate: login, isPending } = useLoginV1AuthLoginPost();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
  });

  const onSubmit = async (data: SigninFormData) => {
    setError("");

    login(
      { data },
      {
        onSuccess: (response) => {
          // Lưu token và update auth context
          authLogin(response.access_token);
          console.log("Đăng nhập thành công:", response.user);
        },
        onError: (err: any) => {
          console.error("Lỗi đăng nhập:", err);
          setError(
            err?.response?.data?.detail || "Email hoặc mật khẩu không đúng"
          );
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-800">
        <CardHeader className="flex flex-col gap-1 px-6 pt-6 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-t-lg">
          <h1 className="text-2xl font-bold">Đăng nhập</h1>
          <p className="text-sm text-sky-50">Đăng nhập vào tài khoản của bạn</p>
        </CardHeader>
        <CardBody className="px-6 py-8">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <Input
              {...register("email")}
              label="Email"
              type="email"
              placeholder="email@example.com"
              isInvalid={!!errors.email}
              errorMessage={errors.email?.message}
              classNames={{
                input: "bg-white dark:bg-gray-900",
                inputWrapper:
                  "border-gray-200 dark:border-gray-700 hover:border-sky-400",
              }}
            />

            <Input
              {...register("password")}
              label="Mật khẩu"
              type="password"
              placeholder="Nhập mật khẩu"
              isInvalid={!!errors.password}
              errorMessage={errors.password?.message}
              classNames={{
                input: "bg-white dark:bg-gray-900",
                inputWrapper:
                  "border-gray-200 dark:border-gray-700 hover:border-sky-400",
              }}
            />

            <div className="flex justify-end">
              <Link
                href="/auth/forgot-password"
                size="sm"
                className="text-sky-600 hover:text-sky-700"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              isLoading={isPending}
            >
              Đăng nhập
            </Button>
          </form>
        </CardBody>
        <CardFooter className="px-6 pb-6 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Chưa có tài khoản?{" "}
            <Link
              href="/auth/register"
              size="sm"
              className="text-sky-600 hover:text-sky-700 font-semibold"
            >
              Đăng ký ngay
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
