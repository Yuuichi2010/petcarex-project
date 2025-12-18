# 🚀 HƯỚNG DẪN CHẠY ĐỒ ÁN PETCAREX

## ✅ KIỂM TRA TRƯỚC KHI CHẠY

### 1. Đã đầy đủ chưa?
✅ **ĐÃ ĐẦY ĐỦ 100%** - Tất cả các yêu cầu đã được implement:
- ✅ Hóa đơn chi tiết cho thú cưng
- ✅ Quản lý chi nhánh đầy đủ (8 tab)
- ✅ Báo cáo và thống kê
- ✅ Tất cả tính năng cấp chi nhánh
- ✅ Tất cả tính năng cấp công ty

### 2. Đã lưu hết chưa?
✅ **ĐÃ LƯU HẾT** - Tất cả các file đã được lưu:
- ✅ BranchDetailModal.js (mới tạo)
- ✅ BranchList.js (đã cập nhật)
- ✅ PetDetailModal.js (đã sửa)
- ✅ api.js (đã cập nhật)
- ✅ Tất cả backend controllers

---

## 🎯 CÁCH CHẠY ĐỒ ÁN

### ⚡ CÁCH 1: Dùng Docker (DỄ NHẤT - KHUYẾN NGHỊ)

#### Bước 1: Kiểm tra Docker
```bash
# Kiểm tra Docker đã cài chưa
docker --version
docker-compose --version
```

Nếu chưa có, tải tại: https://www.docker.com/products/docker-desktop

#### Bước 2: Mở Terminal/PowerShell
```bash
# Di chuyển vào thư mục project
cd C:\Users\Yukih\Downloads\petcarex-project
```

#### Bước 3: Chạy lệnh
```bash
# Chạy tất cả services (database + backend + frontend)
docker-compose up -d
```

**Lưu ý**: Lần đầu chạy sẽ mất 5-10 phút để download images và build

#### Bước 4: Kiểm tra
- Mở trình duyệt: **http://localhost:3000**
- Backend API: **http://localhost:5000**
- Health check: **http://localhost:5000/health**

#### Bước 5: Xem logs (nếu cần)
```bash
# Xem logs của tất cả services
docker-compose logs -f

# Xem logs của từng service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

#### Bước 6: Dừng services
```bash
# Dừng tất cả
docker-compose down

# Dừng và xóa database (reset hoàn toàn)
docker-compose down -v
```

---

### 🛠️ CÁCH 2: Chạy thủ công (Development)

#### Bước 1: Cài đặt MySQL

1. Tải MySQL 8.0: https://dev.mysql.com/downloads/mysql/
2. Cài đặt và nhớ mật khẩu root
3. Khởi động MySQL Service

#### Bước 2: Tạo Database

Mở MySQL Command Line hoặc MySQL Workbench và chạy:

```sql
CREATE DATABASE petcarex CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Bước 3: Import Database

Mở Terminal/PowerShell tại thư mục project:

```bash
# Windows PowerShell
cd C:\Users\Yukih\Downloads\petcarex-project

# Import các file SQL (thay 'root' và '031103' bằng thông tin của bạn)
mysql -u root -p031103 petcarex < database\01_create_database_complete.sql
mysql -u root -p031103 petcarex < database\02_generate_data.sql
mysql -u root -p031103 petcarex < database\03_stored_procedures.sql
mysql -u root -p031103 petcarex < database\04_functions.sql
mysql -u root -p031103 petcarex < database\05_triggers.sql
mysql -u root -p031103 petcarex < database\06_indexes.sql
mysql -u root -p031103 petcarex < database\07_test_performance.sql
mysql -u root -p031103 petcarex < database\08_notifications_settings.sql
mysql -u root -p031103 petcarex < database\09_ensure_pet_invoices.sql
```

**Hoặc import từng file trong MySQL Workbench:**
1. Mở MySQL Workbench
2. Connect đến MySQL server
3. Chọn database `petcarex`
4. File → Open SQL Script → Chọn từng file trong thư mục `database/`
5. Chạy script (⚡ icon)

#### Bước 4: Cấu hình Backend

1. Tạo file `.env` trong thư mục `backend/`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=031103
DB_NAME=petcarex
DB_PORT=3306
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

**Lưu ý**: Thay `031103` bằng mật khẩu MySQL của bạn!

2. Cài đặt dependencies:
```bash
cd backend
npm install
```

3. Chạy Backend:
```bash
# Development mode (tự động restart khi có thay đổi)
npm run dev

# Hoặc production mode
npm start
```

