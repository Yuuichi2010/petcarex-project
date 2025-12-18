import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../Common/Modal';
import { getCustomerById, getInvoiceById } from '../../services/api';
import { Phone, Mail, CreditCard, Calendar, Award, Heart, FileText } from 'lucide-react';

const CustomerDetailModal = ({ customerId, onClose }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceDetails, setInvoiceDetails] = useState(null);

  const loadCustomerDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getCustomerById(customerId);
      setCustomer(response.data);
    } catch (error) {
      console.error('Error loading customer detail:', error);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    loadCustomerDetail();
  }, [loadCustomerDetail]);

  if (loading) {
    return (
      <Modal isOpen={true} onClose={onClose} title="Chi Tiết Khách Hàng" size="lg">
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </Modal>
    );
  }

  if (!customer) return null;

  return (
    <Modal isOpen={true} onClose={onClose} title="Chi Tiết Khách Hàng" size="lg">
      <div className="space-y-6">
        {/* Thông tin cơ bản */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {customer.customer.HoTen.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{customer.customer.HoTen}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone size={16} />
                  <span>{customer.customer.SDT}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail size={16} />
                  <span>{customer.customer.Email || 'Chưa có'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <CreditCard size={16} />
                  <span>{customer.customer.CCCD || 'Chưa có'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={16} />
                  <span>{customer.customer.NgaySinh ? new Date(customer.customer.NgaySinh).toLocaleDateString('vi-VN') : 'Chưa có'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Thông tin hội viên */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border-2 border-purple-200 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Award className="text-purple-600" size={24} />
              <span className="text-sm text-gray-600">Hạng Hội Viên</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{customer.customer.TenHangHV || 'Cơ bản'}</p>
          </div>
          <div className="bg-white border-2 border-pink-200 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Award className="text-pink-600" size={24} />
              <span className="text-sm text-gray-600">Điểm Tích Lũy</span>
            </div>
            <p className="text-2xl font-bold text-pink-600">{customer.customer.DiemTichLuy || 0}</p>
          </div>
          <div className="bg-white border-2 border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="text-blue-600" size={24} />
              <span className="text-sm text-gray-600">Tổng Chi Tiêu</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(customer.customer.TongChiTieu || 0)}
            </p>
          </div>
        </div>

        {/* Danh sách thú cưng */}
        <div>
          <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Heart className="text-pink-500" size={24} />
            Thú Cưng ({customer.pets.length})
          </h4>
          {customer.pets.length === 0 ? (
            <p className="text-gray-500 text-center py-6">Chưa có thú cưng nào</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {customer.pets.map(pet => (
                <div key={pet.MaThuCung} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                      🐾
                    </div>
                    <div className="flex-1">
                      <h5 className="font-bold text-gray-800">{pet.TenThuCung}</h5>
                      <p className="text-sm text-gray-600">{pet.LoaiThuCung} - {pet.GiongThuCung}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {pet.GioiTinhThuCung} • {pet.NgaySinh ? new Date(pet.NgaySinh).toLocaleDateString('vi-VN') : 'N/A'}
                      </p>
                      <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                        pet.TinhTrangSucKhoe === 'Tot' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {pet.TinhTrangSucKhoe}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lịch sử hóa đơn gần đây */}
        <div>
          <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="text-blue-500" size={24} />
            Hóa Đơn Gần Đây ({customer.recentInvoices.length})
          </h4>
          {customer.recentInvoices.length === 0 ? (
            <p className="text-gray-500 text-center py-6">Chưa có hóa đơn nào</p>
          ) : (
            <div className="space-y-3">
              {customer.recentInvoices.map(invoice => (
                <div
                  key={invoice.MaHoaDon}
                  className={`bg-white border rounded-xl p-4 hover:shadow-md transition-shadow ${selectedInvoice === invoice.MaHoaDon ? 'border-purple-500' : 'border-gray-200'}`}
                  onClick={async () => {
                    try {
                      const res = await getInvoiceById(invoice.MaHoaDon);
                      setInvoiceDetails(res.data);
                      setSelectedInvoice(invoice.MaHoaDon);
                    } catch (e) {
                      console.error('Error loading invoice details:', e);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">Hóa đơn #{invoice.MaHoaDon}</p>
                      <p className="text-sm text-gray-600">{invoice.TenChiNhanh}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(invoice.NgayLap).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-purple-600">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(invoice.TongTien - invoice.KhuyenMai)}
                      </p>
                      <p className="text-xs text-gray-500">{invoice.HinhThucThanhToan}</p>
                    </div>
                  </div>
                  {selectedInvoice === invoice.MaHoaDon && invoiceDetails && (
                    <div className="mt-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-bold text-gray-800">Chi tiết hóa đơn #{selectedInvoice}</h5>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedInvoice(null); setInvoiceDetails(null); }}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="bg-white rounded-lg p-3 space-y-2">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Khách hàng:</span>
                            <p className="font-medium">{invoiceDetails.invoice?.TenKhachHang || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Chi nhánh:</span>
                            <p className="font-medium">{invoiceDetails.invoice?.TenChiNhanh || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Thanh toán:</span>
                            <p className="font-medium">{invoiceDetails.invoice?.HinhThucThanhToan || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Ngày lập:</span>
                            <p className="font-medium">
                              {invoiceDetails.invoice?.NgayLap ? new Date(invoiceDetails.invoice.NgayLap).toLocaleString('vi-VN') : 'N/A'}
                            </p>
                          </div>
                        </div>
                        {invoiceDetails.details && invoiceDetails.details.length > 0 && (
                          <div className="border-t pt-3 mt-3">
                            <div className="space-y-2">
                              {invoiceDetails.details.map((d, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <div>
                                    <p className="font-medium text-gray-800">{d.TenDichVu || d.TenDV || 'Dịch vụ'}</p>
                                    <p className="text-xs text-gray-500">Số lượng: {d.SoLuong || 1}</p>
                                  </div>
                                  <p className="font-semibold text-purple-600">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(d.Gia || 0)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="border-t pt-3 mt-3 flex items-center justify-between">
                          <span className="text-gray-700 font-semibold">Tổng tiền:</span>
                          <span className="text-xl font-bold text-purple-600">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(invoiceDetails.invoice?.TongTien || 0)}
                          </span>
                        </div>
                        {invoiceDetails.invoice?.KhuyenMai > 0 && (
                          <div className="flex items-center justify-between text-green-600">
                            <span className="font-semibold">Khuyến mãi:</span>
                            <span className="font-bold">
                              -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(invoiceDetails.invoice.KhuyenMai)}
                            </span>
                          </div>
                        )}
                        <div className="border-t pt-3 mt-3 flex items-center justify-between">
                          <span className="text-gray-800 font-bold">Thành tiền:</span>
                          <span className="text-2xl font-bold text-purple-600">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((invoiceDetails.invoice?.TongTien || 0) - (invoiceDetails.invoice?.KhuyenMai || 0))}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CustomerDetailModal;
