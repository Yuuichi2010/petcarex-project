import React, { useState, useEffect } from 'react';
import Modal from '../Common/Modal';
import { createPet, updatePet, getCustomers } from '../../services/api';

const PetModal = ({ pet, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    TenThuCung: '',
    LoaiThuCung: 'Cho',
    GiongThuCung: '',
    NgaySinh: '',
    GioiTinhThuCung: 'Duc',
    TinhTrangSucKhoe: 'Tot',
    MaKhachHang: ''
  });
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCustomers();
    if (pet) {
      setFormData({
        TenThuCung: pet.TenThuCung || '',
        LoaiThuCung: pet.LoaiThuCung || 'Cho',
        GiongThuCung: pet.GiongThuCung || '',
        NgaySinh: pet.NgaySinh ? pet.NgaySinh.split('T')[0] : '',
        GioiTinhThuCung: pet.GioiTinhThuCung || 'Duc',
        TinhTrangSucKhoe: pet.TinhTrangSucKhoe || 'Tot',
        MaKhachHang: pet.MaKhachHang || ''
      });
    }
  }, [pet]);

  const loadCustomers = async () => {
    try {
      const response = await getCustomers({ limit: 1000 });
      setCustomers(response.data);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

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
      if (pet) {
        await updatePet(pet.MaThuCung, formData);
      } else {
        await createPet(formData);
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
      title={pet ? 'Cập Nhật Thú Cưng' : 'Thêm Thú Cưng Mới'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tên Thú Cưng <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="TenThuCung"
            value={formData.TenThuCung}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loài <span className="text-red-500">*</span>
            </label>
            <select
              name="LoaiThuCung"
              value={formData.LoaiThuCung}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              <option value="Cho">Chó</option>
              <option value="Meo">Mèo</option>
              <option value="Tho">Thỏ</option>
              <option value="Chim">Chim</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giống
            </label>
            <input
              type="text"
              name="GiongThuCung"
              value={formData.GiongThuCung}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giới Tính
            </label>
            <select
              name="GioiTinhThuCung"
              value={formData.GioiTinhThuCung}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              <option value="Duc">Đực</option>
              <option value="Cai">Cái</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tình Trạng Sức Khỏe
          </label>
          <select
            name="TinhTrangSucKhoe"
            value={formData.TinhTrangSucKhoe}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          >
            <option value="Tot">Tốt</option>
            <option value="Kha">Khá</option>
            <option value="Can theo doi">Cần theo dõi</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chủ Sở Hữu <span className="text-red-500">*</span>
          </label>
          <select
            name="MaKhachHang"
            value={formData.MaKhachHang}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          >
            <option value="">Chọn khách hàng</option>
            {customers.map(customer => (
              <option key={customer.MaKhachHang} value={customer.MaKhachHang}>
                {customer.HoTen} - {customer.SDT}
              </option>
            ))}
          </select>
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
            {loading ? 'Đang xử lý...' : (pet ? 'Cập Nhật' : 'Thêm Mới')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PetModal;