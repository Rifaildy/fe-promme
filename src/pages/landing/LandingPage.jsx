import React from 'react';
import { Users, Briefcase } from 'lucide-react';
import Topbar from '../../components/layout/Topbar';
import Button from '../../components/ui/Button';

const LandingPage = ({ onNavigate }) => (
  <div className="min-h-screen bg-white flex flex-col w-full">
    <Topbar onNavigate={onNavigate} />
    <main className="flex-grow flex items-center bg-white w-full">
      <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 py-20 flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-1/2 pr-0 md:pr-16 text-center md:text-left mb-12 md:mb-0">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-[#404145] leading-[1.1] mb-6">
            Kolaborasi <span className="text-[#1dbf73]">Cerdas</span>,<br/> Hasil <span className="text-[#1dbf73]">Maksimal</span>.
          </h1>
          <p className="text-lg md:text-xl text-[#7a7d85] mb-8 max-w-xl">
            Platform marketplace yang mempertemukan Brand dengan Content Creator profesional secara transparan dan aman.
          </p>
          <Button onClick={() => onNavigate('register')} className="text-lg px-8 py-3 w-full sm:w-auto mx-auto md:mx-0">Mulai Sekarang</Button>
        </div>
        <div className="md:w-1/2 w-full flex justify-center md:justify-end">
          {/* Card Dekoratif */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg">
            <div className="bg-[#1dbf73] p-8 rounded-3xl text-white transform md:-rotate-3 shadow-xl">
              <Users size={40} className="mb-6 opacity-90" />
              <h3 className="font-bold text-2xl mb-2">10k+ Creators</h3>
              <p className="text-sm opacity-90">Kreator siap mempromosikan kampanye Anda.</p>
            </div>
            <div className="bg-[#404145] p-8 rounded-3xl text-white transform md:translate-y-12 md:rotate-3 shadow-xl">
              <Briefcase size={40} className="mb-6 opacity-90" />
              <h3 className="font-bold text-2xl mb-2">Aman & Jelas</h3>
              <p className="text-sm opacity-90">Sistem escrow terpercaya bagi Brand dan Creator.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
);

export default LandingPage;