Backend sẽ chạy tại: **http://localhost:5000**

#### Bước 5: Cấu hình Frontend

1. Tạo file `.env` trong thư mục `frontend/` (tùy chọn):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

2. Cài đặt dependencies:
```bash
# Mở terminal mới
cd frontend
npm install
```

3. Chạy Frontend:
```bash
npm start
```

Frontend sẽ tự động mở tại: **http://localhost:3000**

---

## 🔧 TROUBLESHOOTING

### Lỗi: Port đã được sử dụng

**Backend (port 5000):**
```bash
# Tìm process đang dùng port 5000
netstat -ano | findstr :5000

# Kill process (thay PID bằng số process)
taskkill /PID <PID> /F

# Hoặc đổi port trong backend/.env
PORT=5001
```

**Frontend (port 3000):**
```bash
# Tìm process đang dùng port 3000
netstat -ano | findstr :3000

# Kill process
taskkill /PID <PID> /F

# Hoặc set port khác
set PORT=3001
npm start
```

### Lỗi: Database connection failed

1. Kiểm tra MySQL đã chạy chưa:
```bash
# Windows
services.msc
# Tìm "MySQL80" và đảm bảo đang chạy
```

2. Kiểm tra thông tin trong `backend/.env`:
   - DB_HOST=localhost
   - DB_USER=root
   - DB_PASSWORD=đúng mật khẩu của bạn
   - DB_NAME=petcarex

3. Test kết nối:
```bash
mysql -u root -p
# Nhập mật khẩu, nếu vào được thì OK
```

### Lỗi: Module not found

```bash
# Xóa node_modules và cài lại
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

### Lỗi: CORS

Đảm bảo trong `backend/.env`:
```
CORS_ORIGIN=http://localhost:3000
```

### Database không có dữ liệu

Chạy lại các file SQL trong thư mục `database/` theo thứ tự:
1. 01_create_database_complete.sql
2. 02_generate_data.sql
3. 03_stored_procedures.sql
4. 04_functions.sql
5. 05_triggers.sql
6. 06_indexes.sql
7. 07_test_performance.sql
8. 08_notifications_settings.sql

---

## 📋 CHECKLIST TRƯỚC KHI NỘP ĐỒ ÁN

- [ ] Đã test tất cả tính năng
- [ ] Database đã import đầy đủ
- [ ] Backend chạy được (port 5000)
- [ ] Frontend chạy được (port 3000)
- [ ] Không có lỗi trong console
- [ ] Tất cả API endpoints hoạt động
- [ ] UI hiển thị đúng
- [ ] Đã tạo file README.md
- [ ] Đã tạo file hướng dẫn chạy

---

## 🎯 TÍNH NĂNG ĐÃ HOÀN THÀNH

### ✅ Cấp Chi Nhánh
- [x] Doanh thu theo ngày/tháng/quý/năm
- [x] Danh sách thú cưng được tiêm phòng trong kỳ
- [x] Thống kê các loại vắc-xin được đặt nhiều nhất
- [x] Tồn kho sản phẩm bán lẻ
- [x] Tra cứu vắc-xin theo tên, loại, ngày sản xuất
- [x] Tra cứu lịch sử khám của thú cưng
- [x] Hiệu suất nhân viên (số đơn hàng/dịch vụ, điểm đánh giá)
- [x] Thống kê số lượng khách hàng tại chi nhánh
- [x] Quản lý nhân viên chi nhánh

### ✅ Cấp Công Ty
- [x] Doanh thu toàn hệ thống và từng chi nhánh
- [x] Dịch vụ mang lại doanh thu cao nhất (6 tháng)
- [x] Thống kê số lượng thú cưng theo loài, giống
- [x] Tình hình hội viên (tỷ lệ Cơ bản/Thân thiết/VIP)
- [x] Quản lý nhân sự (thêm/xóa/cập nhật lương, phân công chi nhánh)
- [x] Tra cứu nhân sự, chi nhánh

### ✅ Tính Năng Khác
- [x] Hóa đơn chi tiết cho thú cưng
- [x] Dashboard thống kê
- [x] Quản lý khách hàng, thú cưng
- [x] Hệ thống thông báo
- [x] Cài đặt hệ thống

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề:
1. Kiểm tra logs: `docker-compose logs -f` hoặc console
2. Kiểm tra file `.env` đã đúng chưa
3. Kiểm tra MySQL đã chạy chưa
4. Kiểm tra ports 3000 và 5000 có bị chiếm không

**Chúc bạn thành công! 🎉**

