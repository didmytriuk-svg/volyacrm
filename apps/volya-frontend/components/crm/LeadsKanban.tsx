"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface Lead {
  id: string;
  client_name: string;
  client_phone: string;
  student_class: number | null;
  subject: string | null;
  status: 'NEW' | 'CONTACTED' | 'TRIAL_SCHEDULED' | 'TRIAL_COMPLETED' | 'WON' | 'LOST';
  manager_notes: string | null;
  utm_source: string | null;
  created_at: string;
}

const COLUMNS: { id: Lead['status']; title: string; color: string }[] = [
  { id: 'NEW', title: 'Нові ліди', color: 'bg-zinc-100 text-zinc-800' },
  { id: 'CONTACTED', title: 'В роботі', color: 'bg-blue-50 text-blue-600' },
  { id: 'TRIAL_SCHEDULED', title: 'Пробний призначено', color: 'bg-purple-50 text-purple-600' },
  { id: 'TRIAL_COMPLETED', title: 'Пробний проведено', color: 'bg-amber-50 text-amber-600' },
  { id: 'WON', title: 'Успішно', color: 'bg-emerald-50 text-emerald-600' },
];

export default function LeadsKanban({ onLeadConverted }: { onLeadConverted: () => void }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Стейт для модального вікна конвертації в реального учня
  const [conversionLead, setConversionLead] = useState<Lead | null>(null);
  const [parentName, setParentName] = useState('');
  const [studentName, setStudentName] = useState('');

  useEffect(() => {
    async function loadLeads() {
      try {
        setLoading(true);
        const { data } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false });
        if (data) setLeads(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadLeads();
  }, []);

  const moveLead = async (leadId: string, newStatus: Lead['status']) => {
    setUpdatingId(leadId);
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', leadId);

      if (error) throw error;
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenConversion = (lead: Lead) => {
    setConversionLead(lead);
    setParentName(lead.client_name); // Зазвичай первинний контакт — це мама або тато
    setStudentName(''); // Ім'я дитини менеджер впише зі слів
  };

  const executeConversion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversionLead) return;

    setUpdatingId(conversionLead.id);
    try {
      // 1. Створюємо запис батька/платника
      const { data: parentData, error: pError } = await supabase
        .from('parents')
        .insert({
          name: parentName.trim(),
          phone: conversionLead.client_phone.trim()
        })
        .select('id')
        .single();

      if (pError) throw pError;

      // 2. Створюємо запис учня з прив'язкою до батька
      const { error: sError } = await supabase
        .from('students')
        .insert({
          name: studentName.trim() || `Учень (${parentName.trim()})`,
          student_class: conversionLead.student_class || 11,
          parent_id: parentData.id
        });

      if (sError) throw sError;

      // 3. Оновлюємо статус ліда на успішний в архіве
      await supabase
        .from('leads')
        .update({ status: 'WON', updated_at: new Date().toISOString() })
        .eq('id', conversionLead.id);

      setLeads(prev => prev.map(l => l.id === conversionLead.id ? { ...l, status: 'WON' } : l));
      setConversionLead(null);
      
      // Глобальне сповіщення системи про те, що база учнів оновилася
      onLeadConverted();
    } catch (err) {
      console.error("Помилка конвертації ліда:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="text-center py-12 text-sm font-bold text-slate-400 font-mono">Синхронізація воронки лідів...</div>;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 relative">
      <div>
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">01 Воронка лідів & маркетинг</h3>
        <p className="text-xs text-slate-400 mt-0.5">Контроль первинних заявок. Переміщуйте лідів по етапах угоди.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colLeads = leads.filter(l => l.status === col.id);
          return (
            <div key={col.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-3 min-h-[420px] flex flex-col space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg ${col.color}`}>
                  {col.title}
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">{colLeads.length}</span>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto max-h-[500px] pr-1">
                {colLeads.length === 0 ? (
                  <div className="text-[10px] text-slate-300 font-medium italic text-center py-12 border border-dashed border-slate-200 rounded-xl">Етап порожній</div>
                ) : (
                  colLeads.map((lead) => (
                    <div 
                      key={lead.id} 
                      className={`bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:border-slate-300 transition-all ${updatingId === lead.id ? 'opacity-40 animate-pulse' : ''}`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-tight truncate">{lead.client_name}</h4>
                        {lead.utm_source && (
                          <span className="text-[9px] bg-blue-50 border border-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wide">
                            {lead.utm_source}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono text-slate-500 mt-1">{lead.client_phone}</p>
                      
                      <div className="mt-3 flex justify-between items-center text-[10px] font-bold text-slate-400 border-t border-slate-100 pt-2">
                        <span>{lead.student_class ? `${lead.student_class} клас` : 'клас?'}</span>
                        <span className="font-mono text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {lead.subject === 'MATHEMATICS' ? 'МАТ' : lead.subject === 'PHYSICS' ? 'ФІЗ' : 'ХІМ'}
                        </span>
                      </div>

                      <div className="mt-3 flex justify-end gap-1.5">
                        {col.id === 'NEW' && (
                          <button onClick={() => moveLead(lead.id, 'CONTACTED')} className="w-full py-1 bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-bold rounded-lg transition-all">в роботу</button>
                        )}
                        {col.id === 'CONTACTED' && (
                          <button onClick={() => moveLead(lead.id, 'TRIAL_SCHEDULED')} className="w-full py-1 bg-purple-500 hover:bg-purple-600 text-white text-[10px] font-bold rounded-lg transition-all">на пробний</button>
                        )}
                        {col.id === 'TRIAL_SCHEDULED' && (
                          <button onClick={() => moveLead(lead.id, 'TRIAL_COMPLETED')} className="w-full py-1 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold rounded-lg transition-all">проведено</button>
                        )}
                        {col.id === 'TRIAL_COMPLETED' && (
                          <button onClick={() => handleOpenConversion(lead)} className="w-full py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded-lg transition-all">успішно</button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CONVERSION INTERACTIVE MODAL PANEL */}
      {conversionLead && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <form onSubmit={executeConversion} className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div>
              <span className="text-[10px] bg-emerald-50 text-emerald-600 font-extrabold uppercase px-2.5 py-1 rounded-lg">Активація учня</span>
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight mt-2">Конвертація ліда в базу школи</h4>
              <p className="text-xs text-slate-400 mt-0.5">Система автоматично створить картки батьків та дитини.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">ПІБ Платника / Батька</label>
                <input type="text" required value={parentName} onChange={e => setParentName(e.target.value)} className="w-full bg-slate-50 text-slate-800 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-bold" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Ім'я дитини (Учня)</label>
                <input type="text" required value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="Введіть ім'я учня" className="w-full bg-slate-50 text-slate-800 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Клас</label>
                  <div className="bg-slate-100 text-slate-700 px-3 py-2 text-xs font-mono font-bold rounded-xl">{conversionLead.student_class || '11'} клас</div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Телефон</label>
                  <div className="bg-slate-100 text-slate-700 px-3 py-2 text-xs font-mono font-bold rounded-xl truncate">{conversionLead.client_phone}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setConversionLead(null)} className="px-4 py-2 bg-slate-50 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-100 transition-all">Скасувати</button>
              <button type="submit" className="px-5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/10">Зарахувати до школи</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
