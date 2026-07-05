'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '../lib/supabase';

// Динамічний імпорт компонентів із придушенням помилок типів
const LeadsKanban = dynamic<any>(() => import('../components/crm/LeadsKanban').then((mod) => mod.default), { ssr: false });
const ScheduleList = dynamic<any>(() => import('../components/crm/ScheduleList').then((mod) => mod.default), { ssr: false });
const StudentProfile = dynamic<any>(() => import('../components/crm/StudentProfile').then((mod) => mod.default), { ssr: false });
const StudentNotes = dynamic<any>(() => import('../components/crm/StudentNotes').then((mod) => mod.default), { ssr: false });
const AdminPanel = dynamic<any>(() => import('../components/crm/AdminPanel').then((mod) => mod.default), { ssr: false });

export default function Page() {
  const [activeTab, setActiveTab] = useState<'kanban' | 'schedule' | 'students' | 'notes' | 'admin'>('kanban');
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="flex h-screen bg-[#F4F7FC] text-[#1E293B] font-sans antialiased selection:bg-[#E2EFFFF] p-4 gap-4">
      
      {/* Сайдбар у стилі інфографіки з image_610eeb.jpg */}
      <aside className="w-64 bg-white flex flex-col justify-between p-6 rounded-3xl border border-[#E2E8F0] shadow-sm">
        <div>
          {/* Брендинг з іконкою додатка */}
          <div className="mb-8 px-1 flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#2F80ED] flex items-center justify-center shadow-md shadow-[#2F80ED]/20">
              <span className="text-white font-black text-sm tracking-tighter">V</span>
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-[#0F172A]">VOLYA CRM</h1>
              <p className="text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider">Екосистема</p>
            </div>
          </div>

          {/* Навігаційне меню */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('kanban')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                activeTab === 'kanban' 
                  ? 'bg-[#2F80ED] text-white shadow-lg shadow-[#2F80ED]/15' 
                  : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
              }`}
            >
              Канбан лідів
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                activeTab === 'schedule' 
                  ? 'bg-[#2F80ED] text-white shadow-lg shadow-[#2F80ED]/15' 
                  : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
              }`}
            >
              Розклад занять
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                activeTab === 'students' 
                  ? 'bg-[#2F80ED] text-white shadow-lg shadow-[#2F80ED]/15' 
                  : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
              }`}
            >
              Профілі учнів
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                activeTab === 'notes' 
                  ? 'bg-[#2F80ED] text-white shadow-lg shadow-[#2F80ED]/15' 
                  : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
              }`}
            >
              Нотатки та завдання
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                activeTab === 'admin' 
                  ? 'bg-[#2F80ED] text-white shadow-lg shadow-[#2F80ED]/15' 
                  : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
              }`}
            >
              Адмін-панель
            </button>
          </nav>
        </div>

        {/* Картка користувача внизу сайдбару */}
        <div className="bg-[#F8FAFC] rounded-2xl p-3 border border-[#E2E8F0]/60">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-[#E2EFFFF] flex items-center justify-center text-[#2F80ED] font-bold text-xs shrink-0">
              A
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] font-bold text-[#0F172A] truncate">{session?.user?.email || 'Admin Account'}</p>
              <p className="text-[9px] font-medium text-[#94A3B8]">Модератор</p>
            </div>
          </div>
          <button 
            onClick={() => supabase.auth.signOut()} 
            className="w-full text-center py-1.5 rounded-xl text-[10px] font-bold bg-white text-[#EF4444] border border-[#E2E8F0] hover:bg-[#FEF2F2] transition-colors"
          >
            Вийти із системи
          </button>
        </div>
      </aside>

      {/* Головна контентна зона */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Верхній заголовок */}
        <header className="mb-4 flex justify-between items-center bg-white py-3.5 px-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#94A3B8]">Робочий простір</span>
            <h2 className="text-base font-bold tracking-tight text-[#0F172A] mt-0.5">
              {activeTab === 'kanban' && 'Керування поточними лідами'}
              {activeTab === 'schedule' && 'Календарний розклад'}
              {activeTab === 'students' && 'Профілі та успішність учнів'}
              {activeTab === 'notes' && 'Внутрішня база нотаток'}
              {activeTab === 'admin' && 'Налаштування системи доступу'}
            </h2>
          </div>
        </header>

        {/* Робоче поле підкомпонентів із великим заокругленням */}
        <section className="flex-1 bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-sm overflow-y-auto">
          {activeTab === 'kanban' && <LeadsKanban />}
          {activeTab === 'schedule' && <ScheduleList />}
          {activeTab === 'students' && <StudentProfile />}
          {activeTab === 'notes' && <StudentNotes />}
          {activeTab === 'admin' && <AdminPanel />}
        </section>
      </main>
    </div>
  );
}
