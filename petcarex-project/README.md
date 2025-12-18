# PetCareX - Hệ Thống Quản Lý Chăm Sóc Thú Cưng

## 📋 Yêu Cầu Hệ Thống

- **Node.js**: >= 14.x
- **MySQL**: >= 8.0
- **npm** hoặc **yarn**
- **Docker** và **Docker Compose** (nếu dùng Docker)

## 🚀 Cách 1: Chạy bằng Docker (Khuyến nghị)

### Bước 1: Cài đặt Docker
Đảm bảo bạn đã cài đặt [Docker Desktop](https://www.docker.com/products/docker-desktop)

### Bước 2: Chạy toàn bộ hệ thống
```bash
# Từ thư mục gốc của project
docker-compose up -d
```

Lệnh này sẽ:
- Tạo và chạy MySQL database (port 3307)
- Tạo và chạy Backend API (port 5000)
- Tạo và chạy Frontend (port 3000)
- Tự động import database từ thư mục `database/`

### Bước 3: Truy cập ứng dụng
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

### Các lệnh Docker hữu ích:
```bash
# Xem logs
docker-compose logs -f

# Dừng tất cả services
docker-compose down

# Dừng và xóa volumes (xóa database)
docker-compose down -v

# Rebuild images
docker-compose up -d --build
```

---

## 🛠️ Cách 2: Chạy thủ công (Development)

### Bước 1: Cài đặt MySQL

1. Cài đặt MySQL Server 8.0
2. Tạo database:
```sql
CREATE DATABASE petcarex CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Bước 2: Import Database

Chạy các file SQL theo thứ tự trong thư mục `database/`:
```bash
# Vào MySQL
mysql -u root -p petcarex < database/01_create_database_complete.sql
mysql -u root -p petcarex < database/02_generate_data.sql
mysql -u root -p petcarex < database/03_stored_procedures.sql
mysql -u root -p petcarex < database/04_functions.sql
mysql -u root -p petcarex < database/05_triggers.sql
mysql -u root -p petcarex < database/06_indexes.sql
mysql -u root -p petcarex < database/07_test_performance.sql
mysql -u root -p petcarex < database/08_notifications_settings.sql
mysql -u root -p petcarex < database/09_ensure_pet_invoices.sql
```

**Lưu ý**: File `09_ensure_pet_invoices.sql` đảm bảo mỗi thú cưng có hóa đơn để test tính năng hiển thị hóa đơn.

Hoặc import tất cả cùng lúc:
```bash
mysql -u root -p petcarex < database/01_create_database_complete.sql
mysql -u root -p petcarex < database/02_generate_data.sql
mysql -u root -p petcarex < database/03_stored_procedures.sql
mysql -u root -p petcarex < database/04_functions.sql
mysql -u root -p petcarex < database/05_triggers.sql
mysql -u root -p petcarex < database/06_indexes.sql
mysql -u root -p petcarex < database/07_test_performance.sql
mysql -u root -p petcarex < database/08_notifications_settings.sql
```

### Bước 3: Cấu hình Backend

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

Backend sẽ chạy tại: http://localhost:5000

### Bước 4: Cấu hình Frontend

1. Tạo file `.env` trong thư mục `frontend/` (tùy chọn):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

2. Cài đặt dependencies:
```bash
cd frontend
npm install
```

3. Chạy Frontend:
```bash
npm start
```

Frontend sẽ tự động mở tại: http://localhost:3000

---

## 📁 Cấu Trúc Project

```
petcarex-project/
├── backend/              # Node.js + Express API
│   ├── config/          # Cấu hình database
│   ├── controllers/     # Controllers xử lý logic
│   ├── middleware/      # Middleware (error handler)
│   ├── routes/          # Định nghĩa routes
│   └── server.js        # Entry point
├── frontend/            # React App
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API services
│   │   └── App.js       # Main component
│   └── public/          # Static files
├── database/            # SQL scripts
│   ├── 01_create_database_complete.sql
│   ├── 02_generate_data.sql
│   └── ...
└── docker-compose.yml   # Docker configuration
```

## 🔧 Troubleshooting

### Lỗi kết nối database
- Kiểm tra MySQL đã chạy chưa
- Kiểm tra thông tin trong file `.env` (backend)
- Kiểm tra port MySQL (mặc định 3306)

### Lỗi CORS
- Đảm bảo `CORS_ORIGIN` trong backend `.env` trỏ đúng frontend URL
- Mặc định: `http://localhost:3000`

### Lỗi port đã được sử dụng
- Backend: Đổi `PORT` trong `.env` (mặc định 5000)
- Frontend: Đổi port bằng cách set `PORT=3001` trước khi chạy `npm start`

### Database không có dữ liệu
- Chạy lại các file SQL trong thư mục `database/`
- Kiểm tra database name trong `.env` phải đúng

## 📝 API Endpoints

### Health Check
- `GET /health` - Kiểm tra server

### Dashboard
- `GET /api/dashboard/stats` - Thống kê tổng quan
- `GET /api/dashboard/appointments` - Lịch hẹn gần đây
- `GET /api/dashboard/revenue-by-branch` - Doanh thu theo chi nhánh

### Customers
- `GET /api/customers` - Danh sách khách hàng
- `GET /api/customers/:id` - Chi tiết khách hàng
- `POST /api/customers` - Tạo khách hàng mới
- `PUT /api/customers/:id` - Cập nhật khách hàng
- `DELETE /api/customers/:id` - Xóa khách hàng

### Pets
- `GET /api/pets` - Danh sách thú cưng
- `GET /api/pets/:id` - Chi tiết thú cưng
- `GET /api/pets/:id/medical-history` - Lịch sử khám bệnh
- `GET /api/pets/:id/vaccination-history` - Lịch sử tiêm chủng
- `GET /api/pets/:id/invoices` - Hóa đơn của thú cưng
- `POST /api/pets` - Tạo thú cưng mới
- `PUT /api/pets/:id` - Cập nhật thú cưng
- `DELETE /api/pets/:id` - Xóa thú cưng

### Invoices
- `GET /api/invoices` - Danh sách hóa đơn
- `GET /api/invoices/:id` - Chi tiết hóa đơn
- `POST /api/invoices` - Tạo hóa đơn mới

Và nhiều endpoints khác...

## 🎯 Tính Năng Chính

- ✅ Quản lý khách hàng và thú cưng
- ✅ Quản lý chi nhánh
- ✅ Quản lý hóa đơn và dịch vụ
- ✅ Lịch sử khám bệnh và tiêm chủng
- ✅ Dashboard thống kê
- ✅ Hệ thống thông báo
- ✅ Báo cáo và phân tích
- ✅ Cài đặt hệ thống

## 📞 Hỗ Trợ

Nếu gặp vấn đề, vui lòng kiểm tra:
1. Logs của backend và frontend
2. Console của browser (F12)
3. Kết nối database
4. File `.env` đã cấu hình đúng chưa

---

**Chúc bạn code vui vẻ! 🐾**

