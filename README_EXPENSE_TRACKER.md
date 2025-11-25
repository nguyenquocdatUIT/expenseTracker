# Expense Tracker - Ứng dụng Quản lý Chi tiêu

Ứng dụng quản lý chi tiêu cá nhân với đầy đủ tính năng theo dõi giao dịch, ngân sách, phân tích và báo cáo.

## Tính năng

### 1. Authentication & User Management

- ✅ Đăng ký tài khoản mới (email + mật khẩu)
- ✅ Đăng nhập / đăng xuất
- ✅ Làm mới token (JWT)
- ✅ Forgot password / Reset password
- ✅ User profile management

### 2. Quản lý Giao dịch (Transactions)

- ✅ Thêm giao dịch mới (chi tiêu / thu nhập / chuyển khoản)
- ✅ Chỉnh sửa / xoá giao dịch
- ✅ Lọc & tìm kiếm giao dịch theo ngày, danh mục, ví
- ✅ Xem giao dịch theo thời gian (ngày / tuần / tháng)
- ✅ Tự động cập nhật số dư ví khi thêm/sửa/xóa giao dịch

### 3. Quản lý Ngân sách (Budgets)

- ✅ Tạo ngân sách theo danh mục
- ✅ Ngân sách định kỳ (daily/weekly/monthly/quarterly/yearly)
- ✅ Hiển thị tiến độ chi tiêu (đã dùng bao nhiêu %)
- ✅ Cảnh báo khi gần hoặc vượt ngưỡng
- ✅ Tổng kết ngân sách theo thời gian

### 4. Giao dịch Định kỳ (Recurring Transactions)

- ✅ Tạo giao dịch lặp lại (hàng ngày / tuần / tháng / năm)
- ✅ Tự động thêm vào danh sách chi tiêu
- ✅ Thông báo trước khi giao dịch được thêm
- ✅ API endpoint để execute recurring transactions (dùng cho cron job)

### 5. Phân tích & Báo cáo (Analytics & Insights)

- ✅ Biểu đồ theo danh mục
- ✅ Biểu đồ xu hướng chi tiêu theo tháng
- ✅ Phân tích top danh mục tốn kém nhất
- ✅ Xuất báo cáo CSV
- ✅ Summary: Income/Expense/Balance

### 6. Quản lý Ví (Wallets)

- ✅ Hỗ trợ nhiều loại ví (Cash, Bank Account, Credit Card, E-Wallet, Investment)
- ✅ Tự động tính số dư ví
- ✅ Transfer giữa các ví

### 7. Danh mục (Categories)

- ✅ Danh mục mặc định tự động tạo khi đăng ký
- ✅ Tạo danh mục tùy chỉnh
- ✅ Phân loại thu nhập và chi tiêu

## Tech Stack

- **Framework**: Next.js 15.3.1 (App Router)
- **Database**: PostgreSQL với Prisma ORM
- **Authentication**: NextAuth.js v5 (Beta)
- **UI Components**: HeroUI (NextUI fork)
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Date Utilities**: date-fns
- **Export**: csv-stringify, jsPDF

## Cài đặt

### 1. Clone repository và cài đặt dependencies

```bash
yarn install
```

### 2. Chạy development server

```bash
yarn dev
```

Ứng dụng sẽ chạy tại: http://localhost:3000

## Deployment

### Environment Variables

Đảm bảo set đúng các biến môi trường trên production:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `CRON_SECRET`
- Email settings (nếu dùng forgot password)

### Build

```bash
npm run build
npm run start
```

## TODO / Upcoming Features

- [ ] UI cho Transaction Management
- [ ] UI cho Budget Management
- [ ] Dashboard với Charts (Recharts)
- [ ] Export PDF reports (jsPDF)
- [ ] Email notifications
- [ ] Multi-currency support
- [ ] Shared budgets/wallets
- [ ] Mobile app (React Native)

## License

MIT
