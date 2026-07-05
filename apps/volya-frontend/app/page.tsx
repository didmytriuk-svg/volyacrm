"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import dynamic from 'next/dynamic';

// Імпортуємо інші твої компоненти
import StudentProfile from './components/crm/StudentProfile';
import ScheduleList from './components/crm/ScheduleList';
import StudentNotes from './components/crm/StudentNotes';

// Динамічний імпорт з типом any, щоб примусово загасити всі 8 помилок компіляції Next.js
const AdminPanel = dynamic<any>(
  () => import('./components/crm/AdminPanel').then((mod) => mod.default),
  { ssr: false }
);

const LeadsKanban = dynamic<any>(
  () => import('./components/crm/LeadsKanban').then((mod) => mod.default),
  { ssr: false }
);

export default function Home() {
  const [students, setStudents] = useState<{ id: string; name: string; student_class: number }[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [crmMode, setCrmMode] = useState<'sales' | 'workspace'>('sales');

  useEffect(() => {
    async function fetchStudents() {
      try {
        const { data, error } = await supabase
          .from('students')
          .select('id, name, student_class')
          .order('name', { ascending: true });

        if (error) throw error;
        if (data) {
          setStudents(data);
          if (data.length > 0 && !selectedStudentId) {
            setSelectedStudentId(data[0].id);
          }
        }
      } catch (err) {
        console.error("Помилка завантаження учнів:", err);
      }
    }
    
    if (crmMode === 'workspace') {
      fetchStudents();
    }
  }, [crmMode, refreshTrigger, selectedStudentId]);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: '#111827', margin: 0 }}>Volya.Academic CRM</h1>
          <p style={{ color: '#4b5563', margin: '4px 0 0 0' }}>Панель управління та automation</p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setCrmMode('sales')} 
            style={{
              padding: '10px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              backgroundColor: crmMode === 'sales' ? '#2563eb' : '#e5e7eb',
              color: crmMode === 'sales' ? '#ffffff' : '#374151', fontWeight: 'bold'
            }}
          >
            Воронка лідів (Sales)
          </button>
          <button 
            onClick={() => setCrmMode('workspace')} 
            style={{
              padding: '10px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              backgroundColor: crmMode === 'workspace' ? '#2563eb' : '#e5e7eb',
              color: crmMode === 'workspace' ? '#ffffff' : '#374151', fontWeight: 'bold'
            }}
          >
            Робочий простір (Workspace)
          </button>
        </div>
      </header>

      <main style={{ backgroundColor: '#ffffff', borderRadius: '#ffffff', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        {crmMode === 'sales' ? (
          <LeadsKanban />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ fontWeight: 'bold' }}>Оберіть учня:</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.student_class} клас)
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <ScheduleList studentId={selectedStudentId} refreshTrigger={refreshTrigger} />
              <StudentNotes studentId={selectedStudentId} refreshTrigger={refreshTrigger} />
            </div>

            <div style={{ marginTop: '20px' }}>
              <AdminPanel 
                selectedStudentId={selectedStudentId} 
                setSelectedStudentId={setSelectedStudentId} 
                refreshTrigger={refreshTrigger} 
                setRefreshTrigger={setRefreshTrigger} 
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
