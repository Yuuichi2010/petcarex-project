import React, { useState, useEffect } from 'react';
import Modal from '../Common/Modal';
import { getPetById, getPetMedicalHistory, getPetVaccinationHistory } from '../../services/api';
import { Heart, Calendar, Stethoscope, Syringe, FileText } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const PetDetailModal = ({ petId, onClose }) => {
  const [pet, setPet] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [vaccinationHistory, setVaccinationHistory] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    if (petId) {
      loadPetDetail();
    }
  }, [petId]);

  const loadPetDetail = async () => {
    try {
      setLoading(true);
      const [petResponse, medicalResponse, vaccinationResponse, invoicesResponse] = await Promise.all([
        getPetById(petId),
        getPetMedicalHistory(petId),
        getPetVaccinationHistory(petId),
        axios.get(`${API_URL}/pets/${petId}/invoices`)
      ]);

      setPet(petResponse?.data || null);
      setMedicalHistory(medicalResponse?.data || []);
      setVaccinationHistory(vaccinationResponse?.data || []);
      setInvoices(invoicesResponse?.data?.data || []);
    } catch (error) {
      console.error('Error loading pet detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value || 0);
  };

  if (loading) {
    return (
      <Modal isOpen={true} onClose={onClose} title="Chi Tiết Thú Cưng" size="lg">
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </Modal>
    );
  }

  if (!pet) return null;

  return (
    <Modal isOpen={true} onClose={onClose} title="Chi Tiết Thú Cưng" size="lg">
      <div className="space-y-6">
        {/* Thông tin cơ bản */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-4xl shadow-lg">
              🐾
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{pet.TenThuCung}</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Heart size={16} className="text-pink-500" />
                  <span><strong>Loài:</strong> {pet.LoaiThuCung}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span><strong>Giống:</strong> {pet.GiongThuCung}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={16} className="text-blue-500" />
                  <span><strong>Ngày sinh:</strong> {pet.NgaySinh ? new Date(pet.NgaySinh).toLocaleDateString('vi-VN') : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span><strong>Giới tính:</strong> {pet.GioiTinhThuCung}</span>
                </div>
              </div>
              <div className="mt-3 p-3 bg-white rounded-lg">
                <p className="text-sm text-gray-600"><strong>Chủ sở hữu:</strong> {pet.TenChuSoHuu}</p>
                <p className="text-sm text-gray-600"><strong>SĐT:</strong> {pet.SDT}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === 'info'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Thông Tin
            </button>
            <button
              onClick={() => setActiveTab('medical')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'medical'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <Stethoscope size={16} />
              Lịch Sử Khám ({medicalHistory.length})
            </button>
            <button
              onClick={() => setActiveTab('vaccination')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'vaccination'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <Syringe size={16} />
              Lịch Sử Tiêm ({vaccinationHistory.length})
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'invoices'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <FileText size={16} />
              Hóa Đơn ({invoices.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'info' && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h4 className="font-bold text-gray-800 mb-2">Tình Trạng Sức Khỏe</h4>
              <p className="text-gray-600">{pet.TinhTrangSucKhoe}</p>
            </div>
          </div>
        )}

        {activeTab === 'medical' && (
          <div className="space-y-3">
            {medicalHistory.length === 0 ? (
              <p className="text-gray-500 text-center py-6">Chưa có lịch sử khám bệnh</p>
            ) : (
              medicalHistory.map((record, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4">
                  <p className="font-semibold text-gray-800">
                    {record.NgayKham ? new Date(record.NgayKham).toLocaleDateString('vi-VN') : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">Bác sĩ: {record.TenBacSi}</p>
                  <p className="text-sm text-gray-600">Chi nhánh: {record.TenChiNhanh}</p>
                  <div className="mt-2 text-sm space-y-1">
                    <p><strong>Triệu chứng:</strong> {record.TrieuChung}</p>
                    <p><strong>Chuẩn đoán:</strong> {record.ChuanDoan}</p>
                    <p><strong>Toa thuốc:</strong> {record.ToaThuoc}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'vaccination' && (
          <div className="space-y-3">
            {vaccinationHistory.length === 0 ? (
              <p className="text-gray-500 text-center py-6">Chưa có lịch sử tiêm chủng</p>
            ) : (
              vaccinationHistory.map((record, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4">
                  <p className="font-semibold text-gray-800">
                    {record.NgayTiem ? new Date(record.NgayTiem).toLocaleDateString('vi-VN') : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">Bác sĩ: {record.TenBacSi}</p>
                  <p className="text-sm text-gray-600">Chi nhánh: {record.TenChiNhanh}</p>
                  <div className="mt-2 text-sm space-y-1">
                    <p><strong>Vắc-xin:</strong> {record.TenVacXin} ({record.LoaiVacXin})</p>
                    <p><strong>Mũi tiêm:</strong> {record.TenMuiTiem}</p>
                    <p><strong>Liều lượng:</strong> {record.LieuLuong}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="space-y-3">
            {invoices.length === 0 ? (
              <p className="text-gray-500 text-center py-6">Chưa có hóa đơn nào</p>
            ) : (
              invoices.map((invoice) => (
                <div key={invoice.MaHoaDon} className="bg-white border border-gray-200 rounded-xl p-4">
                  <p className="font-semibold text-gray-800">Hóa đơn #{invoice.MaHoaDon}</p>
                  <p className="text-sm text-gray-600">{invoice.TenChiNhanh}</p>
                  <p className="text-xs text-gray-500">{new Date(invoice.NgayLap).toLocaleString('vi-VN')}</p>
                  <p className="text-lg font-bold text-purple-600">{formatCurrency(invoice.ThanhTien)}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PetDetailModal;