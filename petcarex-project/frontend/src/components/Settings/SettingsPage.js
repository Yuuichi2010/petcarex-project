import React, { useState, useEffect } from 'react';
import { Settings, Save, RotateCcw, Building2, Mail, Phone, DollarSign, Clock, Shield, AlertTriangle, Activity } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const SettingsPage = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('HeThong');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/settings`);
      
      // Convert array to object for easier access
      const settingsObj = {};
      response.data.data.forEach(setting => {
        settingsObj[setting.TenCaiDat] = setting.GiaTri;
      });
      
      setSettings(settingsObj);
    } catch (error) {
      console.error('Error loading settings:', error);
      alert('Lỗi khi tải cài đặt');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Convert object back to array
      const settingsArray = Object.keys(settings).map(key => ({
        TenCaiDat: key,
        GiaTri: settings[key]
      }));

      await axios.put(`${API_URL}/settings/bulk/update`, {
        settings: settingsArray
      });

      alert('Lưu cài đặt thành công!');
      loadSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Lỗi khi lưu cài đặt');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Bạn có chắc muốn khôi phục cài đặt mặc định? Hành động này không thể hoàn tác!')) {
      try {
        await axios.post(`${API_URL}/settings/reset`);
        alert('Đã khôi phục cài đặt mặc định!');
        loadSettings();
      } catch (error) {
        console.error('Error resetting settings:', error);
        alert('Lỗi khi khôi phục cài đặt');
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Đang tải cài đặt...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Cài Đặt Hệ Thống</h2>
          <p className="text-gray-500 mt-1">Quản lý cấu hình và tùy chỉnh hệ thống</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={20} />
            Khôi phục mặc định
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all font-medium flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={20} />
            {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="border-b border-gray-200">
          <div className="flex gap-4 px-6">
            <TabButton
              icon={Building2}
              label="Hệ Thống"
              active={activeTab === 'HeThong'}
              onClick={() => setActiveTab('HeThong')}
            />
            <TabButton
              icon={Mail}
              label="Email"
              active={activeTab === 'Email'}
              onClick={() => setActiveTab('Email')}
            />
            <TabButton
              icon={DollarSign}
              label="Khuyến Mãi"
              active={activeTab === 'KhuyenMai'}
              onClick={() => setActiveTab('KhuyenMai')}
            />
            <TabButton
              icon={Activity}
              label="Lịch Sử"
              active={activeTab === 'LichSu'}
              onClick={() => setActiveTab('LichSu')}
            />
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'HeThong' && (
            <SystemSettings settings={settings} onChange={handleChange} />
          )}
          {activeTab === 'Email' && (
            <EmailSettings settings={settings} onChange={handleChange} />
          )}
          {activeTab === 'KhuyenMai' && (
            <PromotionSettings settings={settings} onChange={handleChange} />
          )}
          {activeTab === 'LichSu' && (
            <ActivityLog />
          )}
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-3 font-medium border-b-2 transition-colors flex items-center gap-2 ${
      active
        ? 'border-purple-500 text-purple-600'
        : 'border-transparent text-gray-500 hover:text-gray-700'
    }`}
  >
    <Icon size={20} />
    {label}
  </button>
);

