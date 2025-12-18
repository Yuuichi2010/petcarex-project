import React, { useState, useEffect } from 'react';
import Modal from '../Common/Modal';
import { createCustomer, updateCustomer } from '../../services/api';

const CustomerModal = ({ customer, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    HoTen: '',
    SDT: '',
    Email: '',
    CCCD: '',
    GioiTinhKH: 'Nam',
    NgaySinh: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      setFormData({
        HoTen: customer.HoTen || '',
        SDT: customer.SDT || '',
        Email: customer.Email || '',
        CCCD: customer.CCCD || '',
        GioiTinhKH: customer.GioiTinhKH || 'Nam',
        NgaySinh: customer.NgaySinh ? customer.NgaySinh.split('T')[0] : ''
      });
    }
  }, [customer]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (customer) {
        await updateCustomer(customer.MaKhachHang, formData);
      } else {
        await createCustomer(formData);
      }
      onSuccess();
    } catch (error) {
      alert('Có lỗi xảy ra: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={customer ? 'Cập Nhật Khách Hàng' : 'Thêm Khách Hàng Mới'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Họ Tên <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="HoTen"
            value={formData.HoTen}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số Điện Thoại <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="SDT"
              value={formData.SDT}
              onChange={handleChange}
              required
              pattern="[0-9]{10,11}"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CCCD
            </label>
            <input
              type="text"
              name="CCCD"
              value={formData.CCCD}
              onChange={handleChange}
              pattern="[0-9]{12}"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            name="Email"
            value={formData.Email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giới Tính
            </label>
            <select
              name="GioiTinhKH"
              value={formData.GioiTinhKH}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              <option value="Nam">Nam</option>
              <option value="Nu">Nữ</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày Sinh
            </label>
            <input
              type="date"
              name="NgaySinh"
              value={formData.NgaySinh}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : (customer ? 'Cập Nhật' : 'Thêm Mới')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CustomerModal;