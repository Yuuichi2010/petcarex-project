const db = require('../config/database');

// Lấy danh sách hóa đơn
exports.getAllInvoices = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search = '', fromDate = '', toDate = '', branchId = '' } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = ['1=1'];
    
    if (search) {
      whereConditions.push(`(kh.HoTen LIKE '%${search}%' OR kh.SDT LIKE '%${search}%' OR h.MaHoaDon LIKE '%${search}%')`);
    }
    if (fromDate) {
      whereConditions.push(`DATE(h.NgayLap) >= '${fromDate}'`);
    }
    if (toDate) {
      whereConditions.push(`DATE(h.NgayLap) <= '${toDate}'`);
    }
    if (branchId) {
      whereConditions.push(`h.MaChiNhanh = ${branchId}`);
    }

    const whereClause = 'WHERE ' + whereConditions.join(' AND ');

    const [invoices] = await db.query(`
      SELECT 
        h.MaHoaDon,
        h.NgayLap,
        h.TongTien,
        h.KhuyenMai,
        h.HinhThucThanhToan,
        kh.HoTen as TenKhachHang,
        kh.SDT,
        cn.Ten as TenChiNhanh,
        nv.HoTen as TenNhanVien,
        COUNT(DISTINCT cthd.MaChiTietHoaDon) as SoMon
      FROM HoaDon h
      LEFT JOIN KhachHang kh ON h.MaKhachHang = kh.MaKhachHang
      LEFT JOIN ChiNhanh cn ON h.MaChiNhanh = cn.MaChiNhanh
      LEFT JOIN NhanVien nv ON h.MaNhanVienBanHang = nv.MaNV
      LEFT JOIN ChiTietHoaDon cthd ON h.MaHoaDon = cthd.MaHoaDon
      ${whereClause}
      GROUP BY h.MaHoaDon
      ORDER BY h.NgayLap DESC
      LIMIT ${limit} OFFSET ${offset}
    `);

    const [total] = await db.query(`
      SELECT COUNT(DISTINCT h.MaHoaDon) as total
      FROM HoaDon h
      LEFT JOIN KhachHang kh ON h.MaKhachHang = kh.MaKhachHang
      LEFT JOIN ChiNhanh cn ON h.MaChiNhanh = cn.MaChiNhanh
      ${whereClause}
    `);

    res.json({
      success: true,
      data: invoices,
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

// Chi tiết hóa đơn
exports.getInvoiceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Thông tin hóa đơn
    const [invoice] = await db.query(`
      SELECT 
        h.*,
        kh.HoTen as TenKhachHang,
        kh.SDT,
        kh.Email,
        cn.Ten as TenChiNhanh,
        cn.DiaChi as DiaChiChiNhanh,
        nv.HoTen as TenNhanVien
      FROM HoaDon h
      LEFT JOIN KhachHang kh ON h.MaKhachHang = kh.MaKhachHang
      LEFT JOIN ChiNhanh cn ON h.MaChiNhanh = cn.MaChiNhanh
      LEFT JOIN NhanVien nv ON h.MaNhanVienBanHang = nv.MaNV
      WHERE h.MaHoaDon = ?
    `, [id]);

    if (invoice.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy hóa đơn'
      });
    }

    // Chi tiết hóa đơn
    const [details] = await db.query(`
      SELECT 
        cthd.*,
        dv.TenDV,
        CASE 
          WHEN dv.MaDV = 1 THEN sp.TenSanPham
          WHEN dv.MaDV = 2 THEN CONCAT('Kham benh - ', tc.TenThuCung)
          WHEN dv.MaDV = 3 THEN gt.TenGoi
        END as TenDichVu,
        CASE 
          WHEN dv.MaDV = 1 THEN ctmh.SoLuong
          ELSE 1
        END as SoLuong
      FROM ChiTietHoaDon cthd
      JOIN DichVu dv ON cthd.MaDV = dv.MaDV
      LEFT JOIN ChiTietHoaDonMuaHang ctmh ON cthd.MaChiTietHoaDon = ctmh.MaChiTietHoaDon
      LEFT JOIN SanPham sp ON ctmh.MaSanPham = sp.MaSanPham
      LEFT JOIN ChiTietHoaDonKhamBenh ctkb ON cthd.MaChiTietHoaDon = ctkb.MaChiTietHoaDon
      LEFT JOIN LichSuKhamBenh lskb ON ctkb.MaLichSuKhamBenh = lskb.MaLichSuKhamBenh
      LEFT JOIN ThuCung tc ON lskb.MaThuCung = tc.MaThuCung
      LEFT JOIN ChiTietHoaDonTiemPhong cttp ON cthd.MaChiTietHoaDon = cttp.MaChiTietHoaDon
      LEFT JOIN GoiTiem gt ON cttp.MaGoi = gt.MaGoi
      WHERE cthd.MaHoaDon = ?
    `, [id]);

    res.json({
      success: true,
      data: {
        invoice: invoice[0],
        details: details
      }
    });
  } catch (error) {
    next(error);
  }
};

