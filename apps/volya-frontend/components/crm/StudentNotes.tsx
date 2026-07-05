"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface StudentNote {
  id: string;
  author_name: string;
  category: 'GENERAL' | 'ACADEMIC' | 'FINANCIAL' | 'SYSTEM';
  text: string;
  created_at: string;
}

export default function StudentNotes({ studentId }: { studentId?: string }) {
  const [notes, setNotes] = useState<StudentNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [category, setCategory] = useState<StudentNote['category']>('GENERAL');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadNotes = async () => {
    try {
      setLoading(true);
      let query = supabase.from('student_notes').select('*');
      
      // Якщо передано конкретного учня — фільтруємо по ньому, інакше витягуємо загальні
      if (studentId) {
        query = query.eq('student_id', studentId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) setNotes(data);
    } catch (err) {
      console.error('Помилка завантаження нотаток:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [studentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('student_notes')
        .insert({
          student_id: studentId || null, // якщо глобальна нотатка, то зв'язку з ID учня немає
          category,
          text: noteText.trim(),
          author_name: 'Адміністратор'
        });

      if (error) throw error;
      setNoteText('');
      await loadNotes();
    } catch (err) {
      console.error('Помилка збереження нотатки:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Шапка внутрішнього блоку */}
      <div className="flex justify-between items-center pb-4 border-b border-[#E2E8F0]">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
            {studentId ? 'Лог взаємодії з учнем' : 'Глобальні нотатки та завдання школи'}
          </h3>
          <p className="text-[11px] text-[#64748B] mt-0.5">Створення внутрішніх записів, завдань та фіксація подій</p>
        </div>
      </div>

      {/* ФОРМА СТВОРЕННЯ — Чистий Soft SaaS стиль */}
      <form onSubmit={handleSubmit} className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]/60 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            required 
            value={noteText} 
            onChange={e => setNoteText(e.target.value)} 
            placeholder="Додати завдання, нагадування або нотатку по дзвінку..." 
            className="flex-1 bg-white text-[#0F172A] px-4 py-3 text-xs border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#2F80ED]/10 font-medium transition-all" 
          />
          <select 
            value={category} 
            onChange={e => setCategory(e.target.value as any)} 
            className="bg-white text-[#475569] px-4 py-3 text-xs rounded-xl font-semibold border border-[#E2E8F0] focus:outline-none focus:border-[#2F80ED] cursor-pointer"
          >
            <option value="GENERAL">Загальне</option>
            <option value="ACADEMIC">Навчання</option>
            <option value="FINANCIAL">Фінанси</option>
          </select>
        </div>
        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="px-5 py-2.5 bg-[#2F80ED] hover:bg-[#1B6AD1] text-white text-xs font-bold rounded-xl shadow-md shadow-[#2F80ED]/10 transition-all disabled:opacity-40"
          >
            {isSubmitting ? 'Збереження...' : 'Зберегти запис'}
          </button>
        </div>
      </form>

      {/* СПИСОК НОТАТОК (СТРІЧКА ЧАСУ) */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-[#94A3B8] gap-2">
            <span className="w-5 h-5 rounded-full border-2 border-[#2F80ED] border-t-transparent animate-spin block"></span>
            <p className="text-xs font-medium">Оновлення бази даних...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12 bg-[#F8FAFC]/40 rounded-2xl border border-dashed border-[#E2E8F0]">
            <p className="text-xs text-[#94A3B8] font-medium italic">Жодних записів чи завдань поки не створено.</p>
          </div>
        ) : (
          notes.map(note => (
            <div key={note.id} className="p-4 bg-white rounded-2xl border border-[#E2E8F0]/70 hover:border-[#E2E8F0] transition-all space-y-2 shadow-sm">
              <div className="flex justify-between items-center text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#475569]">{note.author_name}</span>
                  <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold tracking-wide uppercase ${
                    note.category === 'FINANCIAL' ? 'bg-[#FEE2E2] text-[#EF4444]' :
                    note.category === 'ACADEMIC' ? 'bg-[#E0F2FE] text-[#0369A1]' :
                    note.category === 'SYSTEM' ? 'bg-[#F1F5F9] text-[#475569]' : 'bg-[#F1F5F9] text-[#475569]'
                  }`}>
                    {note.category === 'GENERAL' ? 'Загальне' : note.category === 'ACADEMIC' ? 'Навчання' : 'Фінанси'}
                  </span>
                </div>
                <span className="font-medium text-[#94A3B8] text-[10px]">
                  {new Date(note.created_at).toLocaleString('uk-UA', { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>
              <p className="text-xs font-medium text-[#334155] leading-relaxed pr-4">{note.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
