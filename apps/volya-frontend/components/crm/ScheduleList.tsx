"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface Lesson {
  id: string;
  subject: string;
  scheduled_at: string;
  attendance: 'PENDING' | 'ATTENDED' | 'ABSENT_WARNED' | 'ABSENT_UNWARNED';
}

export default function ScheduleList({ studentId, onLessonUpdated }: { studentId: string; onLessonUpdated: () => void }) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    async function loadSchedule() {
      try {
        setLoading(true);
        const { data } = await supabase.from('lessons_schedule').select('*').eq('student_id', studentId).order('scheduled_at', { ascending: false });
        if (data) setLessons(data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    if (studentId) loadSchedule();
  }, [studentId]);

  const handleAttendance = async (lessonId: string, status: Lesson['attendance'], subject: string) => {
    setActionId(lessonId);
    try {
      await supabase.from('lessons_schedule').update({ attendance: status }).eq('id', lessonId);
      if (status === 'ATTENDED' || status === 'ABSENT_UNWARNED') {
        const { data: pkg } = await supabase.from('lesson_packages').select('id, left_lessons').eq('student_id', studentId).eq('subject', subject).eq('status', 'ACTIVE').limit(1).maybeSingle();
        if (pkg) await supabase.from('lesson_packages').update({ left_lessons: Math.max(0, pkg.left_lessons - 1) }).eq('id', pkg.id);
      }
      setLessons(prev => prev.map(l => l.id === lessonId ? { ...l, attendance: status } : l));
      onLessonUpdated();
    } catch (e) { console.error(e); } finally { setActionId(null); }
  };

  if (loading) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
      <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">Поточний графік та історія занять</h3>
      {lessons.length === 0 ? (
        <p className="text-xs text-slate-400 font-medium italic">Розклад порожній. Перейдіть у вкладку призначення уроків.</p>
      ) : (
        <div className="divide-y divide-slate-100">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-800 uppercase">
                    {lesson.subject === 'MATHEMATICS' ? 'Математика' : 'Фізика'}
                  </span>
                  <span className="text-xs text-blue-600 font-bold font-mono">
                    {new Date(lesson.scheduled_at).toLocaleString('uk-UA', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 font-mono mt-1">ID уроку: {lesson.id}</p>
              </div>
              <div>
                {lesson.attendance !== 'PENDING' ? (
                  <span className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl font-mono">
                    {lesson.attendance === 'ATTENDED' ? 'проведено / списано' : lesson.attendance === 'ABSENT_WARNED' ? 'скасовано / збережено' : 'пропуск / списано'}
                  </span>
                ) : (
                  <div className="flex gap-2">
                    <button disabled={actionId === lesson.id} onClick={() => handleAttendance(lesson.id, 'ATTENDED', lesson.subject)} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm">Був</button>
                    <button disabled={actionId === lesson.id} onClick={() => handleAttendance(lesson.id, 'ABSENT_WARNED', lesson.subject)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-all">Попередив</button>
                    <button disabled={actionId === lesson.id} onClick={() => handleAttendance(lesson.id, 'ABSENT_UNWARNED', lesson.subject)} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition-all">Пропуск</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
