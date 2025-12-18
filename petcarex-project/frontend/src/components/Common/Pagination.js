import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-gray-600">
        Trang {currentPage} / {totalPages}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;