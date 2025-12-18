const db = require('../config/database');

// Doanh thu toàn hệ thống
exports.getSystemRevenue = async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;

    const [revenue] = await db.query(`
      CALL sp_DoanhThuToanHeThong(?, ?)
    `, [fromDate, toDate]);

    res.json({
      success: true,
      data: revenue[0]
    });
  } catch (error) {
    next(error);
  }
};

// Dịch vụ doanh thu cao nhất
exports.getTopServices = async (req, res, next) => {
  try {
    const { months = 6 } = req.query;

    const [services] = await db.query(`
      CALL sp_DichVuDoanhThuCao(?)
    `, [months]);

    res.json({
      success: true,
      data: services[0]
    });
  } catch (error) {
    next(error);
  }
};

// Thống kê thú cưng
exports.getPetStatistics = async (req, res, next) => {
  try {
    const [stats] = await db.query(`
      CALL sp_ThongKeThuCung()
    `);

    res.json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    next(error);
  }
};

// Tình hình hội viên
exports.getMembershipStatus = async (req, res, next) => {
  try {
    const [status] = await db.query(`
      CALL sp_TinhHinhHoiVien()
    `);

    res.json({
      success: true,
      data: status[0]
    });
  } catch (error) {
    next(error);
  }
};

// Thống kê khách hàng chi nhánh
exports.getBranchCustomers = async (req, res, next) => {
  try {
    const { branchId } = req.params;

    const [customers] = await db.query(`
      CALL sp_ThongKeKhachHang(?)
    `, [branchId]);

    res.json({
      success: true,
      data: {
        total: customers[0],
        inactive: customers[1]
      }
    });
  } catch (error) {
    next(error);
  }
};

// Danh sách thú cưng tiêm phòng
exports.getVaccinatedPets = async (req, res, next) => {
  try {
    const { branchId, fromDate, toDate } = req.query;

    const [pets] = await db.query(`
      CALL sp_DanhSachThuCungTiemPhong(?, ?, ?)
    `, [branchId, fromDate, toDate]);

    res.json({
      success: true,
      data: pets[0]
    });
  } catch (error) {
    next(error);
  }
};

// Tồn kho sản phẩm
exports.getInventory = async (req, res, next) => {
  try {
    const { loai } = req.query;

    const [inventory] = await db.query(`
      CALL sp_TonKhoSanPham(?)
    `, [loai || null]);

    res.json({
      success: true,
      data: inventory[0]
    });
  } catch (error) {
    next(error);
  }
};