const SystemSettings = ({ settings, onChange }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SettingInput
        icon={Building2}
        label="Tên Hệ Thống"
        value={settings.TenHeThong || ''}
        onChange={(e) => onChange('TenHeThong', e.target.value)}
        description="Tên hiển thị của hệ thống"
      />
      
      <SettingInput
        icon={Phone}
        label="Số Điện Thoại Hotline"
        value={settings.SDTHotline || ''}
        onChange={(e) => onChange('SDTHotline', e.target.value)}
        description="Số hotline hỗ trợ khách hàng"
      />
      
      <SettingInput
        icon={Mail}
        label="Email Hệ Thống"
        type="email"
        value={settings.EmailHeThong || ''}
        onChange={(e) => onChange('EmailHeThong', e.target.value)}
        description="Email chính của hệ thống"
        className="md:col-span-2"
      />
      
      <SettingInput
        icon={Building2}
        label="Địa Chỉ Trụ Sở"
        value={settings.DiaChiTruSo || ''}
        onChange={(e) => onChange('DiaChiTruSo', e.target.value)}
        description="Địa chỉ trụ sở chính"
        className="md:col-span-2"
      />
      
      <SettingInput
        icon={Clock}
        label="Giờ Mở Cửa"
        type="time"
        value={settings.ThoiGianMoCua || ''}
        onChange={(e) => onChange('ThoiGianMoCua', e.target.value)}
        description="Giờ mở cửa mặc định"
      />
      
      <SettingInput
        icon={Clock}
        label="Giờ Đóng Cửa"
        type="time"
        value={settings.ThoiGianDongCua || ''}
        onChange={(e) => onChange('ThoiGianDongCua', e.target.value)}
        description="Giờ đóng cửa mặc định"
      />
    </div>

    <div className="border-t pt-6">
      <div className="flex items-start gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
        <AlertTriangle className="text-yellow-600 flex-shrink-0" size={24} />
        <div>
          <h4 className="font-semibold text-yellow-800 mb-1">Chế Độ Bảo Trì</h4>
          <p className="text-sm text-yellow-700 mb-3">
            Khi bật chế độ bảo trì, hệ thống sẽ tạm thời không cho phép người dùng truy cập
          </p>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.BaoTriHeThong === 'true'}
              onChange={(e) => onChange('BaoTriHeThong', e.target.checked ? 'true' : 'false')}
              className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-300"
            />
            <span className="font-medium text-gray-700">Bật chế độ bảo trì</span>
          </label>
        </div>
      </div>
    </div>

    <div className="border-t pt-6">
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div>
          <h4 className="font-semibold text-gray-800">Phiên Bản Hệ Thống</h4>
          <p className="text-sm text-gray-600">Version {settings.PhienBan || '1.0.0'}</p>
        </div>
        <Shield className="text-gray-400" size={32} />
      </div>
    </div>
  </div>
);

const EmailSettings = ({ settings, onChange }) => (
  <div className="space-y-6">
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
      <h4 className="font-semibold text-blue-800 mb-2">Cấu Hình Email</h4>
      <p className="text-sm text-blue-700">
        Cài đặt thông tin email để gửi thông báo và xác nhận cho khách hàng
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SettingInput
        icon={Mail}
        label="Email Gửi"
        type="email"
        value={settings.EmailHeThong || ''}
        onChange={(e) => onChange('EmailHeThong', e.target.value)}
        description="Địa chỉ email gửi thông báo"
        className="md:col-span-2"
      />
    </div>
  </div>
);

