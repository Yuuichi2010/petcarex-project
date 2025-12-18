import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Heart } from 'lucide-react';
import { getPets, deletePet } from '../../services/api';
import Table from '../Common/Table';
import Pagination from '../Common/Pagination';
import PetModal from './PetModal';
import PetDetailModal from './PetDetailModal';

const PetList = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [loaiFilter, setLoaiFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);

  const loadPets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getPets({
        page: pagination.page,
        limit: pagination.limit,
        search: search,
        loai: loaiFilter
      });
      setPets(response.data);
      setPagination(prev => ({ ...prev, ...response.pagination }));
    } catch (error) {
      console.error('Error loading pets:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, loaiFilter]);

  useEffect(() => {
    loadPets();
  }, [loadPets]);

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa thú cưng này?')) {
      try {
        await deletePet(id);
        loadPets();
      } catch (error) {
        alert('Lỗi khi xóa thú cưng');
      }
    }
  };

  const columns = [
    { label: 'Mã', field: 'MaThuCung' },
    {
      label: 'Tên',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Heart className="text-pink-500" size={16} />
          <span className="font-semibold text-gray-800">{row.TenThuCung}</span>
        </div>
      )
    },
    { label: 'Loài', field: 'LoaiThuCung' },
    { label: 'Giống', field: 'GiongThuCung' },
    { label: 'Chủ Sở Hữu', field: 'TenChuSoHuu' },
    { label: 'SĐT', field: 'SDT' },
    {
      label: 'Tình Trạng',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          row.TinhTrangSucKhoe === 'Tot' ? 'bg-green-100 text-green-700' :
          row.TinhTrangSucKhoe === 'Kha' ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>
          {row.TinhTrangSucKhoe}
        </span>
      )
    },
    {
      label: 'Thao Tác',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedPet(row); setShowDetailModal(true); }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedPet(row); setShowModal(true); }}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(row.MaThuCung); }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800">Quản Lý Thú Cưng</h2>
        <button
          onClick={() => { setSelectedPet(null); setShowModal(true); }}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all font-medium flex items-center gap-2"
        >
          <Plus size={20} />
          Thêm Thú Cưng
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên thú cưng hoặc chủ sở hữu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all"
            />
          </div>
          <select
            value={loaiFilter}
            onChange={(e) => setLoaiFilter(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all"
          >
            <option value="">Tất cả loài</option>
            <option value="Cho">Chó</option>
            <option value="Meo">Mèo</option>
            <option value="Tho">Thỏ</option>
            <option value="Chim">Chim</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : pets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Không tìm thấy thú cưng nào</p>
          </div>
        ) : (
          <>
            <Table columns={columns} data={pets} />
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
            />
          </>
        )}
      </div>

      {showModal && (
        <PetModal
          pet={selectedPet}
          onClose={() => { setShowModal(false); setSelectedPet(null); }}
          onSuccess={() => { setShowModal(false); loadPets(); }}
        />
      )}

      {showDetailModal && selectedPet && (
        <PetDetailModal
          petId={selectedPet.MaThuCung}
          onClose={() => { setShowDetailModal(false); setSelectedPet(null); }}
        />
      )}
    </div>
  );
};

export default PetList;
