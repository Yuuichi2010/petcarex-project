import React, { useState, useEffect } from 'react';
import Modal from '../Common/Modal';
import { createBranch, updateBranch } from '../../services/api';

const BranchModal = ({ branch, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    Ten: '',
    DiaChi: '',
    SDT: '',
    TGMoCua: '08:00',
    TGDongCua: '20:00'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (branch) {
      setFormData({
        Ten: branch.Ten || '',
        DiaChi: branch.DiaChi || '',
        SDT: branch.SDT || '',
        TGMoCua: branch.TGMoCua || '08:00',
        TGDongCua: branch.TGDongCua || '20:00'
      });
    }
  }, [branch]);

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
      if (branch) {
        await updateBranch(branch.MaChiNhanh, formData);
      } else {
        await createBranch(formData);
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
      title={branch ? 'Cập Nhật Chi Nhánh' : 'Thêm Chi Nhánh Mới'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tên Chi Nhánh <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="Ten"
            value={formData.Ten}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Địa Chỉ <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="DiaChi"
            value={formData.DiaChi}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>

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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giờ Mở Cửa
            </label>
            <input
              type="time"
              name="TGMoCua"
              value={formData.TGMoCua}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giờ Đóng Cửa
            </label>
            <input
              type="time"
              name="TGDongCua"
              value={formData.TGDongCua}
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
            {loading ? 'Đang xử lý...' : (branch ? 'Cập Nhật' : 'Thêm Mới')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default BranchModal;