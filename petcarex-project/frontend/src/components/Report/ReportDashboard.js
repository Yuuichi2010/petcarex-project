import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Users, Package, Download } from 'lucide-react';
import { getSystemRevenue, getTopServices, getPetStatistics, getMembershipStatus, getInventory } from '../../services/api';

const ReportDashboard = () => {
  const [systemRevenue, setSystemRevenue] = useState([]);
  const [topServices, setTopServices] = useState([]);
  const [petStats, setPetStats] = useState([]);
  const [membershipStatus, setMembershipStatus] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    fromDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0]
  });

  const loadReportData = useCallback(async () => {
    try {
      setLoading(true);
      const [revenueRes, servicesRes, petStatsRes, membershipRes, inventoryRes] = await Promise.all([
        getSystemRevenue(dateRange),
        getTopServices({ months: 6 }),
        getPetStatistics(),
        getMembershipStatus(),
        getInventory({})
      ]);

      setSystemRevenue(revenueRes.data || []);
      setTopServices(servicesRes.data || []);
      setPetStats(petStatsRes.data || []);
      setMembershipStatus(membershipRes.data || []);
      setInventory(inventoryRes.data || []);
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  const COLORS = ['#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Đang tải báo cáo...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800">Báo Cáo & Thống Kê</h2>
        <div className="flex gap-3">
          <input
            type="date"
            value={dateRange.fromDate}
            onChange={(e) => setDateRange({ ...dateRange, fromDate: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
          <input
            type="date"
            value={dateRange.toDate}
            onChange={(e) => setDateRange({ ...dateRange, toDate: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
          <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2">
            <Download size={20} />
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Doanh thu theo chi nhánh */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <DollarSign className="text-green-500" />
          Doanh Thu Theo Chi Nhánh
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={systemRevenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="TenChiNhanh" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Bar dataKey="DoanhThu" fill="#a855f7" name="Doanh thu" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top dịch vụ */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="text-blue-500" />
            Top Dịch Vụ (6 tháng gần nhất)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topServices}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ TenDV, percent }) => `${TenDV}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="TongDoanhThu"
                nameKey="TenDV"
              >
                {topServices.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Tình hình hội viên */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="text-purple-500" />
            Tình Hình Hội Viên
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={membershipStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ TenHangHV, TyLe }) => `${TenHangHV}: ${TyLe}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="SoLuong"
                nameKey="TenHangHV"
              >
                {membershipStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Thống kê thú cưng */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Thống Kê Thú Cưng Theo Loài & Giống</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Loài</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Giống</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Số Lượng</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Tỷ Lệ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {petStats.slice(0, 10).map((stat, idx) => (
                <tr key={idx} className="hover:bg-purple-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-800">{stat.LoaiThuCung}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{stat.GiongThuCung}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-purple-600">{stat.SoLuong}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">{stat.TyLePhanTram}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tồn kho sản phẩm */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Package className="text-orange-500" />
          Tình Trạng Tồn Kho
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Mã SP</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tên Sản Phẩm</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Loại</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Tồn Kho</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Tình Trạng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inventory.filter(item => item.SoLuongTonKho < 100).slice(0, 10).map((item, idx) => (
                <tr key={idx} className="hover:bg-purple-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-600">{item.MaSanPham}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{item.TenSanPham}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.LoaiSanPham}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600">{item.SoLuongTonKho}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.TinhTrang === 'Sap Het' ? 'bg-red-100 text-red-700' :
                      item.TinhTrang === 'Can Nhap' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {item.TinhTrang}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportDashboard;
