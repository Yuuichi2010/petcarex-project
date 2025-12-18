import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Users, Activity, DollarSign, FileText, MapPin, Menu, X, Home, Heart, Search, Bell, Settings, LogOut } from 'lucide-react';
import CustomerList from './components/Customer/CustomerList';
import PetList from './components/Pet/PetList';
import BranchList from './components/Branch/BranchList';
import ReportDashboard from './components/Report/ReportDashboard';
import NotificationList from './components/Notification/NotificationList';
import { getDashboardStats, getRecentAppointments, getRevenueByBranch, getNotifications, markNotificationAsRead, markAllNotificationsAsRead, getBranches } from './services/api';

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [revenueByBranch, setRevenueByBranch] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [branches, setBranches] = useState([]);
  const [settings, setSettings] = useState(() => {
    const s = localStorage.getItem('petcarex_settings');
    return s ? JSON.parse(s) : { 
      autoRefreshDashboard: false, 
      showNotificationBadge: true, 
      autoRefreshInterval: 1,
      theme: 'light',
      defaultBranchId: null,
      notificationsUnreadOnly: false,
      notificationsSeverity: 'all',
      notificationsBranchScoped: false,
      dashboardRefreshStats: true,
      dashboardRefreshAppointments: true,
      dashboardRefreshRevenue: true
    };
  });

  React.useEffect(() => {
    if (currentPage === 'dashboard') {
      loadDashboardData();
    }
  }, [currentPage]);

  const loadDashboardData = async () => {
    try {
      const [statsRes, appointmentsRes, revenueRes] = await Promise.all([
        getDashboardStats(),
        getRecentAppointments(),
        getRevenueByBranch()
      ]);
      setStats(statsRes.data);
      setRecentAppointments(appointmentsRes.data || []);
      setRevenueByBranch(revenueRes.data || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const loadNotifications = useCallback(async () => {
    try {
      const params = { limit: 10 };
      if (settings.notificationsUnreadOnly) params.unreadOnly = true;
      if (settings.notificationsSeverity && settings.notificationsSeverity !== 'all') params.severity = settings.notificationsSeverity;
      if (settings.notificationsBranchScoped && settings.defaultBranchId) params.branchId = settings.defaultBranchId;
      const res = await getNotifications(params);
      setNotifications(res.data || []);
    } catch (e) {
      console.error('Error loading notifications:', e);
    }
  }, [settings.notificationsUnreadOnly, settings.notificationsSeverity, settings.notificationsBranchScoped, settings.defaultBranchId]);

  useEffect(() => {
    loadDashboardData();
    loadNotifications();
    getBranches().then(res => setBranches(res.data || [])).catch(() => {});
  }, [loadNotifications]);

  useEffect(() => {
    localStorage.setItem('petcarex_settings', JSON.stringify(settings));
    if (settings.theme === 'dark') {
      document.body.classList.add('bg-gray-900');
      document.body.classList.remove('bg-white');
    } else {
      document.body.classList.remove('bg-gray-900');
    }
  }, [settings]);

  useEffect(() => {
    if (!settings.autoRefreshDashboard) return;
    const id = setInterval(() => {
      if (settings.dashboardRefreshStats || settings.dashboardRefreshAppointments || settings.dashboardRefreshRevenue) {
        (async () => {
          try {
            if (settings.dashboardRefreshStats) {
              const res = await getDashboardStats();
              setStats(res.data);
            }
            if (settings.dashboardRefreshAppointments) {
              const res = await getRecentAppointments();
              setRecentAppointments(res.data || []);
            }
            if (settings.dashboardRefreshRevenue) {
              const res = await getRevenueByBranch();
              setRevenueByBranch(res.data || []);
            }
          } catch (e) {}
        })();
      }
      loadNotifications();
    }, (settings.autoRefreshInterval || 1) * 60000);
    return () => clearInterval(id);
  }, [settings.autoRefreshDashboard, settings.autoRefreshInterval, settings.dashboardRefreshStats, settings.dashboardRefreshAppointments, settings.dashboardRefreshRevenue, loadNotifications]);

  const Dashboard = ({ stats, appointments, revenue }) => {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-800">Tổng Quan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex items-center gap-4">
            <Users className="text-purple-600" />
            <div>
              <p className="text-sm text-gray-500">Khách hàng</p>
              <p className="text-2xl font-bold text-gray-800">{stats?.totalCustomers ?? 0}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex items-center gap-4">
            <Heart className="text-pink-600" />
            <div>
              <p className="text-sm text-gray-500">Thú cưng</p>
              <p className="text-2xl font-bold text-gray-800">{stats?.totalPets ?? 0}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex items-center gap-4">
            <MapPin className="text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Chi nhánh</p>
              <p className="text-2xl font-bold text-gray-800">{stats?.totalBranches ?? 0}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex items-center gap-4">
            <DollarSign className="text-green-600" />
            <div>
              <p className="text-sm text-gray-500">Doanh thu tháng</p>
              <p className="text-2xl font-bold text-gray-800">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats?.monthlyRevenue ?? 0)}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex items-center gap-4">
            <FileText className="text-indigo-600" />
            <div>
              <p className="text-sm text-gray-500">Số hóa đơn tháng</p>
              <p className="text-2xl font-bold text-gray-800">{stats?.monthlyOrders ?? 0}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex items-center gap-4">
            <Calendar className="text-orange-600" />
            <div>
              <p className="text-sm text-gray-500">Lịch hẹn hôm nay</p>
              <p className="text-2xl font-bold text-gray-800">{stats?.todayAppointments ?? 0}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Lịch hẹn sắp tới</h3>
            {appointments?.length ? (
              <div className="space-y-3">
                {appointments.slice(0, 5).map((a, i) => (
                  <div key={i} className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl">
                    <div>
                      <p className="font-semibold text-gray-800">{a.TenThuCung} - {a.TenKhachHang}</p>
                      <p className="text-xs text-gray-500">{new Date(a.NgayKham).toLocaleString('vi-VN')}</p>
                    </div>
                    <span className="text-sm text-gray-600">{a.TenChiNhanh}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Không có dữ liệu</p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Doanh thu theo chi nhánh</h3>
            {revenue?.length ? (
              <div className="space-y-3">
                {revenue.slice(0, 5).map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-gray-100">
                    <span className="font-medium text-gray-800">{r.TenChiNhanh}</span>
                    <span className="text-purple-600 font-semibold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(r.DoanhThu)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Không có dữ liệu</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPage = () => {
    switch(currentPage) {
      case 'dashboard': return <Dashboard stats={stats} appointments={recentAppointments} revenue={revenueByBranch} />;
      case 'branches': return <BranchList />;
      case 'customers': return <CustomerList />;
      case 'pets': return <PetList />;
      case 'reports': return <ReportDashboard />;
      case 'settings': return <SettingsPage />;
      case 'notifications': return <NotificationList />;
      default: return <Dashboard stats={stats} appointments={recentAppointments} revenue={revenueByBranch} />;
    }
  };

  const MenuItem = ({ icon: Icon, label, page, currentPage, setCurrentPage, sidebarOpen }) => (
    <button
      onClick={() => setCurrentPage(page)}
      className={`w-full flex items-center ${sidebarOpen ? 'gap-3' : 'justify-center'} px-3 py-3 rounded-xl transition-all mb-2 ` +
        (currentPage === page
          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
          : 'hover:bg-purple-50 text-gray-700')}
    >
      <Icon className={currentPage === page ? 'text-white' : 'text-purple-600'} size={20} />
      {sidebarOpen && <span className="font-medium">{label}</span>}
    </button>
  );

  const SettingsPage = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Cài đặt</h2>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Tự động làm mới bảng tổng quan mỗi 1 phút</span>
          <input
            type="checkbox"
            checked={settings.autoRefreshDashboard}
            onChange={(e) => setSettings(s => ({ ...s, autoRefreshDashboard: e.target.checked }))}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Hiện chấm đỏ khi có thông báo chưa đọc</span>
          <input
            type="checkbox"
            checked={settings.showNotificationBadge}
            onChange={(e) => setSettings(s => ({ ...s, showNotificationBadge: e.target.checked }))}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Khoảng làm mới (phút)</span>
          <input
            type="number"
            min="1"
            max="30"
            value={settings.autoRefreshInterval || 1}
            onChange={(e) => setSettings(s => ({ ...s, autoRefreshInterval: Math.max(1, Math.min(30, parseInt(e.target.value) || 1)) }))}
            className="w-20 px-2 py-1 border border-gray-300 rounded-lg"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Chủ đề giao diện</span>
          <select
            value={settings.theme}
            onChange={(e) => setSettings(s => ({ ...s, theme: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="light">Sáng</option>
            <option value="dark">Tối</option>
          </select>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Chi nhánh mặc định</span>
          <select
            value={settings.defaultBranchId || ''}
            onChange={(e) => setSettings(s => ({ ...s, defaultBranchId: e.target.value ? parseInt(e.target.value) : null }))}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Không chọn</option>
            {branches.map(b => (
              <option key={b.MaChiNhanh} value={b.MaChiNhanh}>{b.Ten}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Chỉ hiện thông báo chưa đọc</span>
          <input
            type="checkbox"
            checked={settings.notificationsUnreadOnly}
            onChange={(e) => setSettings(s => ({ ...s, notificationsUnreadOnly: e.target.checked }))}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Mức độ thông báo</span>
          <select
            value={settings.notificationsSeverity}
            onChange={(e) => setSettings(s => ({ ...s, notificationsSeverity: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">Tất cả</option>
            <option value="warn">Cảnh báo</option>
            <option value="info">Thông tin</option>
          </select>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Giới hạn thông báo theo chi nhánh mặc định</span>
          <input
            type="checkbox"
            checked={settings.notificationsBranchScoped}
            onChange={(e) => setSettings(s => ({ ...s, notificationsBranchScoped: e.target.checked }))}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Làm mới thẻ thống kê</span>
            <input
              type="checkbox"
              checked={settings.dashboardRefreshStats}
              onChange={(e) => setSettings(s => ({ ...s, dashboardRefreshStats: e.target.checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Làm mới lịch hẹn</span>
            <input
              type="checkbox"
              checked={settings.dashboardRefreshAppointments}
              onChange={(e) => setSettings(s => ({ ...s, dashboardRefreshAppointments: e.target.checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Làm mới doanh thu chi nhánh</span>
            <input
              type="checkbox"
              checked={settings.dashboardRefreshRevenue}
              onChange={(e) => setSettings(s => ({ ...s, dashboardRefreshRevenue: e.target.checked }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
  const NotificationsPage = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Thông báo</h2>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={handleMarkAllRead} className="text-sm px-3 py-2 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200">
              Đánh dấu tất cả đã đọc
            </button>
          </div>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-gray-500">Không có thông báo</div>
          ) : (
            notifications.map(n => (
              <div key={n.Id} className={`p-4 border-b border-gray-100 ${n.DaDoc ? '' : 'bg-purple-50'}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${n.DaDoc ? 'bg-gray-300' : 'bg-red-500'}`}></div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{n.TieuDe}</p>
                    <p className="text-sm text-gray-600">{n.NoiDung}</p>
                    <p className="text-xs text-gray-400">{new Date(n.CreatedAt).toLocaleString('vi-VN')}</p>
                  </div>
                  {n.DaDoc ? (
                    <button disabled className="text-xs px-2 py-1 rounded-lg bg-gray-100 text-gray-500">Đã đọc</button>
                  ) : (
                    <button onClick={() => handleMarkRead(n.Id)} className="text-xs px-2 py-1 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200">Đánh dấu đã đọc</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const hasUnread = notifications.some(n => n.DaDoc === 0);

  const handleOpenNotifications = async () => {
    if (!notificationsOpen) await loadNotifications();
    setNotificationsOpen(v => !v);
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(list => list.map(n => n.Id === id ? { ...n, DaDoc: 1 } : n));
    } catch (e) {}
  };
  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(list => list.map(n => ({ ...n, DaDoc: 1 })));
    } catch (e) {}
  };

  const containerClass = settings.theme === 'dark' 
    ? 'flex h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700'
    : 'flex h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50';

  return (
    <div className={containerClass}>
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-white shadow-2xl transition-all duration-300 flex flex-col border-r border-purple-100`}>
        <div className="p-6 border-b border-purple-100 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">PetCareX</h1>
                <p className="text-xs text-gray-500">Chăm sóc thú cưng</p>
              </div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-purple-50 rounded-lg transition-colors">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <MenuItem icon={Home} label="Tổng Quan" page="dashboard" currentPage={currentPage} setCurrentPage={setCurrentPage} sidebarOpen={sidebarOpen} />
          <MenuItem icon={MapPin} label="Chi Nhánh" page="branches" currentPage={currentPage} setCurrentPage={setCurrentPage} sidebarOpen={sidebarOpen} />
          <MenuItem icon={Users} label="Khách Hàng" page="customers" currentPage={currentPage} setCurrentPage={setCurrentPage} sidebarOpen={sidebarOpen} />
          <MenuItem icon={Heart} label="Thú Cưng" page="pets" currentPage={currentPage} setCurrentPage={setCurrentPage} sidebarOpen={sidebarOpen} />
          <MenuItem icon={Activity} label="Báo Cáo" page="reports" currentPage={currentPage} setCurrentPage={setCurrentPage} sidebarOpen={sidebarOpen} />
          <MenuItem icon={Bell} label="Thông Báo" page="notifications" currentPage={currentPage} setCurrentPage={setCurrentPage} sidebarOpen={sidebarOpen} />
          <MenuItem icon={Settings} label="Cài Đặt" page="settings" currentPage={currentPage} setCurrentPage={setCurrentPage} sidebarOpen={sidebarOpen} />
        </nav>

        <div className="p-4 border-t border-purple-100">
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
            {sidebarOpen ? (
              <>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                  AD
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-800">Admin User</p>
                  <p className="text-xs text-gray-500">admin@petcarex.vn</p>
                </div>
                <button className="p-2 hover:bg-purple-100 rounded-lg transition-colors">
                  <LogOut size={18} className="text-gray-600" />
                </button>
                </>
            ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold mx-auto">
                    AD
          </div>)}
          </div>
        </div>
      </aside> 
{/* Main Content */}
  <main className="flex-1 overflow-y-auto">
    <header className="bg-white shadow-md border-b border-purple-100 sticky top-0 z-10">
      <div className="px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Tìm kiếm khách hàng, thú cưng, hóa đơn..." 
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button onClick={handleOpenNotifications} className="p-2.5 hover:bg-purple-50 rounded-xl transition-colors relative">
              <Bell size={20} className="text-gray-600" />
              {settings.showNotificationBadge && hasUnread && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl z-20">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-2">
                  <span className="font-semibold text-gray-800">Thông báo</span>
                  <div className="flex items-center gap-2">
                    <button onClick={handleMarkAllRead} className="text-xs px-2 py-1 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200">
                      Đánh dấu tất cả đã đọc
                    </button>
                    <button onClick={() => { setNotificationsOpen(false); setCurrentPage('notifications'); }} className="text-xs px-2 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">
                      Xem tất cả
                    </button>
                    <button onClick={() => setNotificationsOpen(false)} className="text-gray-500 hover:text-gray-700">
                      <X size={16} />
                    </button>
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-gray-500">Không có thông báo</div>
                  ) : (
                    notifications.map(n => (
                      <button key={n.Id} onClick={() => handleMarkRead(n.Id)} className={`w-full text-left p-4 flex items-start gap-3 hover:bg-purple-50 transition-colors ${n.DaDoc ? 'opacity-70' : ''}`}>
                        <div className={`w-2 h-2 rounded-full mt-2 ${n.DaDoc ? 'bg-gray-300' : 'bg-red-500'}`}></div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{n.TieuDe}</p>
                          <p className="text-sm text-gray-600">{n.NoiDung}</p>
                          <p className="text-xs text-gray-400">{new Date(n.CreatedAt).toLocaleString('vi-VN')}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <button onClick={() => setCurrentPage('settings')} className="p-2.5 hover:bg-purple-50 rounded-xl transition-colors">
            <Settings size={20} className="text-gray-600" />
          </button>
        </div>
      </div>
    </header>

    <div className="p-8">{renderPage()}</div>
  </main>
</div>
    );
};
export default App;
