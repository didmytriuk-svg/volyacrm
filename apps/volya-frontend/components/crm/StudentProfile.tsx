"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface LessonPackage {
  id: string;
  subject: 'MATHEMATICS' | 'PHYSICS' | 'CHEMISTRY';
  total_lessons: number;
  left_lessons: number;
  price_expected: number;
  price_paid: number;
}

interface Transaction {
  id: string;
  amount: number;
  type: string;
  comment: string | null;
  created_at: string;
}

interface StudentData {
  id: string;
  name: string;
  student_class: number;
  parents?: { name: string; phone: string; };
}

export default function StudentProfile({ studentId }: { studentId: string }) {
  const [student, setStudent] = useState<StudentData | null>(null);
  const [packages, setPackages] = useState<LessonPackage[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Стейт для внесення швидкої оплати
  const [payAmount, setPayAmount] = useState('');
  const [payComment, setPayComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      const { data: sData } = await supabase
        .from('students')
        .select('id, name, student_class, parents (name, phone)')
        .eq('id', studentId).single();
      setStudent(sData as any);

      const { data: pData } = await supabase
        .from('lesson_packages')
        .select('*')
        .eq('student_id', studentId)
        .eq('status', 'ACTIVE');
      setPackages(pData as any[] || []);

      const { data: tData } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });
      setTransactions(tData as any[] || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) loadFinancialData();
  }, [studentId]);

  const handleAddTransaction = async (e: React.FormEvent, pkgId: string, currentPaid: number) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) return;
    setIsSubmitting(true);

    try {
      const amountNum = Number(payAmount);
      
      // 1. Записуємо транзакцію в реєстр
      const { error: tErr } = await supabase
        .from('financial_transactions')
        .insert({
          package_id: pkgId,
          student_id: studentId,
          amount: amountNum,
          comment: payComment.trim() || 'Оплата абонемента'
        });

      if (tErr) throw tErr;

      // 2. Оновлюємо накопичувальний баланс оплати в абонементі
      await supabase
        .from('lesson_packages')
        .update({ price_paid: currentPaid + amountNum })
        .eq('id', pkgId);

      setPayAmount('');
      setPayComment('');
      await loadFinancialData(); // Реактивне перевантаження фінансового стану
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="bg-blue-600 rounded-3xl p-8 text-white/50 text-xs font-bold font-mono uppercase tracking-widest animate-pulse">Синхронізація каси...</div>;
  if (!student) return null;

  const activePkg = packages[0];
  // Обчислення боргу за абонементом
  const debt = activePkg ? activePkg.price_expected - activePkg.price_paid : 0;

  return (
    <div className="space-y-6">
      {/* 🔵 THE SOLID BLUE SaaS CARD (Reference to image_71cdd5.jpg Left Column) */}
      <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-600/10 flex flex-col justify-between min-h-[420px]">
        <div>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-black tracking-tight leading-tight uppercase">{student.name}</h2>
              <span className="inline-block mt-2 px-3 py-0.5 bg-white/20 border border-white/10 text-white text-[11px] font-bold rounded-lg font-mono">
                {student.student_class} клас
              </span>
            </div>
            {debt > 0 ? (
              <span className="text-[10px] bg-red-500 text-white font-black px-2.5 py-1 rounded-xl uppercase tracking-wider animate-pulse">Борг {debt} грн</span>
            ) : (
              <span className="text-[10px] bg-emerald-500 text-white font-black px-2.5 py-1 rounded-xl uppercase tracking-wider">Оплачено</span>
            )}
          </div>

          {/* MAIN COUNT METRIC */}
          <div className="my-8 border-t border-white/10 pt-6">
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-60 block">Залишок занять ({activePkg ? (activePkg.subject === 'MATHEMATICS' ? 'Математика' : 'Фізика') : 'Немає абонемента'})</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-6xl font-black tracking-tighter font-mono">
                {activePkg ? activePkg.left_lessons : '0'}
              </span>
              <span className="text-xl font-medium opacity-40 font-mono">
                / {activePkg ? activePkg.total_lessons : '0'} уроків
              </span>
            </div>
          </div>
        </div>

        {/* FINANCIAL SUMMARY COUNTERS INSIDE CARD */}
        <div className="grid grid-cols-2 gap-2 border-t border-white/10 pt-4 text-xs font-mono">
          <div>
            <span className="opacity-50 text-[9px] uppercase font-bold block">Сплачено</span>
            <span className="font-bold text-lg">{activePkg ? activePkg.price_paid : 0} грн</span>
          </div>
          <div className="text-right">
            <span className="opacity-50 text-[9px] uppercase font-bold block">Вартість договору</span>
            <span className="font-bold text-lg">{activePkg ? activePkg.price_expected : 0} грн</span>
          </div>
        </div>
      </div>

      {/* 💵 QUICK TRANSACTION INPUT TOOL (Reference to image_71cdd5.jpg widgets style) */}
      {activePkg && debt > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
          <span className="text-[10px] font-black uppercase tracking-wider text-red-500 block">Внесення оплати за борг</span>
          <form onSubmit={(e) => handleAddTransaction(e, activePkg.id, activePkg.price_paid)} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input type="number" max={debt} required value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder={`Сума, макс. ${debt}`} className="w-full bg-slate-50 text-slate-800 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-bold font-mono" />
              <input type="text" value={payComment} onChange={e => setPayComment(e.target.value)} placeholder="Коментар (напр. Приват24)" className="w-full bg-slate-50 text-slate-800 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium" />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold uppercase rounded-xl transition-all">
              {isSubmitting ? 'Проведення платежу...' : 'Зарахувати гроші'}
            </button>
          </form>
        </div>
      )}

      {/* 📜 HISTORICAL FINANCIAL LEDGER */}
      {transactions.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-3">Історія фінансових надходжень</span>
          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
            {transactions.map(t => (
              <div key={t.id} className="flex justify-between items-center text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-100 font-mono">
                <div>
                  <span className="font-bold text-slate-800">+{t.amount} грн</span>
                  <p className="text-[9px] text-slate-400 mt-0.5 font-sans">{t.comment}</p>
                </div>
                <span className="text-[10px] text-slate-400">
                  {new Date(t.created_at).toLocaleDateString('uk-UA')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
