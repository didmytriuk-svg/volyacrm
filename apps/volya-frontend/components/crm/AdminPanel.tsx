"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface AdminPanelProps {
  mode: 'contract' | 'lesson' | 'teacher';
  studentId: string;
  onDataAdded: () => void;
}

export default function AdminPanel({ mode, studentId, onDataAdded }: AdminPanelProps) {
  // Форма договору
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('11');
  const [subject, setSubject] = useState('MATHEMATICS');
  const [totalLessons, setTotalLessons] = useState('8');
  const [pricePaid, setPricePaid] = useState('3200');

  // Форма розкладу уроків
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [lessonSubject, setLessonSubject] = useState('MATHEMATICS');
  const [lessonTime, setLessonTime] = useState('');

  // Форма створення нового викладача
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherSubject, setNewTeacherSubject] = useState('MATHEMATICS');

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ message: string; isError: boolean } | null>(null);

  // Функція завантаження викладачів із бази
  const loadTeachersList = async () => {
    const { data } = await supabase.from('teachers').select('id, name');
    if (data && data.length > 0) {
      setTeachers(data);
      setSelectedTeacherId(data[0].id);
    } else {
      setTeachers([]);
      setSelectedTeacherId('');
    }
  };

  useEffect(() => {
    if (mode === 'lesson') {
      loadTeachersList();
    }
  }, [mode]);

  const handleContract = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      if (!parentPhone.trim().startsWith('+')) throw new Error("Формат телефону має бути: +380...");
      const { data: pData, error: pErr } = await supabase.from('parents').insert([{ name: parentName, phone: parentPhone.trim() }]).select().single();
      if (pErr) throw pErr;

      const { data: sData, error: sErr } = await supabase.from('students').insert([{ name: studentName, student_class: Number(studentClass), parent_id: pData.id }]).select().single();
      if (sErr) throw sErr;

      await supabase.from('lesson_packages').insert([{ student_id: sData.id, subject, total_lessons: Number(totalLessons), left_lessons: Number(totalLessons), price_expected: Number(pricePaid), price_paid: Number(pricePaid), status: 'ACTIVE' }]);
      setStatus({ message: 'Договір успішно активовано у хмарі', isError: false });
      setParentName(''); setParentPhone(''); setStudentName('');
      onDataAdded();
    } catch (err: any) { setStatus({ message: err.message, isError: true }); } finally { setLoading(false); }
  };

  const handleLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherId) return;
    setLoading(true);
    setStatus(null);
    try {
      await supabase.from('lessons_schedule').insert([{ student_id: studentId, teacher_id: selectedTeacherId, subject: lessonSubject, scheduled_at: new Date(lessonTime).toISOString(), attendance: 'PENDING' }]);
      setStatus({ message: 'Заняття успішно додано в розклад', isError: false });
      setLessonTime('');
      onDataAdded();
    } catch (err: any) { setStatus({ message: err.message, isError: true }); } finally { setLoading(false); }
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherName.trim()) return;
    setLoading(true);
    setStatus(null);
    try {
      const { error } = await supabase
        .from('teachers')
        .insert([{ 
          name: newTeacherName.trim(), 
          subject: newTeacherSubject 
        }]);

      if (error) throw error;

      setStatus({ message: `Викладача ${newTeacherName} успішно додано в базу`, isError: false });
      setNewTeacherName('');
      onDataAdded();
    } catch (err: any) { 
      setStatus({ message: err.message, isError: true }); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
      <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 mb-4">
        {mode === 'contract' && 'Оформлення договору'}
        {mode === 'lesson' && 'Планування нового уроку'}
        {mode === 'teacher' && 'Реєстрація нового викладача'}
      </h2>

      {status && (
        <div className={`p-4 rounded-xl text-xs font-bold mb-4 border ${status.isError ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
          {status.message}
        </div>
      )}

      {/* MODE 1: CONTRACT FORM */}
      {mode === 'contract' && (
        <form onSubmit={handleContract} className="space-y-4">
          <input type="text" required value={parentName} onChange={e => setParentName(e.target.value)} placeholder="ПІБ Матері / Батька" className="w-full bg-slate-50 text-slate-800 px-4 py-3 text-sm rounded-xl focus:outline-none focus:bg-white border border-transparent focus:border-blue-500 font-medium transition-all" />
          <input type="text" required value={parentPhone} onChange={e => setParentPhone(e.target.value)} placeholder="Номер телефону (+380...)" className="w-full bg-slate-50 text-slate-800 font-mono px-4 py-3 text-sm rounded-xl focus:outline-none focus:bg-white border border-transparent focus:border-blue-500 transition-all" />
          <input type="text" required value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="Ім'я та Прізвище дитини" className="w-full bg-slate-50 text-slate-800 px-4 py-3 text-sm rounded-xl focus:outline-none focus:bg-white border border-transparent focus:border-blue-500 font-medium transition-all" />
          <div className="grid grid-cols-2 gap-2">
            <select value={studentClass} onChange={e => setStudentClass(e.target.value)} className="bg-slate-50 text-slate-700 px-3 py-3 text-sm rounded-xl font-bold focus:outline-none cursor-pointer">
              {[7,8,9,10,11].map(c => <option key={c} value={c}>{c} клас</option>)}
            </select>
            <select value={subject} onChange={e => setSubject(e.target.value)} className="bg-slate-50 text-slate-700 px-3 py-3 text-sm rounded-xl font-bold focus:outline-none cursor-pointer">
              <option value="MATHEMATICS">Математика</option>
              <option value="PHYSICS">Фізика</option>
              <option value="CHEMISTRY">Хімія</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input type="number" required value={totalLessons} onChange={e => setTotalLessons(e.target.value)} placeholder="Уроків" className="w-full bg-slate-50 text-slate-800 px-4 py-2.5 text-sm rounded-xl focus:outline-none font-bold" />
            <input type="number" required value={pricePaid} onChange={e => setPricePaid(e.target.value)} placeholder="Сума" className="w-full bg-slate-50 text-slate-800 px-4 py-2.5 text-sm rounded-xl focus:outline-none font-mono font-bold text-blue-600" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-500/10">
            {loading ? 'Збереження...' : 'Активувати договір'}
          </button>
        </form>
      )}

      {/* MODE 2: LESSON FORM */}
      {mode === 'lesson' && (
        <form onSubmit={handleLesson} className="space-y-4">
          <div>
            <select 
              value={selectedTeacherId} 
              onChange={e => setSelectedTeacherId(e.target.value)} 
              disabled={teachers.length === 0}
              className="w-full bg-slate-50 text-slate-700 px-3 py-3 text-sm rounded-xl font-bold focus:outline-none cursor-pointer disabled:opacity-60"
            >
              {teachers.length === 0 ? (
                <option value="">Спочатку додайте викладача у вкладці поруч</option>
              ) : (
                teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)
              )}
            </select>
          </div>
          
          <select value={lessonSubject} onChange={e => setLessonSubject(e.target.value)} className="w-full bg-slate-50 text-slate-700 px-3 py-3 text-sm rounded-xl font-bold focus:outline-none cursor-pointer">
            <option value="MATHEMATICS">Математика</option>
            <option value="PHYSICS">Фізика</option>
            <option value="CHEMISTRY">Хімія</option>
          </select>
          
          <input type="datetime-local" required value={lessonTime} onChange={e => setLessonTime(e.target.value)} className="w-full bg-slate-50 text-slate-800 px-4 py-3 text-sm rounded-xl focus:outline-none font-mono font-bold" />
          
          <button 
            type="submit" 
            disabled={loading || teachers.length === 0 || !studentId} 
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
          >
            {loading ? 'Запис...' : 'Внести у розклад'}
          </button>
        </form>
      )}

      {/* MODE 3: NEW TEACHER FORM */}
      {mode === 'teacher' && (
        <form onSubmit={handleCreateTeacher} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Повне ім'я викладача</label>
            <input 
              type="text" 
              required 
              value={newTeacherName} 
              onChange={e => setNewTeacherName(e.target.value)} 
              placeholder="напр. Олександр Фізик" 
              className="w-full bg-slate-50 text-slate-800 px-4 py-3 text-sm border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 font-medium transition-all" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Основна спеціалізація (предмет)</label>
            <select 
              value={newTeacherSubject} 
              onChange={e => setNewTeacherSubject(e.target.value)} 
              className="w-full bg-slate-50 text-slate-700 px-3 py-3 text-sm rounded-xl font-bold focus:outline-none cursor-pointer"
            >
              <option value="MATHEMATICS">Математика</option>
              <option value="PHYSICS">Фізика</option>
              <option value="CHEMISTRY">Хімія</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading || !newTeacherName.trim()} 
            className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all active:scale-[0.99] disabled:opacity-40"
          >
            {loading ? 'Збереження у хмару...' : 'Зберегти викладача'}
          </button>
        </form>
      )}
    </div>
  );
}