const PromotionSettings = ({ settings, onChange }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
        <h4 className="font-semibold text-green-800 mb-2">Chương Trình Khuyến Mãi & Hội Viên</h4>
        <p className="text-sm text-green-700">
          Cấu hình các mức chi tiêu, ưu đãi và tích điểm cho khách hàng
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="font-bold text-gray-800 text-lg">Tích Điểm Loyalty</h4>
        <SettingInput
          icon={DollarSign}
          label="Tỷ Lệ Tích Điểm"
          type="number"
          value={settings.TyLeDiemTichLuy || ''}
          onChange={(e) => onChange('TyLeDiemTichLuy', e.target.value)}
          description={`1 điểm = ${formatCurrency(settings.TyLeDiemTichLuy || 50000)} VNĐ`}
          suffix="VNĐ"
        />
      </div>

      <div className="border-t pt-6 space-y-4">
        <h4 className="font-bold text-gray-800 text-lg">Hạng Thân Thiết</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SettingInput
            icon={DollarSign}
            label="Chi Tiêu Để Đạt Hạng"
            type="number"
            value={settings.ChiTieuDatHangThanThiet || ''}
            onChange={(e) => onChange('ChiTieuDatHangThanThiet', e.target.value)}
            description="Chi tiêu tối thiểu để đạt hạng Thân thiết"
            suffix="VNĐ"
          />
          <SettingInput
            icon={DollarSign}
            label="Chi Tiêu Để Giữ Hạng"
            type="number"
            value={settings.ChiTieuGiuHangThanThiet || ''}
            onChange={(e) => onChange('ChiTieuGiuHangThanThiet', e.target.value)}
            description="Chi tiêu tối thiểu/năm để giữ hạng"
            suffix="VNĐ"
          />
          <SettingInput
            icon={DollarSign}
            label="Ưu Đãi"
            type="number"
            value={settings.UuDaiHangThanThiet || ''}
            onChange={(e) => onChange('UuDaiHangThanThiet', e.target.value)}
            description="Phần trăm giảm giá cho hạng Thân thiết"
            suffix="%"
          />
        </div>
      </div>

      <div className="border-t pt-6 space-y-4">
        <h4 className="font-bold text-gray-800 text-lg">Hạng VIP</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SettingInput
            icon={DollarSign}
            label="Chi Tiêu Để Đạt Hạng"
            type="number"
            value={settings.ChiTieuDatHangVIP || ''}
            onChange={(e) => onChange('ChiTieuDatHangVIP', e.target.value)}
            description="Chi tiêu tối thiểu để đạt hạng VIP"
            suffix="VNĐ"
          />
          <SettingInput
            icon={DollarSign}
            label="Chi Tiêu Để Giữ Hạng"
            type="number"
            value={settings.ChiTieuGiuHangVIP || ''}
            onChange={(e) => onChange('ChiTieuGiuHangVIP', e.target.value)}
            description="Chi tiêu tối thiểu/năm để giữ hạng"
            suffix="VNĐ"
          />
          <SettingInput
            icon={DollarSign}
            label="Ưu Đãi"
            type="number"
            value={settings.UuDaiHangVIP || ''}
            onChange={(e) => onChange('UuDaiHangVIP', e.target.value)}
            description="Phần trăm giảm giá cho hạng VIP"
            suffix="%"
          />
        </div>
      </div>
    </div>
  );
};

const SettingInput = ({ icon: Icon, label, value, onChange, type = 'text', description, suffix, className = '' }) => (
  <div className={className}>
    <label className="block mb-3">
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon size={18} className="text-gray-500" />}
        <span className="font-semibold text-gray-700">{label}</span>
      </div>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={onChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all"
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
            {suffix}
          </span>
        )}
      </div>
      {description && (
        <p className="text-sm text-gray-500 mt-2">{description}</p>
      )}
    </label>
  </div>
);

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivityLog();
  }, []);

  const loadActivityLog = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/activity-log`, {
        params: { limit: 50 }
      });
      setLogs(response.data.data);
    } catch (error) {
      console.error('Error loading activity log:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Đang tải lịch sử...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Lịch Sử Thao Tác Hệ Thống</h3>
      <div className="space-y-3">
        {logs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Chưa có lịch sử thao tác</p>
        ) : (
          logs.map(log => (
            <div key={log.MaLichSu} className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-purple-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      log.HanhDong === 'CREATE' ? 'bg-green-100 text-green-700' :
                      log.HanhDong === 'UPDATE' ? 'bg-blue-100 text-blue-700' :
                      log.HanhDong === 'DELETE' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {log.HanhDong}
                    </span>
                    <span className="font-semibold text-gray-800">{log.TenNhanVien || 'Hệ thống'}</span>
                    <span className="text-sm text-gray-500">• {log.BangThaoTac}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    IP: {log.DiaChi_IP || 'N/A'} • {new Date(log.ThoiGian).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SettingsPage;