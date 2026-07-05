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
    <div className="flex h-screen bg-[#fafafa] text-[#171717] font-sans antialiased selection:bg-neutral-200">
      
      {/* Преміальний мінімалістичний сайдбар без емодзі */}
      <aside className="w-64 bg-white flex flex-col justify-between p-6 border-r border-neutral-200/60 shadow-sm">
        <div>
          {/* Логотип та підзаголовок */}
          <div className="mb-9 px-1">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-neutral-900 block tracking-tight"></span>
              <h1 className="text-base font-bold tracking-tight text-neutral-900">VOLYA CRM</h1>
            </div>
            <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mt-2">Management System</p>
          </div>

          {/* Навігація в стилі Linear */}
          <nav className="space-y-0.5">
            <button
              onClick={() => setActiveTab('kanban')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium tracking-wide transition-all duration-150 ${
                activeTab === 'kanban' 
                  ? 'bg-neutral-900 text-white font-semibold' 
                  : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'
              }`}
            >
              Канбан лідів
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium tracking-wide transition-all duration-150 ${
                activeTab === 'schedule' 
                  ? 'bg-neutral-900 text-white font-semibold' 
                  : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'
              }`}
            >
              Розклад занять
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium tracking-wide transition-all duration-150 ${
                activeTab === 'students' 
                  ? 'bg-neutral-900 text-white font-semibold' 
                  : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'
              }`}
            >
              Профілі учнів
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium tracking-wide transition-all duration-150 ${
                activeTab === 'notes' 
                  ? 'bg-neutral-900 text-white font-semibold' 
                  : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'
              }`}
            >
              Нотатки та завдання
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium tracking-wide transition-all duration-150 ${
                activeTab === 'admin' 
                  ? 'bg-neutral-900 text-white font-semibold' 
                  : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'
              }`}
            >
              Адмін-панель
            </button>
          </nav>
        </div>

        {/* Акуратний блок користувача внизу */}
        <div className="border-t border-neutral-100 pt-5 px-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-6 h-6 rounded-md bg-neutral-100 flex items-center justify-center text-neutral-700 font-bold text-[10px] border border-neutral-200/40 shrink-0">
                A
              </div>
              <p className="text-xs font-medium text-neutral-600 truncate">{session?.user?.email || 'Admin User'}</p>
            </div>
            <button 
              onClick={() => supabase.auth.signOut()} 
              className="text-[11px] font-medium text-neutral-400 hover:text-neutral-900 transition-colors shrink-0 ml-2"
            >
              Вийти
            </button>
          </div>
        </div>
      </aside>

      {/* Головна контентна зона */}
      <main className="flex-1 overflow-y-auto p-8">
        
        {/* Чистий заголовок без емодзі */}
        <header className="mb-8 pb-4 border-b border-neutral-200/60 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Система</span>
            <h2 className="text-xl font-bold tracking-tight text-neutral-900 mt-1">
              {activeTab === 'kanban' && 'Керування лідами'}
              {activeTab === 'schedule' && 'Поточний розклад'}
              {activeTab === 'students' && 'База знань та учнів'}
              {activeTab === 'notes' && 'Внутрішні нотатки'}
              {activeTab === 'admin' && 'Налаштування доступу'}
            </h2>
          </div>
        </header>

        {/* Робоче поле підкомпонентів */}
        <section className="bg-white rounded-xl p-6 border border-neutral-200/50 shadow-sm min-h-[calc(100vh-11.5rem)]">
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
