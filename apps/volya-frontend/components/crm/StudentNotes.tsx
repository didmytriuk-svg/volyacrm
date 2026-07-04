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

export default function StudentNotes({ studentId }: { studentId: string }) {
  const [notes, setNotes] = useState<StudentNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [category, setCategory] = useState<StudentNote['category']>('GENERAL');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('student_notes')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });
      if (data) setNotes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) loadNotes();
  }, [studentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('student_notes')
        .insert({
          student_id: studentId,
          category,
          text: noteText.trim(),
          author_name: 'Менеджер'
        });

      if (error) throw error;
      setNoteText('');
      await loadNotes();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">02 Історія взаємодії & внутрішній лог</h3>
      </div>

      {/* QUICK NOTE INPUT FORM */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <input 
            type="text" 
            required 
            value={noteText} 
            onChange={e => setNoteText(e.target.value)} 
            placeholder="Введіть важливу нотатку про клієнта або дзвінок..." 
            className="w-full bg-slate-50 text-slate-800 px-4 py-2.5 text-xs border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 font-medium transition-all" 
          />
          <select 
            value={category} 
            onChange={e => setCategory(e.target.value as any)} 
            className="bg-slate-50 text-slate-700 px-3 py-2.5 text-xs rounded-xl font-bold focus:outline-none cursor-pointer border-none"
          >
            <option value="GENERAL">загальне</option>
            <option value="ACADEMIC">навчання</option>
            <option value="FINANCIAL">фінанси</option>
          </select>
        </div>
        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-bold uppercase rounded-xl transition-all disabled:opacity-40"
          >
            {isSubmitting ? 'Збереження...' : 'Додати нотатку'}
          </button>
        </div>
      </form>

      {/* TIMELINE NOTATION LOG */}
      <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
        {notes.length === 0 ? (
          <p className="text-xs text-slate-400 font-medium italic text-center py-4">Внутрішні записи про клієнта відсутні.</p>
        ) : (
          notes.map(note => (
            <div key={note.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="text-slate-700 uppercase tracking-tight">{note.author_name}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-mono ${
                    note.category === 'FINANCIAL' ? 'bg-red-50 text-red-600' :
                    note.category === 'ACADEMIC' ? 'bg-blue-50 text-blue-600' :
                    note.category === 'SYSTEM' ? 'bg-zinc-200 text-zinc-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {note.category.toLowerCase()}
                  </span>
                </div>
                <span className="font-mono">{new Date(note.created_at).toLocaleString('uk-UA', { dateStyle: 'short', timeStyle: 'short' })}</span>
              </div>
              <p className="text-xs font-medium text-slate-700 leading-relaxed">{note.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