// Tạo hóa đơn mới
exports.createInvoice = async (req, res, next) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { MaKhachHang, MaChiNhanh, MaNhanVienBanHang, HinhThucThanhToan, ChiTiet } = req.body;

    // Tính tổng tiền và khuyến mãi
    let tongTien = 0;
    ChiTiet.forEach(item => {
      tongTien += item.Gia * (item.SoLuong || 1);
    });

    // Lấy thông tin hội viên để tính khuyến mãi
    const [hoiVien] = await connection.query(
      'SELECT MaHangHV FROM HoiVien WHERE MaKhachHang = ?',
      [MaKhachHang]
    );

    let khuyenMai = 0;
    if (hoiVien.length > 0) {
      if (hoiVien[0].MaHangHV === 3) khuyenMai = tongTien * 0.15; // VIP 15%
      else if (hoiVien[0].MaHangHV === 2) khuyenMai = tongTien * 0.10; // Thân thiết 10%
    }

    // Tạo hóa đơn
    const [invoice] = await connection.query(`
      INSERT INTO HoaDon (NgayLap, TongTien, KhuyenMai, HinhThucThanhToan, MaKhachHang, MaNhanVienBanHang, MaChiNhanh)
      VALUES (NOW(), ?, ?, ?, ?, ?, ?)
    `, [tongTien, khuyenMai, HinhThucThanhToan, MaKhachHang, MaNhanVienBanHang, MaChiNhanh]);

    const maHoaDon = invoice.insertId;

    // Thêm chi tiết hóa đơn
    for (const item of ChiTiet) {
      const [detail] = await connection.query(`
        INSERT INTO ChiTietHoaDon (Gia, MaDV, MaHoaDon)
        VALUES (?, ?, ?)
      `, [item.Gia, item.MaDV, maHoaDon]);

      const maChiTiet = detail.insertId;

      // Xử lý theo loại dịch vụ
      if (item.MaDV === 1 && item.MaSanPham) { // Mua hàng
        await connection.query(`
          INSERT INTO ChiTietHoaDonMuaHang (MaChiTietHoaDon, SoLuong, MaSanPham)
          VALUES (?, ?, ?)
        `, [maChiTiet, item.SoLuong, item.MaSanPham]);
      } else if (item.MaDV === 2 && item.MaLichSuKhamBenh) { // Khám bệnh
        await connection.query(`
          INSERT INTO ChiTietHoaDonKhamBenh (MaChiTietHoaDon, MaLichSuKhamBenh)
          VALUES (?, ?)
        `, [maChiTiet, item.MaLichSuKhamBenh]);
      } else if (item.MaDV === 3 && item.MaGoi) { // Tiêm phòng
        await connection.query(`
          INSERT INTO ChiTietHoaDonTiemPhong (MaChiTietHoaDon, MaGoi)
          VALUES (?, ?)
        `, [maChiTiet, item.MaGoi]);
      }
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      data: {
        MaHoaDon: maHoaDon,
        message: 'Tạo hóa đơn thành công'
      }
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};