import { useState, useEffect } from 'react';
import type { Contact } from '../types';
import { updateClient, saveTask, saveDeal } from '../api';

interface ContactPanelProps {
  contact: Contact | null;
}

export default function ContactPanel({ contact }: ContactPanelProps) {
  const [localContact, setLocalContact] = useState<Contact | null>(contact);
  const [notes, setNotes] = useState(contact?.notes || '');
  const [isSavingNote, setIsSavingNote] = useState(false);

  useEffect(() => {
    setLocalContact(contact);
    setNotes(contact?.notes || '');
  }, [contact?.id]);

  if (!localContact) {
    return (
      <aside className="w-80 lg:w-96 flex flex-col bg-white overflow-y-auto items-center justify-center">
        <p className="text-gray-400 text-sm">Select a conversation to view contact details</p>
      </aside>
    );
  }

  return (
    <aside className="w-80 lg:w-96 flex flex-col bg-white overflow-y-auto">
      {/* Contact Profile */}
      <section className="p-6 border-b border-gray-100 text-center">
        <div className="relative inline-block mb-4">
          <img
            alt={localContact.name}
            className="w-24 h-24 rounded-2xl mx-auto shadow-md object-cover border-4 border-white"
            src={localContact.avatar}
          />
          <span className="absolute bottom-0 right-0 w-6 h-6 bg-brand-crm text-white rounded-full border-2 border-white flex items-center justify-center">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </span>
        </div>
        <h2 className="text-xl font-bold text-slate-800">{localContact.name}</h2>
        <p className="text-sm text-gray-500">{localContact.role} {localContact.company ? `at ${localContact.company}` : ''}</p>
        <div className="mt-4 flex justify-center space-x-2">
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full uppercase tracking-wider">
            {localContact.leadTag}
          </span>
        </div>
      </section>

      {/* Lead Status */}
      <section className="p-6 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Lead Status</h3>
        <div className="grid grid-cols-3 gap-2">
          {(['new', 'active', 'closed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => {
                setLocalContact({ ...localContact, leadStatus: status });
                updateClient(localContact.telefono || localContact.id, { lead_status: status }).catch(console.error);
              }}
              className={`px-2 py-2 text-[10px] font-bold rounded-lg uppercase cursor-pointer transition-colors ${
                localContact.leadStatus === status
                  ? 'bg-brand-crm text-white shadow-sm'
                  : 'border border-gray-200 text-gray-400 hover:bg-gray-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </section>

      {/* Active Deals */}
      <section className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Active Deals</h3>
          <button 
            onClick={async () => {
              const title = prompt('Deal Title:');
              if (!title) return;
              const value = prompt('Deal Value ($):', '0');
              const newDeal = {
                cliente_id: localContact.id,
                telefono: localContact.telefono || localContact.id,
                title,
                value: parseFloat(value || '0'),
                stage: 'Proposal'
              };
              try {
                const res = await saveDeal(newDeal);
                if (res.trato) {
                  setLocalContact((prev) => prev ? { ...prev, deals: [res.trato, ...prev.deals] } : prev);
                }
              } catch (e) {
                console.error(e);
              }
            }}
            className="text-brand-crm text-xs font-bold cursor-pointer hover:underline"
          >
            + New Deal
          </button>
        </div>
        {localContact.deals.length === 0 ? (
          <p className="text-sm text-gray-400">No active deals</p>
        ) : (
          localContact.deals.map((deal) => (
            <div key={deal.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-3 last:mb-0">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-sm font-bold text-slate-700">{deal.title}</h4>
                <span className="text-sm font-bold text-brand-crm">${Number(deal.value).toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                <div
                  className="bg-brand-crm h-1.5 rounded-full"
                  style={{ width: `${deal.progress}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-500">{deal.stage} • {deal.closingDate}</p>
            </div>
          ))
        )}
      </section>

      {/* Recent Tasks */}
      <section className="p-6 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Recent Tasks</h3>
        {localContact.tasks.length === 0 ? (
          <p className="text-sm text-gray-400">No tasks</p>
        ) : (
          <ul className="space-y-4">
            {localContact.tasks.map((task) => (
              <li key={task.id} className="flex items-start">
                <input
                  className="mt-1 rounded text-brand-crm focus:ring-brand-crm border-gray-300 cursor-pointer"
                  type="checkbox"
                  checked={task.completed}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    setLocalContact((prev) => {
                      if (!prev) return prev;
                      const newTasks = prev.tasks.map(t => t.id === task.id ? { ...t, completed: isChecked } : t);
                      return { ...prev, tasks: newTasks };
                    });
                    saveTask({ id: task.id, cliente_id: localContact.id, telefono: localContact.telefono || localContact.id, title: task.title, completed: isChecked }).catch(console.error);
                  }}
                />
                <div className="ml-3">
                  <p className={`text-sm font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-slate-700'}`}>{task.title}</p>
                  <p className={`text-xs ${task.overdue && !task.completed ? 'text-red-500' : 'text-gray-400'}`}>
                    {task.dueInfo}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Notes */}
      <section className="p-6">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Notes</h3>
        <textarea
          className="w-full border-gray-200 rounded-xl text-sm p-3 focus:ring-brand-crm focus:outline-none bg-gray-50 min-h-[120px] resize-none"
          placeholder="Click to add a note..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isSavingNote}
        />
        <button 
          onClick={async () => {
             setIsSavingNote(true);
             try {
               await updateClient(localContact.telefono || localContact.id, { notes });
               setLocalContact((prev) => prev ? { ...prev, notes } : prev);
             } catch (e) {
               console.error(e);
             } finally {
               setIsSavingNote(false);
             }
          }}
          disabled={isSavingNote}
          className={`mt-2 w-full font-bold py-2 rounded-lg text-xs transition-colors uppercase cursor-pointer ${
            isSavingNote ? 'bg-gray-200 text-gray-400' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {isSavingNote ? 'Saving...' : 'Save Note'}
        </button>
      </section>
    </aside>
  );
}
