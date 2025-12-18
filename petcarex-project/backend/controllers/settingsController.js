const db = require('../config/database');

// Lấy tất cả cài đặt
exports.getAllSettings = async (req, res, next) => {
  try {
    const { loai = '' } = req.query;

    let whereClause = '1=1';
    if (loai) {
      whereClause += ` AND LoaiCaiDat = '${loai}'`;
    }

    const [settings] = await db.query(`
      SELECT * FROM CaiDatHeThong
      WHERE ${whereClause}
      ORDER BY LoaiCaiDat, TenCaiDat
    `);

    // Nhóm theo loại
    const grouped = settings.reduce((acc, setting) => {
      if (!acc[setting.LoaiCaiDat]) {
        acc[setting.LoaiCaiDat] = [];
      }
      acc[setting.LoaiCaiDat].push(setting);
      return acc;
    }, {});

    res.json({
      success: true,
      data: settings,
      grouped: grouped
    });
  } catch (error) {
    next(error);
  }
};

// Lấy cài đặt theo tên
exports.getSettingByName = async (req, res, next) => {
  try {
    const { name } = req.params;

    const [setting] = await db.query(`
      SELECT * FROM CaiDatHeThong WHERE TenCaiDat = ?
    `, [name]);

    if (setting.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy cài đặt'
      });
    }

    res.json({
      success: true,
      data: setting[0]
    });
  } catch (error) {
    next(error);
  }
};

// Cập nhật cài đặt
exports.updateSetting = async (req, res, next) => {
  try {
    const { name } = req.params;
    const { GiaTri } = req.body;

    await db.query(`
      UPDATE CaiDatHeThong
      SET GiaTri = ?, NgayCapNhat = CURRENT_TIMESTAMP
      WHERE TenCaiDat = ?
    `, [GiaTri, name]);

    res.json({
      success: true,
      message: 'Cập nhật cài đặt thành công'
    });
  } catch (error) {
    next(error);
  }
};

// Cập nhật nhiều cài đặt cùng lúc
exports.updateMultipleSettings = async (req, res, next) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { settings } = req.body; // Array of {TenCaiDat, GiaTri}

    for (const setting of settings) {
      await connection.query(`
        UPDATE CaiDatHeThong
        SET GiaTri = ?, NgayCapNhat = CURRENT_TIMESTAMP
        WHERE TenCaiDat = ?
      `, [setting.GiaTri, setting.TenCaiDat]);
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'Cập nhật cài đặt thành công'
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

// Khôi phục cài đặt mặc định
exports.resetToDefault = async (req, res, next) => {
  try {
    await db.query(`
      UPDATE CaiDatHeThong SET
        GiaTri = CASE TenCaiDat
          WHEN 'TenHeThong' THEN 'PetCareX'
          WHEN 'EmailHeThong' THEN 'admin@petcarex.vn'
          WHEN 'SDTHotline' THEN '1900-xxxx'
          WHEN 'TyLeDiemTichLuy' THEN '50000'
          WHEN 'UuDaiHangThanThiet' THEN '10'
          WHEN 'UuDaiHangVIP' THEN '15'
          WHEN 'ThoiGianMoCua' THEN '08:00'
          WHEN 'ThoiGianDongCua' THEN '20:00'
          WHEN 'BaoTriHeThong' THEN 'false'
          ELSE GiaTri
        END,
        NgayCapNhat = CURRENT_TIMESTAMP
    `);

    res.json({
      success: true,
      message: 'Đã khôi phục cài đặt mặc định'
    });
  } catch (error) {
    next(error);
  }
};

// Lấy lịch sử thao tác
exports.getActivityLog = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const [logs] = await db.query(`
      SELECT 
        ls.*,
        nv.HoTen as TenNhanVien
      FROM LichSuThaoTac ls
      LEFT JOIN NhanVien nv ON ls.MaNhanVien = nv.MaNV
      ORDER BY ls.ThoiGian DESC
      LIMIT ${limit} OFFSET ${offset}
    `);

    const [total] = await db.query(`SELECT COUNT(*) as total FROM LichSuThaoTac`);

    res.json({
      success: true,
      data: logs,
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