"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface Student {
  id: string;
  name: string;
  phone: string;
  grade: string;
  subject: string;
  created_at: string;
}

export default function StudentProfile() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Поля форми для створення нового учня
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [grade, setGrade] = useState('11 клас');
  const [subject, setSubject] = useState('Математика');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Завантаження списку учнів
  const loadStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students') // Переконайся, що таблиця в Supabase називається 'students'
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setStudents(data);
    } catch (err) {
      console.error('Помилка завантаження учнів:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // Хендлер відправки форми
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('students')
        .insert({
          name: name.trim(),
          phone: phone.trim(),
          grade,
          subject,
        });

      if (error) throw error;

      // Очищення полів після успішного додавання
      setName('');
      setPhone('');
      
      // Перезавантажуємо список
      await loadStudents();
    } catch (err) {
      console.error('Помилка при додаванні учня:', err);
      alert('Не вдалося додати учня. Перевірте назву таблиці в базі даних.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Шапка */}
      <div className="flex justify-between items-center pb-4 border-b border-[#E2E8F0]">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Керування базою учнів</h3>
          <p className="text-[11px] text-[#64748B] mt-0.5">Додавання нових студентів та перегляд карток успішності</p>
        </div>
      </div>

      {/* Форма додавання нового учня (Soft SaaS Style) */}
      <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-[#E2E8F0]/60">
        <h4 className="text-xs font-bold uppercase text-[#0F172A] mb-4">Швидка реєстрація учня</h4>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-[10px] font-bold uppercase text-[#94A3B8] mb-1.5">ПІБ Учня</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Дмитро Коваленко" 
              className="w-full bg-white text-[#0F172A] px-4 py-2.5 text-xs border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2F80ED] font-medium transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-[#94A3B8] mb-1.5">Телефон</label>
            <input 
              type="tel" 
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+380951112233" 
              className="w-full bg-white text-[#0F172A] px-4 py-2.5 text-xs border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2F80ED] font-medium transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-[#94A3B8] mb-1.5">Клас</label>
            <select 
              value={grade}
              onChange={e => setGrade(e.target.value)}
              className="w-full bg-white text-[#475569] px-4 py-2.5 text-xs rounded-xl font-semibold border border-[#E2E8F0] focus:outline-none focus:border-[#2F80ED] cursor-pointer"
            >
              <option value="9 клас">9 клас</option>
              <option value="10 клас">10 клас</option>
              <option value="11 клас">11 клас</option>
              <option value="НМТ/ЗНО">Курс НМТ</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-[#94A3B8] mb-1.5">Предмет</label>
            <select 
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full bg-white text-[#475569] px-4 py-2.5 text-xs rounded-xl font-semibold border border-[#E2E8F0] focus:outline-none focus:border-[#2F80ED] cursor-pointer"
            >
              <option value="Математика">Математика (МАТ)</option>
              <option value="Фізика">Фізика (ФІЗ)</option>
              <option value="Астрономія">Астрономія (АСТ)</option>
            </select>
          </div>

          <div>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-[#2F80ED] hover:bg-[#1B6AD1] text-white text-xs font-bold rounded-xl shadow-md shadow-[#2F80ED]/10 transition-all disabled:opacity-40"
            >
              {isSubmitting ? 'Збереження...' : 'Додати'}
            </button>
          </div>
        </form>
      </div>

      {/* Список доданих учнів */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase text-[#94A3B8] px-1">Зареєстровані студенти ({students.length})</h4>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 text-[#94A3B8] gap-2">
            <span className="w-5 h-5 rounded-full border-2 border-[#2F80ED] border-t-transparent animate-spin block"></span>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-8 bg-[#F8FAFC]/40 rounded-2xl border border-dashed border-[#E2E8F0]">
            <p className="text-xs text-[#94A3B8] font-medium italic">База учнів поки порожня.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {students.map(student => (
              <div key={student.id} className="p-4 bg-white rounded-2xl border border-[#E2E8F0]/70 hover:border-[#E2E8F0] transition-all flex justify-between items-center shadow-sm">
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-[#0F172A]">{student.name}</h5>
                  <p className="text-[11px] font-medium text-[#64748B]">{student.phone}</p>
                </div>
                <div className="flex gap-1.5">
                  <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-[#F1F5F9] text-[#475569]">
                    {student.grade}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-[#E2EFFFF] text-[#2F80ED]">
                    {student.subject === 'Математика' ? 'МАТ' : student.subject === 'Фізика' ? 'ФІЗ' : 'АСТ'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
