import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  loading = false,
  totalItems = 0,
  limit = 10
}) => {
  if (totalPages <= 1 && totalItems <= limit) return null;

  const pages = [];
  const maxVisible = 5;
  
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2">
      <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">
        Showing <span className="text-[#404145]">{(currentPage - 1) * limit + 1}</span> to{' '}
        <span className="text-[#404145]">{Math.min(currentPage * limit, totalItems)}</span> of{' '}
        <span className="text-[#404145]">{totalItems}</span> entries
      </div>
      
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={16} />
        </button>
        
        {start > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className={`min-w-[36px] h-9 rounded-lg border border-gray-200 text-sm font-bold transition-all ${
                currentPage === 1 ? 'bg-[#1dbf73] text-white border-[#1dbf73]' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              1
            </button>
            {start > 2 && <span className="px-1 text-gray-400">...</span>}
          </>
        )}
        
        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            disabled={loading}
            className={`min-w-[36px] h-9 rounded-lg border border-gray-200 text-sm font-bold transition-all ${
              page === currentPage 
                ? 'bg-[#1dbf73] text-white border-[#1dbf73] shadow-md shadow-green-100' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}
        
        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="px-1 text-gray-400">...</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className={`min-w-[36px] h-9 rounded-lg border border-gray-200 text-sm font-bold transition-all ${
                currentPage === totalPages ? 'bg-[#1dbf73] text-white border-[#1dbf73]' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {totalPages}
            </button>
          </>
        )}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
