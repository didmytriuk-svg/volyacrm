"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import StudentProfile from '../components/crm/StudentProfile';
import AdminPanel from '../components/crm/AdminPanel';
import ScheduleList from '../components/crm/ScheduleList';
import LeadsKanban from '../components/crm/LeadsKanban';
import StudentNotes from '../components/crm/StudentNotes';

export default function Home() {
  // Список усіх учнів для глобального селектора верхнього рівня
  const [students, setStudents] = useState<{ id: string; name: string; student_class: number }[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  
  // Реактивний тригер оновлення даних у дочірніх компонентах при змінах у базі
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Глобальний режим CRM: 'sales' (Воронка лідів) або 'workspace' (Операційний простір школи)
  const [crmMode, setCrmMode] = useState<'sales' | 'workspace'>('sales');
  
  // Підрежими (вкладки) для правої робочої колонки у просторі школи
  const [workspaceTab, setWorkspaceTab] = useState<'journal' | 'contract' | 'lesson' | 'teacher'>('journal');

  // Глобальний ефект для завантаження актуального списку учнів
  useEffect(() => {
    async function loadAllStudents() {
      const { data, error } = await supabase
        .from('students')
        .select('id, name, student_class')
        .order('name', { ascending: true });

      if (!error && data) {
        setStudents(data);
        // Якщо учень ще не обраний в сесії, підставляємо першого доступного з бази
        if (data.length > 0 && !selectedStudentId) {
          setSelectedStudentId(data[0].id);
        }
      }
    }
    loadAllStudents();
  }, [refreshTrigger]);

  const handleDataRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#eceff1] text-slate-900 antialiased font-sans flex flex-col">
      
      {/* 🏛️ GLOBAL HIGH-END NAVIGATION HEADER (SaaS Layout Matching image_71cdd5.jpg) */}
      <header className="bg-[#f8fafc] border-b border-slate-200/60 px-8 py-4 sticky top-0 z-50 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-6">
          {/* LOGO BRAND */}
          <span className="text-xl font-black tracking-widest text-slate-900">VOLYA</span>
          <div className="h-4 w-[1px] bg-slate-300 hidden lg:block" />
          
          {/* TOP LEVEL MODULE SWITCHER */}
          <div className="flex bg-slate-200/60 p-1 rounded-xl gap-1">
            <button 
              onClick={() => setCrmMode('sales')}
              className={`px-5 py-1.5 text-xs font-bold rounded-lg transition-all uppercase tracking-wider ${crmMode === 'sales' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              01 воронка лідів
            </button>
            <button 
              onClick={() => setCrmMode('workspace')}
              className={`px-5 py-1.5 text-xs font-bold rounded-lg transition-all uppercase tracking-wider ${crmMode === 'workspace' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              02 робочий простір
            </button>
          </div>
        </div>

        {/* DYNAMIC NAVIGATION DEPENDING ON SELECTION MODE */}
        {crmMode === 'workspace' && (
          <div className="flex flex-wrap items-center gap-4 transition-all duration-200">
            {/* HORIZONTAL WORKSPACE TABS CONTROL */}
            <div className="flex bg-slate-200/60 p-1 rounded-xl gap-1">
              <button 
                onClick={() => setWorkspaceTab('journal')}
                className={`px-3.5 py-1 text-xs font-bold rounded-lg transition-all ${workspaceTab === 'journal' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Журнал занять
              </button>
              <button 
                onClick={() => setWorkspaceTab('contract')}
                className={`px-3.5 py-1 text-xs font-bold rounded-lg transition-all ${workspaceTab === 'contract' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Новий договір
              </button>
              <button 
                onClick={() => setWorkspaceTab('lesson')}
                className={`px-3.5 py-1 text-xs font-bold rounded-lg transition-all ${workspaceTab === 'lesson' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Призначити урок
              </button>
              <button 
                onClick={() => setWorkspaceTab('teacher')}
                className={`px-3.5 py-1 text-xs font-bold rounded-lg transition-all ${workspaceTab === 'teacher' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Новий викладач
              </button>
            </div>

            {/* GLOBAL STUDENT SELECTOR BADGE */}
            <div className="flex items-center gap-3 bg-white border border-slate-200/80 px-4 py-2 rounded-xl shadow-sm min-w-[250px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Учень:</span>
              <select 
                value={selectedStudentId} 
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                {students.length === 0 ? (
                  <option>База учнів порожня</option>
                ) : (
                  students.map(st => (
                    <option key={st.id} value={st.id}>{st.name} ({st.student_class} клас)</option>
                  ))
                )}
              </select>
            </div>
          </div>
        )}
      </header>

      {/* 🖥️ MAIN ECOSYSTEM RENDERER ZONE */}
      <div className="w-full flex-1 flex flex-col">
        {crmMode === 'sales' ? (
          /* MODULE 01: MARKETING KANBAN PIPELINE VIEW */
          <div className="max-w-7xl mx-auto w-full px-4 lg:px-8 py-8 transition-all">
            <LeadsKanban onLeadConverted={handleDataRefresh} />
          </div>
        ) : (
          /* MODULE 02-04: PREMIUM TWO-COLUMN SaaS COMPONENT SPREAD */
          <div className="max-w-7xl mx-auto w-full px-4 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* 🟦 LEFT COLUMN: THE PREMIUM BLUE METRICS & FINANCIAL PROFILES CARD (33% Width / 4 Slots) */}
            <div className="lg:col-span-4 lg:sticky lg:top-24">
              {selectedStudentId ? (
                <StudentProfile key={`profile-${selectedStudentId}-${refreshTrigger}`} studentId={selectedStudentId} />
              ) : (
                <div className="bg-blue-600 rounded-3xl p-6 text-white text-center py-16 shadow-xl shadow-blue-600/10">
                  <p className="text-sm font-bold opacity-75">Оберіть або зарахуйте учня для активізації фінансової аналітики</p>
                </div>
              )}
            </div>

            {/* ⬜ RIGHT COLUMN: OPERATIONAL INPUTS & JOURNAL LEDGERS (66% Width / 8 Slots) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* TAB 1: ACADEMIC LMS JOURNAL & MANAGEMENT NOTES LOG */}
              {workspaceTab === 'journal' && selectedStudentId && (
                <>
                  <ScheduleList key={`schedule-${selectedStudentId}-${refreshTrigger}`} studentId={selectedStudentId} onLessonUpdated={handleDataRefresh} />
                  <StudentNotes key={`notes-${selectedStudentId}-${refreshTrigger}`} studentId={selectedStudentId} />
                </>
              )}

              {/* TAB 2: MANUAL REGISTRATION OF NEW CONTRACTS / PACKAGES */}
              {workspaceTab === 'contract' && (
                <AdminPanel mode="contract" studentId={selectedStudentId} onDataAdded={() => { handleDataRefresh(); setWorkspaceTab('journal'); }} />
              )}

              {/* TAB 3: SCHEDULING NEW LESSON TIME SLOTS */}
              {workspaceTab === 'lesson' && (
                <AdminPanel mode="lesson" studentId={selectedStudentId} onDataAdded={() => { handleDataRefresh(); setWorkspaceTab('journal'); }} />
              )}

              {/* TAB 4: CREATING NEW TEACHER PROFILES */}
              {workspaceTab === 'teacher' && (
                <AdminPanel mode="teacher" studentId={selectedStudentId} onDataAdded={() => { handleDataRefresh(); setWorkspaceTab('journal'); }} />
              )}
              
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

