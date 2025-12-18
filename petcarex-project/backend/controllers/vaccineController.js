const db = require('../config/database');

// Lấy danh sách vắc-xin
exports.getAllVaccines = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search = '', loai = '' } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = ['1=1'];
    
    if (search) {
      whereConditions.push(`TenVacXin LIKE '%${search}%'`);
    }
    if (loai) {
      whereConditions.push(`LoaiVacXin = '${loai}'`);
    }

    const whereClause = 'WHERE ' + whereConditions.join(' AND ');

    const [vaccines] = await db.query(`
      SELECT 
        vx.*,
        COUNT(DISTINCT mt.MaMuiTiem) as SoMuiTiem,
        DATEDIFF(CURRENT_DATE, NgaySanXuat) as SoNgayTuSanXuat
      FROM VacXin vx
      LEFT JOIN MuiTiem mt ON vx.MaVacXin = mt.MaVacXin
      ${whereClause}
      GROUP BY vx.MaVacXin
      ORDER BY vx.MaVacXin DESC
      LIMIT ${limit} OFFSET ${offset}
    `);

    const [total] = await db.query(`
      SELECT COUNT(*) as total FROM VacXin ${whereClause}
    `);

    res.json({
      success: true,
      data: vaccines,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total[0].total,
        totalPages: Math.ceil(total[0].total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Tra cứu vắc-xin
exports.searchVaccines = async (req, res, next) => {
  try {
    const { ten, loai, fromDate, toDate } = req.query;

    const [vaccines] = await db.query(`
      CALL sp_TraCuuVacXin(?, ?, ?, ?)
    `, [ten || null, loai || null, fromDate || null, toDate || null]);

    res.json({
      success: true,
      data: vaccines[0]
    });
  } catch (error) {
    next(error);
  }
};

// Thống kê vắc-xin phổ biến
exports.getPopularVaccines = async (req, res, next) => {
  try {
    const { branchId, fromDate, toDate, top = 10 } = req.query;

    const [vaccines] = await db.query(`
      CALL sp_ThongKeVacXinPhoBien(?, ?, ?, ?)
    `, [branchId, fromDate, toDate, top]);

    res.json({
      success: true,
      data: vaccines[0]
    });
  } catch (error) {
    next(error);
  }
};

// Thêm vắc-xin
exports.createVaccine = async (req, res, next) => {
  try {
    const { TenVacXin, LoaiVacXin, NgaySanXuat, SoLuongTonKho } = req.body;

    const [result] = await db.query(`
      INSERT INTO VacXin (TenVacXin, LoaiVacXin, NgaySanXuat, SoLuongTonKho)
      VALUES (?, ?, ?, ?)
    `, [TenVacXin, LoaiVacXin, NgaySanXuat, SoLuongTonKho]);

    res.status(201).json({
      success: true,
      data: {
        MaVacXin: result.insertId,
        message: 'Thêm vắc-xin thành công'
      }
    });
  } catch (error) {
    next(error);
  }
};

// Cập nhật vắc-xin
exports.updateVaccine = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { TenVacXin, LoaiVacXin, NgaySanXuat, SoLuongTonKho } = req.body;

    await db.query(`
      UPDATE VacXin
      SET TenVacXin = ?, LoaiVacXin = ?, NgaySanXuat = ?, SoLuongTonKho = ?
      WHERE MaVacXin = ?
    `, [TenVacXin, LoaiVacXin, NgaySanXuat, SoLuongTonKho, id]);

    res.json({
      success: true,
      message: 'Cập nhật vắc-xin thành công'
    });
  } catch (error) {
    next(error);
  }
};