
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MOCK_PROFESSIONALS, CATEGORIES } from '../constants';
import ExpertCard from './ExpertCard';
import { Search, SlidersHorizontal, ArrowUpDown, Grid, List, X } from 'lucide-react';

const ProfessionalList: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [activeCategory, setActiveCategory] = useState<string | null>(searchParams.get('cat') || null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filtered = MOCK_PROFESSIONALS.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !activeCategory || e.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pt-32 pb-20 px-4 min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">Elite Experts</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Access high-trust professionals across 10+ industries in Bangladesh.</p>
        </div>

        {/* Restore Unified Search & Filter Bar - Matching Home Style */}
        <div className="space-y-6 mb-12">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex flex-col md:flex-row items-center gap-3">
            <div className="flex-1 w-full relative flex items-center px-4">
              <Search className="w-5 h-5 text-slate-300" />
              <input 
                type="text" 
                placeholder="Search by name, expertise, or location..." 
                className="w-full pl-4 pr-4 py-4 bg-transparent outline-none text-slate-900 dark:text-white font-bold text-lg placeholder:text-slate-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="p-2 text-slate-300 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="hidden md:block h-12 w-px bg-slate-100 dark:bg-slate-800"></div>
            
            <div className="flex items-center gap-3 w-full md:w-auto px-2">
              <button 
                className={`flex items-center gap-2 px-8 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all ${activeCategory ? 'bg-primary-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300'}`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>
              
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-[1.5rem] border border-slate-100 dark:border-slate-700">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-900 text-primary-600 shadow-sm' : 'text-slate-400'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-900 text-primary-600 shadow-sm' : 'text-slate-400'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Improved Category Handling (Netflix Style Scroll) */}
          <div className="relative group">
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white dark:from-slate-950 to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white dark:from-slate-950 to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
              <button 
                onClick={() => setActiveCategory(null)}
                className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border-2 ${activeCategory === null ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-100 dark:border-slate-800 hover:border-primary-500'}`}
              >
                All Industries
              </button>
              {CATEGORIES.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                  className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border-2 ${activeCategory === cat ? 'bg-primary-600 text-white border-primary-600 shadow-xl shadow-primary-600/30' : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-100 dark:border-slate-800 hover:border-primary-500 hover:text-primary-600'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Metadata */}
        <div className="flex items-center justify-between mb-10 px-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Showing <span className="text-primary-600">{filtered.length}</span> Verified Members
          </p>
          <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            <ArrowUpDown className="w-4 h-4" /> Recommendation Sort
          </button>
        </div>

        {/* Expert Feed */}
        {filtered.length > 0 ? (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10" : "flex flex-col gap-8"}>
            {filtered.map(expert => (
              <ExpertCard key={expert.id} expert={expert} user={null} />
            ))}
          </div>
        ) : (
          <div className="py-40 text-center glass rounded-[4rem] border border-slate-200 dark:border-slate-800">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">No experts matched your search</p>
            <p className="text-slate-500 mt-2 font-medium">Try broader keywords or different industry categories.</p>
            <button 
              onClick={() => { setSearchTerm(''); setActiveCategory(null); }} 
              className="mt-8 text-primary-600 font-black text-[10px] uppercase tracking-widest hover:underline"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Pagination UI */}
        {filtered.length > 0 && (
          <div className="mt-20 flex items-center justify-center gap-2">
             <button className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-400 font-black flex items-center justify-center border border-slate-200 dark:border-slate-800 opacity-50">1</button>
             <button className="w-10 h-10 rounded-xl bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-black flex items-center justify-center border border-slate-200 dark:border-slate-800 hover:border-primary-500 transition-all">2</button>
             <button className="w-10 h-10 rounded-xl bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-black flex items-center justify-center border border-slate-200 dark:border-slate-800 hover:border-primary-500 transition-all">3</button>
             <div className="w-6 flex justify-center text-slate-400">...</div>
             <button className="w-10 h-10 rounded-xl bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-black flex items-center justify-center border border-slate-200 dark:border-slate-800 hover:border-primary-500 transition-all text-[10px]">12</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalList;
