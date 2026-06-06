'use client';

import { useEffect, useState } from 'react';
import { fetchGameConfig, updateGameConfig, fetchEndgameOptions, createEndgameOption, deleteEndgameOption } from '@/services/gameConfig';
import { logAdminAction } from '@/services/admin';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import type { GameConfig, EndgameOption } from '@/services/gameConfig';

export default function AdminGameConfigTab() {
  const { user } = useAuth();
  const [config, setConfig] = useState<GameConfig | null>(null);
  const [options, setOptions] = useState<EndgameOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [masterCode, setMasterCode] = useState('');
  const [question, setQuestion] = useState('');
  const [newOption, setNewOption] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  async function load() {
    const [cfg, opts] = await Promise.all([fetchGameConfig(), fetchEndgameOptions()]);
    setConfig(cfg);
    setOptions(opts);
    setMaxAttempts(cfg.max_team_attempts);
    setMasterCode(cfg.endgame_master_code);
    setQuestion(cfg.endgame_question);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function saveConfig() {
    if (!user || !config) return;
    setIsBusy(true);
    try {
      const updated = await updateGameConfig({
        max_team_attempts: maxAttempts,
        endgame_master_code: masterCode,
        endgame_question: question
      });
      setConfig(updated);
      await logAdminAction({
        admin_id: user.id,
        action: 'config.update',
        target_type: 'system',
        target_id: 'game_config'
      });
    } catch (err) {
      console.error('Failed to save config:', err);
    } finally {
      setIsBusy(false);
    }
  }

  async function addOption() {
    if (!user || !newOption.trim()) return;
    setIsBusy(true);
    try {
      const opt = await createEndgameOption({
        label: newOption,
        is_correct: false,
        position: options.length + 1
      });
      setOptions([...options, opt]);
      setNewOption('');
      await logAdminAction({
        admin_id: user.id,
        action: 'endgame_option.create',
        target_type: 'system',
        target_id: opt.id
      });
    } catch (err) {
      console.error('Failed to add option:', err);
    } finally {
      setIsBusy(false);
    }
  }

  async function deleteOption(id: string) {
    if (!user) return;
    setIsBusy(true);
    try {
      await deleteEndgameOption(id);
      setOptions(options.filter((o) => o.id !== id));
      await logAdminAction({
        admin_id: user.id,
        action: 'endgame_option.delete',
        target_type: 'system',
        target_id: id
      });
    } catch (err) {
      console.error('Failed to delete option:', err);
    } finally {
      setIsBusy(false);
    }
  }

  async function toggleCorrect(id: string, current: boolean) {
    if (!user) return;
    setIsBusy(true);
    try {
      const updated = options.map((o) =>
        o.id === id ? { ...o, is_correct: !current } : { ...o, is_correct: false }
      );
      setOptions(updated);
      // Update all in sequence
      for (const opt of updated) {
        if (opt.is_correct || opt.is_correct !== options.find((o) => o.id === opt.id)?.is_correct) {
          await createEndgameOption({ label: opt.label, is_correct: opt.is_correct, position: opt.position });
        }
      }
      await logAdminAction({
        admin_id: user.id,
        action: 'endgame_option.toggle',
        target_type: 'system',
        target_id: id
      });
    } catch (err) {
      console.error('Failed to toggle option:', err);
    } finally {
      setIsBusy(false);
    }
  }

  if (loading) {
    return <Card className="p-6"><p className="text-slate-400">Loading…</p></Card>;
  }

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white">Game configuration</h3>
        <p className="mt-1 text-sm text-slate-400">Configure global game rules.</p>
      </div>

      <div className="space-y-4">
        <label className="block space-y-2 text-sm text-slate-200">
          <span className="code-text text-[0.7rem] uppercase tracking-[0.28em] text-cyan-200/80">Max team attempts</span>
          <input
            type="number"
            min="1"
            max="99"
            value={maxAttempts}
            onChange={(e) => setMaxAttempts(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full rounded-xl border border-white/8 bg-space-950/80 px-3 py-2 text-white code-text"
          />
        </label>

        <label className="block space-y-2 text-sm text-slate-200">
          <span className="code-text text-[0.7rem] uppercase tracking-[0.28em] text-violet-200/80">Endgame master code</span>
          <input
            type="text"
            value={masterCode}
            onChange={(e) => setMasterCode(e.target.value)}
            placeholder="e.g., E19-B04-72-11"
            className="w-full rounded-xl border border-white/8 bg-space-950/80 px-3 py-2 text-white code-text uppercase"
          />
          <p className="text-xs text-slate-400">Format: LETTER##-LETTER##-##-##</p>
        </label>

        <label className="block space-y-2 text-sm text-slate-200">
          <span className="code-text text-[0.7rem] uppercase tracking-[0.28em] text-rose-200/80">Endgame verification question</span>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Who is responsible?"
            className="w-full rounded-xl border border-white/8 bg-space-950/80 px-3 py-2 text-white"
          />
        </label>

        <Button onClick={saveConfig} disabled={isBusy} variant="primary">
          {isBusy ? 'Saving…' : 'Save configuration'}
        </Button>
      </div>

      <hr className="border-white/10" />

      <div>
        <h4 className="text-base font-semibold text-white">Endgame reveal options</h4>
        <p className="mt-1 text-sm text-slate-400">Configure answer choices for the final verification.</p>
      </div>

      <ul className="space-y-2">
        {options.length === 0 ? (
          <li className="rounded-xl border border-dashed border-cyan-400/20 bg-space-950/70 p-3 text-sm text-slate-400">
            No options yet. Add one below.
          </li>
        ) : (
          options.map((opt) => (
            <li key={opt.id} className="rounded-xl border border-white/8 bg-space-950/70 p-3 flex items-center justify-between">
              <div className="flex-1">
                <p className="text-white text-sm">{opt.label}</p>
                <p className="text-[0.7rem] text-slate-400 code-text uppercase">
                  {opt.is_correct ? '✓ CORRECT ANSWER' : 'Incorrect'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => toggleCorrect(opt.id, opt.is_correct)}
                  disabled={isBusy}
                  className={[
                    'rounded-lg px-3 py-1 text-[0.7rem] font-semibold uppercase transition',
                    opt.is_correct
                      ? 'bg-emerald-400/20 text-emerald-100 border border-emerald-400/30'
                      : 'bg-slate-600/30 text-slate-300 border border-slate-600/30 hover:bg-emerald-400/20'
                  ].join(' ')}
                >
                  {opt.is_correct ? 'Correct' : 'Set correct'}
                </button>
                <Button
                  size="sm"
                  variant="danger"
                  disabled={isBusy}
                  onClick={() => deleteOption(opt.id)}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))
        )}
      </ul>

      <div className="flex gap-2">
        <input
          type="text"
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addOption()}
          placeholder="New option label"
          className="flex-1 rounded-xl border border-white/8 bg-space-950/80 px-3 py-2 text-white text-sm"
        />
        <Button onClick={addOption} disabled={isBusy || !newOption.trim()} variant="secondary">
          Add
        </Button>
      </div>
    </Card>
  );
}
