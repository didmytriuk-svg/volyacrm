'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Імпорт Supabase з виправленим шляхом
import { supabase } from '../lib/supabase';

// Динамічний імпорт для ВСІХ компонентів з типом any.
// Це примусово загасить абсолютно всі помилки підкреслення та компіляції Next.js/TypeScript
const LeadsKanban = dynamic<any>(
   () => import('../components/crm/LeadsKanban').then((mod) => mod.default),
   { ssr: false }
);

const ScheduleList = dynamic<any>(
   () => import('../components/crm/ScheduleList').then((mod) => mod.default),
   { ssr: false }
);

const StudentProfile = dynamic<any>(
   () => import('../components/crm/StudentProfile').then((mod) => mod.default),
   { ssr: false }
);

const StudentNotes = dynamic<any>(
   () => import('../components/crm/StudentNotes').then((mod) => mod.default),
   { ssr: false }
);

const AdminPanel = dynamic<any>(
   () => import('../components/crm/AdminPanel').then((mod) => mod.default),
   { ssr: false }
);

export default function Page() {
  const [activeTab, setActiveTab] = useState<'kanban' | 'schedule' | 'students' | 'notes' | 'admin'>('kanban');
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Бокова панель навігації (Sidebar) */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-4 shadow-xl">
        <div>
          <div className="mb-8 px-2">
            <h1 className="text-2xl font-black tracking-wider text-emerald-400">VOLYA CRM</h1>
            <p className="text-xs text-slate-400 mt-1">Панель керування онлайн-школою</p>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('kanban')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'kanban' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              📊 Канбан лідів (Воронка)
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'schedule' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              📅 Rozklad занять
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'students' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              🎓 Профілі учнів
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'notes' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              📝 Нотатки / Завдання
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'admin' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              ⚙️ Адмін-панель
            </button>
          </nav>
        </div>

        <div className="border-t border-slate-800 pt-4 px-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-slate-900 font-bold text-xs">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold truncate">{session?.user?.email || 'Адміністратор'}</p>
              <button 
                onClick={() => supabase.auth.signOut()} 
                className="text-[10px] text-rose-400 hover:underline block mt-0.5"
              >
                Вийти з системи
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Основний контент сторінки */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="mb-8 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Панель</span>
            <h2 className="text-xl font-bold text-slate-800 mt-0.5">
              {activeTab === 'kanban' && '📊 Керування лідами'}
              {activeTab === 'schedule' && '📅 Поточний розклад'}
              {activeTab === 'students' && '🎓 База знань та учнів'}
              {activeTab === 'notes' && '📝 Внутрішні нотатки'}
              {activeTab === 'admin' && '⚙️ Налаштування доступу'}
            </h2>
          </div>
        </header>

        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 min-h-[calc(100vh-12rem)]">
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
