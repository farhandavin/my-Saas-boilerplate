import React, { useState } from 'react';
import { ChevronDown, Check, PlusCircle, Building2 } from 'lucide-react';

const TeamSwitcher = ({ teams, activeTeam, onSwitch, onCreateNew }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative mb-6 px-2">
      {/* Tombol Utama */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-sm"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
            <Building2 size={18} />
          </div>
          <div className="text-left overflow-hidden">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-tighter">Active Team</p>
            <p className="text-sm font-bold text-slate-800 truncate">{activeTeam?.name || "Select Team"}</p>
          </div>
        </div>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-full left-2 right-2 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-2 animate-in fade-in zoom-in duration-200">
            <p className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase">My Teams</p>
            
            {teams.map((team) => (
              <button
                key={team.id}
                onClick={() => { onSwitch(team); setIsOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-slate-50 text-sm text-slate-700"
              >
                <span className={activeTeam?.id === team.id ? "font-bold text-blue-600" : ""}>
                  {team.name}
                </span>
                {activeTeam?.id === team.id && <Check size={14} className="text-blue-600" />}
              </button>
            ))}

            <hr className="my-2 border-slate-100" />
            
            <button 
              onClick={() => { onCreateNew(); setIsOpen(false); }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50"
            >
              <PlusCircle size={16} /> Create New Team
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TeamSwitcher;