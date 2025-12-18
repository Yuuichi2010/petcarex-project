import React, { useState, useEffect } from 'react';
import Modal from '../Common/Modal';
import { 
  getBranchById, getBranchRevenue, getVaccinatedPets, getPopularVaccines, 
  getInventory, getStaffPerformance, getBranchCustomers, searchVaccines,
  getStaff, getInvoices, getInvoiceById
} from '../../services/api';
import { 
  DollarSign, Syringe, TrendingUp, Package, Users, Calendar, 
  Search, BarChart3, Award, FileText
} from 'lucide-react';

const BranchDetailModal = ({ branchId, onClose }) => {
  const [branch, setBranch] = useState(null);
  const [activeTab, setActiveTab] = useState('revenue');
  const [loading, setLoading] = useState(true);
  
  // Revenue
  const [revenueType, setRevenueType] = useState('THANG');
  const [revenueData, setRevenueData] = useState([]);
  
  // Vaccinated pets
  const [vaccinatedPets, setVaccinatedPets] = useState([]);
  const [vaccineDateRange, setVaccineDateRange] = useState({
    fromDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0]
  });
  
  // Popular vaccines
  const [popularVaccines, setPopularVaccines] = useState([]);
  
  // Inventory
  const [inventory, setInventory] = useState([]);
  
  // Staff performance
  const [staffPerformance, setStaffPerformance] = useState([]);
  
  // Customers
  const [customers, setCustomers] = useState({ total: [], inactive: [] });
  
  // Vaccine search
  const [vaccineSearch, setVaccineSearch] = useState({ ten: '', loai: '', fromDate: '', toDate: '' });
  const [vaccineSearchResults, setVaccineSearchResults] = useState([]);
  
  // Staff
  const [staff, setStaff] = useState([]);
  const [branchInvoices, setBranchInvoices] = useState([]);
  const [branchInvoiceRange, setBranchInvoiceRange] = useState({
    fromDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0]
  });
  const [invoiceSelected, setInvoiceSelected] = useState(null);
  const [invoiceDetail, setInvoiceDetail] = useState(null);

  useEffect(() => {
    loadBranchData();
  }, [branchId]);

  useEffect(() => {
    if (branch && activeTab === 'revenue') {
      loadRevenue();
    } else if (branch && activeTab === 'vaccinated') {
      loadVaccinatedPets();
    } else if (branch && activeTab === 'popular-vaccines') {
      loadPopularVaccines();
    } else if (branch && activeTab === 'inventory') {
      loadInventory();
    } else if (branch && activeTab === 'staff-performance') {
      loadStaffPerformance();
    } else if (branch && activeTab === 'customers') {
      loadCustomers();
    } else if (branch && activeTab === 'staff') {
      loadStaff();
    } else if (branch && activeTab === 'invoices') {
      loadBranchInvoices();
    }
  }, [branch, activeTab, revenueType, vaccineDateRange, branchInvoiceRange]);

  const loadBranchData = async () => {
    try {
      setLoading(true);
      const response = await getBranchById(branchId);
      setBranch(response.data.branch);
      setStaff(response.data.staff || []);
    } catch (error) {
      console.error('Error loading branch:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRevenue = async () => {
    try {
      const response = await getBranchRevenue(branchId, { type: revenueType });
      setRevenueData(response.data || []);
    } catch (error) {
      console.error('Error loading revenue:', error);
    }
  };

  const loadVaccinatedPets = async () => {
    try {
      const response = await getVaccinatedPets({
        branchId,
        fromDate: vaccineDateRange.fromDate,
        toDate: vaccineDateRange.toDate
      });
      setVaccinatedPets(response.data || []);
    } catch (error) {
      console.error('Error loading vaccinated pets:', error);
    }
  };

  const loadPopularVaccines = async () => {
    try {
      const response = await getPopularVaccines({
        branchId,
        fromDate: vaccineDateRange.fromDate,
        toDate: vaccineDateRange.toDate
      });
      setPopularVaccines(response.data || []);
    } catch (error) {
      console.error('Error loading popular vaccines:', error);
    }
  };

  const loadInventory = async () => {
    try {
      const response = await getInventory({});
      setInventory(response.data || []);
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  };

  const loadStaffPerformance = async () => {
    try {
      const response = await getStaffPerformance({
        branchId,
        fromDate: vaccineDateRange.fromDate,
        toDate: vaccineDateRange.toDate
      });
      setStaffPerformance(response.data || []);
    } catch (error) {
      console.error('Error loading staff performance:', error);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await getBranchCustomers(branchId);
      setCustomers({
        total: response.data?.total || [],
        inactive: response.data?.inactive || []
      });
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const loadStaff = async () => {
    try {
      const response = await getStaff({ branchId });
      setStaff(response.data || []);
    } catch (error) {
      console.error('Error loading staff:', error);
    }
  };

  const handleVaccineSearch = async () => {
    try {
      const response = await searchVaccines(vaccineSearch);
      setVaccineSearchResults(response.data || []);
    } catch (error) {
      console.error('Error searching vaccines:', error);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
  };
  const loadBranchInvoices = async () => {
    try {
      const response = await getInvoices({
        branchId,
        fromDate: branchInvoiceRange.fromDate,
        toDate: branchInvoiceRange.toDate,
        limit: 100
      });
      setBranchInvoices(response.data || []);
    } catch (error) {
      console.error('Error loading branch invoices:', error);
      setBranchInvoices([]);
    }
  };
  const loadInvoiceDetail = async (id) => {
    try {
      const response = await getInvoiceById(id);
      setInvoiceDetail(response.data);
      setInvoiceSelected(id);
    } catch (error) {
      console.error('Error loading invoice detail:', error);
    }
  };

  if (loading) {
    return (
      <Modal isOpen={true} onClose={onClose} title="Chi Tiết Chi Nhánh" size="xl">
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={true} onClose={onClose} title={`Chi Nhánh: ${branch?.Ten}`} size="xl">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex gap-4 overflow-x-auto">
            <TabButton icon={DollarSign} label="Doanh Thu" active={activeTab === 'revenue'} onClick={() => setActiveTab('revenue')} />
            <TabButton icon={Syringe} label="Thú Cưng Tiêm Phòng" active={activeTab === 'vaccinated'} onClick={() => setActiveTab('vaccinated')} />
            <TabButton icon={TrendingUp} label="Vắc-Xin Phổ Biến" active={activeTab === 'popular-vaccines'} onClick={() => setActiveTab('popular-vaccines')} />
            <TabButton icon={Package} label="Tồn Kho" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
            <TabButton icon={Search} label="Tra Cứu Vắc-Xin" active={activeTab === 'vaccine-search'} onClick={() => setActiveTab('vaccine-search')} />
            <TabButton icon={Award} label="Hiệu Suất NV" active={activeTab === 'staff-performance'} onClick={() => setActiveTab('staff-performance')} />
            <TabButton icon={Users} label="Khách Hàng" active={activeTab === 'customers'} onClick={() => setActiveTab('customers')} />
            <TabButton icon={FileText} label="Nhân Viên" active={activeTab === 'staff'} onClick={() => setActiveTab('staff')} />
            <TabButton icon={FileText} label="Hóa Đơn" active={activeTab === 'invoices'} onClick={() => setActiveTab('invoices')} />
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'revenue' && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Loại thống kê:</label>
              <select
                value={revenueType}
                onChange={(e) => setRevenueType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                <option value="NGAY">Theo Ngày</option>
                <option value="THANG">Theo Tháng</option>
                <option value="QUY">Theo Quý</option>
                <option value="NAM">Theo Năm</option>
              </select>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Doanh Thu {revenueType === 'NGAY' ? 'Theo Ngày' : revenueType === 'THANG' ? 'Theo Tháng' : revenueType === 'QUY' ? 'Theo Quý' : 'Theo Năm'}</h4>
              <div className="space-y-2">
                {revenueData.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Chưa có dữ liệu</p>
                ) : (
                  revenueData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-800">{item.ThoiGian || item.Ngay || item.Thang || item.Quy || item.Nam}</span>
                      <span className="font-bold text-purple-600">{formatCurrency(item.DoanhThu)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vaccinated' && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                type="date"
                value={vaccineDateRange.fromDate}
                onChange={(e) => setVaccineDateRange({ ...vaccineDateRange, fromDate: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <span>đến</span>
              <input
                type="date"
                value={vaccineDateRange.toDate}
                onChange={(e) => setVaccineDateRange({ ...vaccineDateRange, toDate: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Danh Sách Thú Cưng Được Tiêm Phòng</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Tên Thú Cưng</th>
                      <th className="px-3 py-2 text-left">Loài</th>
                      <th className="px-3 py-2 text-left">Ngày Tiêm</th>
                      <th className="px-3 py-2 text-left">Vắc-Xin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vaccinatedPets.length === 0 ? (
                      <tr><td colSpan="4" className="text-center py-4 text-gray-500">Chưa có dữ liệu</td></tr>
                    ) : (
                      vaccinatedPets.map((pet, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="px-3 py-2">{pet.TenThuCung}</td>
                          <td className="px-3 py-2">{pet.LoaiThuCung}</td>
                          <td className="px-3 py-2">{new Date(pet.NgayTiem).toLocaleDateString('vi-VN')}</td>
                          <td className="px-3 py-2">{pet.TenVacXin}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'popular-vaccines' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Thống Kê Vắc-Xin Được Đặt Nhiều Nhất</h4>
              <div className="space-y-2">
                {popularVaccines.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Chưa có dữ liệu</p>
                ) : (
                  popularVaccines.map((vaccine, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-800">{vaccine.TenVacXin}</span>
                        <span className="ml-2 text-sm text-gray-500">({vaccine.LoaiVacXin})</span>
                      </div>
                      <span className="font-bold text-purple-600">{vaccine.SoLuong} mũi</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Tồn Kho Sản Phẩm</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Mã SP</th>
                      <th className="px-3 py-2 text-left">Tên Sản Phẩm</th>
                      <th className="px-3 py-2 text-left">Loại</th>
                      <th className="px-3 py-2 text-right">Tồn Kho</th>
                      <th className="px-3 py-2 text-right">Giá</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.length === 0 ? (
                      <tr><td colSpan="5" className="text-center py-4 text-gray-500">Chưa có dữ liệu</td></tr>
                    ) : (
                      inventory.map((item, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="px-3 py-2">{item.MaSanPham}</td>
                          <td className="px-3 py-2">{item.TenSanPham}</td>
                          <td className="px-3 py-2">{item.LoaiSanPham}</td>
                          <td className="px-3 py-2 text-right">{item.SoLuongTonKho}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(item.GiaBan)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vaccine-search' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Tra Cứu Vắc-Xin</h4>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên vắc-xin</label>
                  <input
                    type="text"
                    value={vaccineSearch.ten}
                    onChange={(e) => setVaccineSearch({ ...vaccineSearch, ten: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Nhập tên vắc-xin"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại</label>
                  <input
                    type="text"
                    value={vaccineSearch.loai}
                    onChange={(e) => setVaccineSearch({ ...vaccineSearch, loai: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Nhập loại vắc-xin"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày sản xuất</label>
                  <input
                    type="date"
                    value={vaccineSearch.fromDate}
                    onChange={(e) => setVaccineSearch({ ...vaccineSearch, fromDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày sản xuất</label>
                  <input
                    type="date"
                    value={vaccineSearch.toDate}
                    onChange={(e) => setVaccineSearch({ ...vaccineSearch, toDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <button
                onClick={handleVaccineSearch}
                className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all"
              >
                Tìm Kiếm
              </button>
            </div>
            {vaccineSearchResults.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Kết Quả Tìm Kiếm</h4>
                <div className="space-y-2">
                  {vaccineSearchResults.map((vaccine, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-gray-800">{vaccine.TenVacXin}</span>
                          <span className="ml-2 text-sm text-gray-500">({vaccine.LoaiVacXin})</span>
                        </div>
                        <span className="text-sm text-gray-600">
                          NSX: {new Date(vaccine.NgaySanXuat).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'staff-performance' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Hiệu Suất Nhân Viên</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Tên NV</th>
                      <th className="px-3 py-2 text-left">Chức Vụ</th>
                      <th className="px-3 py-2 text-right">Số Đơn</th>
                      <th className="px-3 py-2 text-right">Điểm TB</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffPerformance.length === 0 ? (
                      <tr><td colSpan="4" className="text-center py-4 text-gray-500">Chưa có dữ liệu</td></tr>
                    ) : (
                      staffPerformance.map((staff, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="px-3 py-2">{staff.TenNhanVien}</td>
                          <td className="px-3 py-2">{staff.ChucVu}</td>
                          <td className="px-3 py-2 text-right">{staff.SoDonHang || 0}</td>
                          <td className="px-3 py-2 text-right">{staff.DiemTrungBinh?.toFixed(1) || 'N/A'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Tổng Số Khách Hàng</h4>
                <p className="text-3xl font-bold text-purple-600">
                  {customers.total?.[0]?.TongSoKhachHang || 0}
                </p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Khách Hàng Lâu Chưa Quay Lại</h4>
                <p className="text-3xl font-bold text-red-600">
                  {customers.inactive?.[0]?.SoKhachHangLau || 0}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'staff' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Danh Sách Nhân Viên</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Mã NV</th>
                      <th className="px-3 py-2 text-left">Họ Tên</th>
                      <th className="px-3 py-2 text-left">Chức Vụ</th>
                      <th className="px-3 py-2 text-right">Lương</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.length === 0 ? (
                      <tr><td colSpan="4" className="text-center py-4 text-gray-500">Chưa có nhân viên</td></tr>
                    ) : (
                      staff.map((s) => (
                        <tr key={s.MaNV} className="border-t">
                          <td className="px-3 py-2">{s.MaNV}</td>
                          <td className="px-3 py-2">{s.HoTen}</td>
                          <td className="px-3 py-2">{s.ChucVu}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(s.LuongCoBan)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                type="date"
                value={branchInvoiceRange.fromDate}
                onChange={(e) => setBranchInvoiceRange({ ...branchInvoiceRange, fromDate: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <span>đến</span>
              <input
                type="date"
                value={branchInvoiceRange.toDate}
                onChange={(e) => setBranchInvoiceRange({ ...branchInvoiceRange, toDate: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800">Danh Sách Hóa Đơn</h4>
                <div className="text-sm text-gray-700">
                  <span className="mr-4">Số hóa đơn: {branchInvoices.length}</span>
                  <span>
                    Doanh thu: {formatCurrency(branchInvoices.reduce((sum, i) => sum + (i.TongTien - i.KhuyenMai), 0))}
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Mã HĐ</th>
                      <th className="px-3 py-2 text-left">Ngày Lập</th>
                      <th className="px-3 py-2 text-left">Khách Hàng</th>
                      <th className="px-3 py-2 text-left">Nhân Viên</th>
                      <th className="px-3 py-2 text-right">Thành Tiền</th>
                      <th className="px-3 py-2 text-left">Thanh Toán</th>
                    </tr>
                  </thead>
                  <tbody>
                    {branchInvoices.length === 0 ? (
                      <tr><td colSpan="6" className="text-center py-4 text-gray-500">Chưa có hóa đơn</td></tr>
                    ) : (
                      branchInvoices.map((inv) => (
                        <tr
                          key={inv.MaHoaDon}
                          className={`border-t cursor-pointer ${invoiceSelected === inv.MaHoaDon ? 'bg-purple-50' : ''}`}
                          onClick={() => loadInvoiceDetail(inv.MaHoaDon)}
                        >
                          <td className="px-3 py-2">#{inv.MaHoaDon}</td>
                          <td className="px-3 py-2">{inv.NgayLap ? new Date(inv.NgayLap).toLocaleString('vi-VN') : 'N/A'}</td>
                          <td className="px-3 py-2">{inv.TenKhachHang || 'N/A'}</td>
                          <td className="px-3 py-2">{inv.TenNhanVien || 'N/A'}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency((inv.TongTien || 0) - (inv.KhuyenMai || 0))}</td>
                          <td className="px-3 py-2">{inv.HinhThucThanhToan || 'N/A'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {invoiceSelected && invoiceDetail && (
                <div className="mt-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-bold text-gray-800">Chi tiết hóa đơn #{invoiceSelected}</h5>
                    <button
                      onClick={() => { setInvoiceSelected(null); setInvoiceDetail(null); }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="bg-white rounded-lg p-3 space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Khách hàng:</span>
                        <p className="font-medium">{invoiceDetail.invoice?.TenKhachHang || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Chi nhánh:</span>
                        <p className="font-medium">{invoiceDetail.invoice?.TenChiNhanh || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Thanh toán:</span>
                        <p className="font-medium">{invoiceDetail.invoice?.HinhThucThanhToan || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Ngày lập:</span>
                        <p className="font-medium">
                          {invoiceDetail.invoice?.NgayLap ? new Date(invoiceDetail.invoice.NgayLap).toLocaleString('vi-VN') : 'N/A'}
                        </p>
                      </div>
                    </div>
                    {invoiceDetail.details && invoiceDetail.details.length > 0 && (
                      <div className="border-t pt-3 mt-3">
                        <div className="space-y-2">
                          {invoiceDetail.details.map((d, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div>
                                <p className="font-medium text-gray-800">{d.TenDichVu || d.TenDV || 'Dịch vụ'}</p>
                                <p className="text-xs text-gray-500">Số lượng: {d.SoLuong || 1}</p>
                              </div>
                              <p className="font-semibold text-purple-600">{formatCurrency(d.Gia || 0)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="border-t pt-3 mt-3 flex items-center justify-between">
                      <span className="text-gray-700 font-semibold">Tổng tiền:</span>
                      <span className="text-xl font-bold text-purple-600">{formatCurrency(invoiceDetail.invoice?.TongTien || 0)}</span>
                    </div>
                    {invoiceDetail.invoice?.KhuyenMai > 0 && (
                      <div className="flex items-center justify-between text-green-600">
                        <span className="font-semibold">Khuyến mãi:</span>
                        <span className="font-bold">-{formatCurrency(invoiceDetail.invoice.KhuyenMai)}</span>
                      </div>
                    )}
                    <div className="border-t pt-3 mt-3 flex items-center justify-between">
                      <span className="text-gray-800 font-bold">Thành tiền:</span>
                      <span className="text-2xl font-bold text-purple-600">{formatCurrency((invoiceDetail.invoice?.TongTien || 0) - (invoiceDetail.invoice?.KhuyenMai || 0))}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

const TabButton = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
      active
        ? 'border-purple-500 text-purple-600'
        : 'border-transparent text-gray-500 hover:text-gray-700'
    }`}
  >
    <Icon size={16} />
    {label}
  </button>
);

export default BranchDetailModal;

