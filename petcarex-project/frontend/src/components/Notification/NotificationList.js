import React, { useState, useEffect } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  AlertCircle,
  Info,
  Gift,
  FileText
} from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [pagination, setPagination] = useState({ page: 1, limit: 20 });

  useEffect(() => {
    loadNotifications();
  }, [filter, pagination.page]);

  const loadNotifications = async () => {
    try {
      setLoading(true);

      const params = {
        page: pagination.page,
        limit: pagination.limit
      };

      if (filter === 'unread') params.status = 'Chua doc';
      if (filter === 'read') params.status = 'Da doc';

      const response = await axios.get(`${API_URL}/notifications`, { params });

      setNotifications(response.data.data);
      setPagination(prev => ({
        ...prev,
        ...response.data.pagination
      }));
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`${API_URL}/notifications/${id}/read`);
      loadNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(`${API_URL}/notifications/read-all`);
      loadNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa thông báo này?')) {
      try {
        await axios.delete(`${API_URL}/notifications/${id}`);
        loadNotifications();
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    }
  };

  const deleteAllRead = async () => {
    if (window.confirm('Bạn có chắc muốn xóa tất cả thông báo đã đọc?')) {
      try {
        await axios.delete(`${API_URL}/notifications/read/all`);
        loadNotifications();
      } catch (error) {
        console.error('Error deleting read notifications:', error);
      }
    }
  };

  const getNotificationIcon = (type, priority) => {
    if (priority === 'Cao') {
      return <AlertCircle className="text-red-500" size={24} />;
    }

    switch (type) {
      case 'HoaDon':
        return <FileText className="text-blue-500" size={24} />;
      case 'KhuyenMai':
        return <Gift className="text-green-500" size={24} />;
      case 'HeThong':
        return <Info className="text-purple-500" size={24} />;
      default:
        return <Bell className="text-gray-500" size={24} />;
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      'Cao': 'bg-red-100 text-red-700',
      'Binh thuong': 'bg-blue-100 text-blue-700',
      'Thap': 'bg-gray-100 text-gray-700'
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${
          colors[priority] || colors['Binh thuong']
        }`}
      >
        {priority}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Thông Báo</h2>
          <p className="text-gray-500 mt-1">
            Quản lý các thông báo và cập nhật hệ thống
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <CheckCheck size={20} />
            Đánh dấu tất cả đã đọc
          </button>

          <button
            onClick={deleteAllRead}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
          >
            <Trash2 size={20} />
            Xóa đã đọc
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
        <div className="flex items-center gap-4">
          <Filter size={20} className="text-gray-500" />

          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tất cả
          </button>

          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Chưa đọc
          </button>

          <button
            onClick={() => setFilter('read')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'read'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Đã đọc
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Không có thông báo nào</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map(notif => (
              <div
                key={notif.MaThongBao}
                className={`p-6 hover:bg-purple-50 transition-colors ${
                  notif.TrangThai === 'Chua doc' ? 'bg-purple-25' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(
                      notif.LoaiThongBao,
                      notif.DoUuTien
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {notif.TieuDe}
                          {notif.TrangThai === 'Chua doc' && (
                            <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full inline-block"></span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(notif.NgayTao).toLocaleString('vi-VN')}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {getPriorityBadge(notif.DoUuTien)}
                      </div>
                    </div>

                    <p className="text-gray-600 mb-3">
                      {notif.NoiDung}
                    </p>

                    <div className="flex items-center gap-2">
                      {notif.TrangThai === 'Chua doc' && (
                        <button
                          onClick={() =>
                            markAsRead(notif.MaThongBao)
                          }
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm flex items-center gap-1"
                        >
                          <Check size={16} />
                          Đánh dấu đã đọc
                        </button>
                      )}

                      <button
                        onClick={() =>
                          deleteNotification(notif.MaThongBao)
                        }
                        className="px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm flex items-center gap-1"
                      >
                        <Trash2 size={16} />
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationList;
