const db = require('../config/database');

// Lấy danh sách sản phẩm
exports.getAllProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search = '', loai = '' } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = ['1=1'];
    
    if (search) {
      whereConditions.push(`TenSanPham LIKE '%${search}%'`);
    }
    if (loai) {
      whereConditions.push(`LoaiSanPham = '${loai}'`);
    }

    const whereClause = 'WHERE ' + whereConditions.join(' AND ');

    const [products] = await db.query(`
      SELECT * FROM SanPham
      ${whereClause}
      ORDER BY MaSanPham DESC
      LIMIT ${limit} OFFSET ${offset}
    `);

    const [total] = await db.query(`
      SELECT COUNT(*) as total FROM SanPham ${whereClause}
    `);

    res.json({
      success: true,
      data: products,
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

// Thêm sản phẩm
exports.createProduct = async (req, res, next) => {
  try {
    const { TenSanPham, LoaiSanPham, GiaBan, SoLuongTonKho } = req.body;

    const [result] = await db.query(`
      INSERT INTO SanPham (TenSanPham, LoaiSanPham, GiaBan, SoLuongTonKho)
      VALUES (?, ?, ?, ?)
    `, [TenSanPham, LoaiSanPham, GiaBan, SoLuongTonKho]);

    res.status(201).json({
      success: true,
      data: {
        MaSanPham: result.insertId,
        message: 'Thêm sản phẩm thành công'
      }
    });
  } catch (error) {
    next(error);
  }
};

// Cập nhật sản phẩm
exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { TenSanPham, LoaiSanPham, GiaBan, SoLuongTonKho } = req.body;

    await db.query(`
      UPDATE SanPham
      SET TenSanPham = ?, LoaiSanPham = ?, GiaBan = ?, SoLuongTonKho = ?
      WHERE MaSanPham = ?
    `, [TenSanPham, LoaiSanPham, GiaBan, SoLuongTonKho, id]);

    res.json({
      success: true,
      message: 'Cập nhật sản phẩm thành công'
    });
  } catch (error) {
    next(error);
  }
};

// Xóa sản phẩm
exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM SanPham WHERE MaSanPham = ?', [id]);
    res.json({
  success: true,
  message: 'Xóa sản phẩm thành công'
});
} catch (error) {
next(error);
}
};