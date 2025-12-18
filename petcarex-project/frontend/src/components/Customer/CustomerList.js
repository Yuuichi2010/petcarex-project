import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { getCustomers, deleteCustomer } from '../../services/api';
import Table from '../Common/Table';
import Pagination from '../Common/Pagination';
import CustomerModal from './CustomerModal';
import CustomerDetailModal from './CustomerDetailModal';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getCustomers({
        page: pagination.page,
        limit: pagination.limit,
        search: search
      });
      setCustomers(response.data);
      setPagination(prev => ({ ...prev, ...response.pagination }));
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa khách hàng này?')) {
      try {
        await deleteCustomer(id);
        loadCustomers();
      } catch (error) {
        alert('Lỗi khi xóa khách hàng');
      }
    }
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  const handleViewDetail = (customer) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
  };

  const columns = [
    { label: 'Mã KH', field: 'MaKhachHang' },
    { label: 'Họ Tên', field: 'HoTen' },
    { label: 'Điện Thoại', field: 'SDT' },
    { label: 'Email', field: 'Email' },
    {
      label: 'Hạng',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          row.TenHangHV === 'VIP' ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' :
          row.TenHangHV === 'Than Thiet' ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white' :
          'bg-gray-200 text-gray-700'
        }`}>
          {row.TenHangHV || 'Cơ bản'}
        </span>
      )
    },
    {
      label: 'Điểm',
      render: (row) => (
        <span className="font-semibold text-purple-600">{row.DiemTichLuy || 0}</span>
      )
    },
    {
      label: 'Số Thú Cưng',
      render: (row) => (
        <span className="font-semibold text-blue-600">{row.SoThuCung || 0}</span>
      )
    },
    {
      label: 'Thao Tác',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleViewDetail(row); }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Xem chi tiết"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleEdit(row); }}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Sửa"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(row.MaKhachHang); }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Xóa"
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
        <h2 className="text-3xl font-bold text-gray-800">Quản Lý Khách Hàng</h2>
        <button
          onClick={() => { setSelectedCustomer(null); setShowModal(true); }}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all font-medium flex items-center gap-2"
        >
          <Plus size={20} />
          Thêm Khách Hàng
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, số điện thoại, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Không tìm thấy khách hàng nào</p>
          </div>
        ) : (
          <>
            <Table columns={columns} data={customers} />
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
            />
          </>
        )}
      </div>

      {showModal && (
        <CustomerModal
          customer={selectedCustomer}
          onClose={() => { setShowModal(false); setSelectedCustomer(null); }}
          onSuccess={() => { setShowModal(false); loadCustomers(); }}
        />
      )}

      {showDetailModal && selectedCustomer && (
        <CustomerDetailModal
          customerId={selectedCustomer.MaKhachHang}
          onClose={() => { setShowDetailModal(false); setSelectedCustomer(null); }}
        />
      )}
    </div>
  );
};

export default CustomerList;
