const db = require('../config/database');

// Lấy tất cả thông báo
exports.getAllNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status = '' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '1=1';
    if (status) {
      whereClause += ` AND TrangThai = '${status}'`;
    }

    const [notifications] = await db.query(`
      SELECT * FROM ThongBao
      WHERE ${whereClause}
      ORDER BY 
        CASE DoUuTien
          WHEN 'Cao' THEN 1
          WHEN 'Binh thuong' THEN 2
          WHEN 'Thap' THEN 3
        END,
        NgayTao DESC
      LIMIT ${limit} OFFSET ${offset}
    `);

    const [total] = await db.query(`
      SELECT COUNT(*) as total FROM ThongBao WHERE ${whereClause}
    `);

    // Đếm số thông báo chưa đọc
    const [unreadCount] = await db.query(`
      SELECT COUNT(*) as count FROM ThongBao WHERE TrangThai = 'Chua doc'
    `);

    res.json({
      success: true,
      data: notifications,
      unreadCount: unreadCount[0].count,
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

// Lấy thông báo chưa đọc
exports.getUnreadNotifications = async (req, res, next) => {
  try {
    const [notifications] = await db.query(`
      SELECT * FROM ThongBao
      WHERE TrangThai = 'Chua doc'
      ORDER BY 
        CASE DoUuTien
          WHEN 'Cao' THEN 1
          WHEN 'Binh thuong' THEN 2
          WHEN 'Thap' THEN 3
        END,
        NgayTao DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

// Đánh dấu đã đọc
exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    await db.query(`
      UPDATE ThongBao SET TrangThai = 'Da doc' WHERE MaThongBao = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Đã đánh dấu thông báo là đã đọc'
    });
  } catch (error) {
    next(error);
  }
};

// Đánh dấu tất cả đã đọc
exports.markAllAsRead = async (req, res, next) => {
  try {
    await db.query(`
      UPDATE ThongBao SET TrangThai = 'Da doc' WHERE TrangThai = 'Chua doc'
    `);

    res.json({
      success: true,
      message: 'Đã đánh dấu tất cả thông báo là đã đọc'
    });
  } catch (error) {
    next(error);
  }
};

// Tạo thông báo mới
exports.createNotification = async (req, res, next) => {
  try {
    const { TieuDe, NoiDung, LoaiThongBao, DoUuTien, MaNguoiNhan, MaLienKet } = req.body;

    const [result] = await db.query(`
      INSERT INTO ThongBao (TieuDe, NoiDung, LoaiThongBao, DoUuTien, MaNguoiNhan, MaLienKet)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [TieuDe, NoiDung, LoaiThongBao, DoUuTien, MaNguoiNhan || null, MaLienKet || null]);

    res.status(201).json({
      success: true,
      data: {
        MaThongBao: result.insertId,
        message: 'Tạo thông báo thành công'
      }
    });
  } catch (error) {
    next(error);
  }
};

// Xóa thông báo
exports.deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    await db.query(`DELETE FROM ThongBao WHERE MaThongBao = ?`, [id]);

    res.json({
      success: true,
      message: 'Xóa thông báo thành công'
    });
  } catch (error) {
    next(error);
  }
};

// Xóa tất cả thông báo đã đọc
exports.deleteAllRead = async (req, res, next) => {
  try {
    await db.query(`DELETE FROM ThongBao WHERE TrangThai = 'Da doc'`);

    res.json({
      success: true,
      message: 'Đã xóa tất cả thông báo đã đọc'
    });
  } catch (error) {
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const { limit = 20, branchId, severity, unreadOnly } = req.query;
    const where = [];
    const params = [];
    if (branchId) {
      where.push('MaChiNhanh = ?');
      params.push(parseInt(branchId));
    }
    if (severity && ['warn', 'info'].includes(severity)) {
      where.push('MucDo = ?');
      params.push(severity);
    }
    if (String(unreadOnly) === 'true') {
      where.push('DaDoc = 0');
    }
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await db.query(
      `SELECT Id, TieuDe, NoiDung, MucDo, DaDoc, CreatedAt, MaChiNhanh
       FROM ThongBao
       ${whereClause}
       ORDER BY CreatedAt DESC
       LIMIT ?`,
      [...params, parseInt(limit)]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { TieuDe, NoiDung, MucDo, MaChiNhanh } = req.body;
    const [result] = await db.query(
      `INSERT INTO ThongBao (TieuDe, NoiDung, MucDo, MaChiNhanh)
       VALUES (?, ?, ?, ?)`,
      [TieuDe, NoiDung, MucDo || 'info', MaChiNhanh || null]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    next(error);
  }
};

exports.markRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query(`UPDATE ThongBao SET DaDoc = 1 WHERE Id = ?`, [id]);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

exports.markAllRead = async (req, res, next) => {
  try {
    await db.query(`UPDATE ThongBao SET DaDoc = 1`);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

exports.deleteOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query(`DELETE FROM ThongBao WHERE Id = ?`, [id]);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

exports.deleteReadAll = async (req, res, next) => {
  try {
    await db.query(`DELETE FROM ThongBao WHERE DaDoc = 1`);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
