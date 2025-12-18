import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Clock, Users, DollarSign, Plus, Edit, Eye } from 'lucide-react';
import { getBranches } from '../../services/api';
import BranchModal from './BranchModal';
import BranchDetailModal from './BranchDetailModal';

const BranchList = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      setLoading(true);
      const response = await getBranches();
      setBranches(response.data);
    } catch (error) {
      console.error('Error loading branches:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800">Quản Lý Chi Nhánh</h2>
        <button
          onClick={() => { setSelectedBranch(null); setShowModal(true); }}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all font-medium flex items-center gap-2"
        >
          <Plus size={20} />
          Thêm Chi Nhánh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {branches.map(branch => (
            <div key={branch.MaChiNhanh} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <MapPin className="text-white" size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{branch.Ten}</h3>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      Đang hoạt động
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setSelectedBranch(branch); setShowDetailModal(true); }}
                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Xem chi tiết"
                  >
                    <Eye size={20} className="text-blue-600" />
                  </button>
                  <button
                    onClick={() => { setSelectedBranch(branch); setShowModal(true); }}
                    className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Edit size={20} className="text-purple-600" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="text-sm">{branch.DiaChi}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone size={16} className="text-gray-400" />
                  <span className="text-sm">{branch.SDT}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={16} className="text-gray-400" />
                  <span className="text-sm">{branch.TGMoCua} - {branch.TGDongCua}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                    <Users size={16} />
                  </div>
                  <p className="text-lg font-bold text-gray-800">{branch.SoNhanVien}</p>
                  <p className="text-xs text-gray-500">Nhân viên</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                    <DollarSign size={16} />
                  </div>
                  <p className="text-lg font-bold text-gray-800">{branch.SoHoaDon}</p>
                  <p className="text-xs text-gray-500">Hóa đơn</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                    <DollarSign size={16} />
                  </div>
                  <p className="text-sm font-bold text-gray-800">{formatCurrency(branch.DoanhThu).slice(0, -2)}đ</p>
                  <p className="text-xs text-gray-500">Doanh thu</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <BranchModal
          branch={selectedBranch}
          onClose={() => { setShowModal(false); setSelectedBranch(null); }}
          onSuccess={() => { setShowModal(false); loadBranches(); }}
        />
      )}

      {showDetailModal && selectedBranch && (
        <BranchDetailModal
          branchId={selectedBranch.MaChiNhanh}
          onClose={() => { setShowDetailModal(false); setSelectedBranch(null); }}
        />
      )}
    </div>
  );
};

export default BranchList;