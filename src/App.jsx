import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Clock3,
  Trophy,
  RotateCcw,
  Save,
  CalendarDays,
} from 'lucide-react';

export default function BiotechFocusChecklist() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('bio-dynamic-tasks');

    if (saved) {
      const parsed = JSON.parse(saved);

      const hasBiologySection = parsed.some(
        (group) => group.section === 'Biology Deep Work'
      );

      if (!hasBiologySection) {
        return [{
        section: 'Biology Deep Work',
        items: [
          { text: '90 min focused biology study', points: 10 },
          { text: 'Revise molecular biology concepts', points: 5 },
          { text: 'Understand one mechanism deeply', points: 5 },
          { text: 'Write biology notes', points: 5 },
        ],
      }, ...parsed];
      }

      return parsed;
    }

    return [
      {
        section: 'Biology Deep Work',
        items: [
          { text: '90 min focused biology study', points: 10 },
          { text: 'Revise molecular biology concepts', points: 5 },
          { text: 'Understand one mechanism deeply', points: 5 },
          { text: 'Write biology notes', points: 5 },
        ],
      },
      {
        section: 'Python / Biopython',
        items: [
          { text: 'Watch Biopython lecture', points: 10 },
          { text: 'Practice coding manually', points: 5 },
          { text: 'Run one script successfully', points: 5 },
          { text: 'Learn one new Python concept', points: 5 },
        ],
      },
      {
        section: 'Research Training',
        items: [
          { text: 'Read one scientific article', points: 5 },
          { text: 'Learn one bioinformatics term', points: 5 },
          { text: 'Write one scientific question', points: 5 },
          { text: 'Save useful research material', points: 5 },
        ],
      },
      {
        section: 'Reading Habit',
        items: [
          { text: 'Read 10 pages of a book', points: 5 },
          { text: 'Highlight one important idea', points: 2 },
          { text: 'Write one takeaway', points: 2 },
          { text: 'Reflect on one insight', points: 1 },
        ],
      },
      {
        section: 'Mental Discipline',
        items: [
          { text: 'No doomscrolling', points: 5 },
          { text: 'No multitasking', points: 3 },
          { text: 'Stayed consistent', points: 4 },
          { text: 'Finished planned sessions', points: 3 },
        ],
      },
    ];
  });

  const [newTask, setNewTask] = useState('');
  const [newPoints, setNewPoints] = useState(5);
  const [selectedSection, setSelectedSection] = useState(
    'Biology Deep Work'
  );
  const [customSection, setCustomSection] = useState('');

  const [checked, setChecked] = useState(() => {
    const saved = localStorage.getItem('bio-checked');
    return saved ? JSON.parse(saved) : {};
  });

  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [failureText, setFailureText] = useState('');

  const [savedReflections, setSavedReflections] = useState(() => {
    const saved = localStorage.getItem('bio-reflections');
    return saved ? JSON.parse(saved) : {};
  });

  const [failureAnalysis, setFailureAnalysis] = useState(() => {
    const saved = localStorage.getItem('bio-failure-analysis');
    return saved ? JSON.parse(saved) : {};
  });

  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem('bio-streak');
    return saved ? Number(saved) : 0;
  });

  const [timeLeft, setTimeLeft] = useState('00:00:00');

  const [deletedTasks, setDeletedTasks] = useState(() => {
    const saved = localStorage.getItem('bio-deleted-tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [collapsedSections, setCollapsedSections] = useState({});

  const [showDeletedBin, setShowDeletedBin] = useState(true);

  const [showFailureOverlay, setShowFailureOverlay] = useState(false);

  const [failureForm, setFailureForm] = useState({
    reason: '',
    distraction: '',
    fix: '',
    emotion: '',
  });

  const allTasks = useMemo(() => {
    return tasks.flatMap((group) => group.items);
  }, [tasks]);

  const progress = useMemo(() => {
    return allTasks.reduce((sum, task) => {
      return checked[task.text] ? sum + task.points : sum;
    }, 0);
  }, [allTasks, checked]);

  const completedTasks = useMemo(() => {
    return Object.values(checked).filter(Boolean).length;
  }, [checked]);

  const maxScore = useMemo(() => {
    return allTasks.reduce((sum, task) => {
      return sum + task.points;
    }, 0);
  }, [allTasks]);

  const percentage = useMemo(() => {
    if (maxScore === 0) return 0;

    return Math.min(100, Math.round((progress / maxScore) * 100));
  }, [progress, maxScore]);

  useEffect(() => {
    localStorage.setItem('bio-checked', JSON.stringify(checked));
  }, [checked]);

  useEffect(() => {
    localStorage.setItem('bio-dynamic-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(
      'bio-deleted-tasks',
      JSON.stringify(deletedTasks)
    );
  }, [deletedTasks]);

  useEffect(() => {
    const pendingFailure = localStorage.getItem('bio-pending-failure');

    if (pendingFailure === 'true') {
      setShowFailureOverlay(true);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const tomorrow = new Date();

      tomorrow.setHours(24, 0, 0, 0);

      const diff = tomorrow.getTime() - now.getTime();

      const hours = String(
        Math.floor(diff / (1000 * 60 * 60))
      ).padStart(2, '0');

      const minutes = String(
        Math.floor((diff / (1000 * 60)) % 60)
      ).padStart(2, '0');

      const seconds = String(
        Math.floor((diff / 1000) % 60)
      ).padStart(2, '0');

      setTimeLeft(`${hours}:${minutes}:${seconds}`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const addTask = () => {
    if (!newTask.trim()) return;

    const finalSection =
      selectedSection === 'Custom'
        ? customSection.trim()
        : selectedSection;

    if (!finalSection) return;

    const existingSectionIndex = tasks.findIndex(
      (group) => group.section === finalSection
    );

    let updated = [...tasks];

    if (existingSectionIndex !== -1) {
      updated[existingSectionIndex] = {
        ...updated[existingSectionIndex],
        items: [
          ...updated[existingSectionIndex].items,
          {
            text: newTask,
            points: Number(newPoints),
          },
        ],
      };
    } else {
      updated.push({
        section: finalSection,
        items: [
          {
            text: newTask,
            points: Number(newPoints),
          },
        ],
      });
    }

    setTasks(updated);
    setNewTask('');
    setNewPoints(5);
    setCustomSection('');
  };

  const toggleTask = (taskText) => {
    if (checked[taskText]) return;

    setChecked((prev) => ({
      ...prev,
      [taskText]: true,
    }));
  };

  const resetTasks = () => {
    if (percentage < 25) {
      localStorage.setItem('bio-pending-failure', 'true');
      setShowFailureOverlay(true);
    }

    localStorage.removeItem('bio-checked');
    setChecked({});
  };

  const saveFailureOverlay = () => {
    const today = new Date().toISOString().split('T')[0];

    const updated = {
      ...failureAnalysis,
      [today]: {
        score: progress,
        analysis: failureForm,
      },
    };

    setFailureAnalysis(updated);

    localStorage.setItem(
      'bio-failure-analysis',
      JSON.stringify(updated)
    );

    localStorage.removeItem('bio-pending-failure');

    setShowFailureOverlay(false);

    setFailureForm({
      reason: '',
      distraction: '',
      fix: '',
      emotion: '',
    });
  };

  const toggleSectionCollapse = (sectionName) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  const deleteTask = (taskText) => {
    const deletedItem = tasks
      .flatMap((group) =>
        group.items.map((item) => ({
          ...item,
          section: group.section,
        }))
      )
      .find((item) => item.text === taskText);

    if (deletedItem) {
      setDeletedTasks((prev) => [
        {
          ...deletedItem,
          id: Date.now(),
        },
        ...prev,
      ]);
    }

    const updated = tasks
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => item.text !== taskText),
      }))
      .filter((group) => group.items.length > 0);

    setTasks(updated);
  };

  const restoreDeletedTask = (task) => {
    const existingSectionIndex = tasks.findIndex(
      (group) => group.section === task.section
    );

    let updated = [...tasks];

    if (existingSectionIndex !== -1) {
      updated[existingSectionIndex] = {
        ...updated[existingSectionIndex],
        items: [
          ...updated[existingSectionIndex].items,
          {
            text: task.text,
            points: task.points,
          },
        ],
      };
    } else {
      updated.push({
        section: task.section,
        items: [
          {
            text: task.text,
            points: task.points,
          },
        ],
      });
    }

    setTasks(updated);

    setDeletedTasks((prev) =>
      prev.filter((item) => item.id !== task.id)
    );
  };

  const saveReflection = () => {
    const today = new Date().toISOString().split('T')[0];

    const updated = {
      ...savedReflections,
      [today]: {
        note: notes,
        score: progress,
      },
    };

    setSavedReflections(updated);
    localStorage.setItem('bio-reflections', JSON.stringify(updated));

    if (percentage >= 25) {
      const lastDate = localStorage.getItem('bio-last-success-date');
      const todayDate = new Date().toDateString();

      if (lastDate !== todayDate) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        localStorage.setItem('bio-streak', String(newStreak));
        localStorage.setItem('bio-last-success-date', todayDate);
      }
    } else {
      setStreak(0);
      localStorage.setItem('bio-streak', '0');
    }
  };

  return (
    <div
      className="min-h-screen bg-[#050816] text-white overflow-x-hidden relative p-6"
      style={{
        backgroundImage: `radial-gradient(circle at top, rgba(34,197,94,0.12), transparent 25%), radial-gradient(circle at bottom right, rgba(168,85,247,0.12), transparent 25%)`,
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-[2rem] shadow-2xl p-8 border border-gray-200 text-black">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Clock3 className="w-8 h-8" />

              <div className="bg-black text-green-400 px-6 py-4 rounded-2xl font-mono text-4xl tracking-widest shadow-2xl">
                {timeLeft}
              </div>
            </div>

            <h1 className="text-5xl font-bold mb-4">
              🧬 Bioinformatics Foundation System
            </h1>

            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Build capability daily through biology, computation, and deep work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-gradient-to-br from-black to-gray-900 rounded-[2rem] p-6 border border-green-400/20 shadow-[0_0_40px_rgba(0,255,120,0.08)] text-white"
            >
              <p className="text-gray-400 text-sm uppercase tracking-[0.2em] mb-4">
                Performance Gauge
              </p>

              <div className="flex items-end gap-2 mb-5">
                <p className="text-6xl font-black text-green-400 leading-none">
                  {percentage}
                </p>

                <span className="text-2xl text-gray-400 mb-1">%</span>
              </div>

              <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-300 transition-all duration-700"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-[2rem] p-6 border border-gray-200 shadow-lg"
            >
              <p className="text-gray-500 text-sm uppercase tracking-[0.2em] mb-5">
                Tasks Completed
              </p>

              <div className="flex items-center justify-between">
                <p className="text-5xl font-black tracking-tight">
                  {completedTasks}
                </p>

                <div className="text-right">
                  <p className="text-gray-400 text-sm">out of</p>
                  <p className="text-2xl font-bold text-gray-700">
                    {allTasks.length}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="bg-gradient-to-br from-orange-50 to-red-50 rounded-[2rem] p-6 border border-orange-200 shadow-lg"
            >
              <p className="text-gray-500 text-sm uppercase tracking-[0.2em] mb-5">
                Consistency Streak
              </p>

              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  className="text-5xl"
                >
                  🔥
                </motion.div>

                <div>
                  <p className="text-5xl font-black leading-none">
                    {streak}
                  </p>

                  <p className="text-gray-500 mt-1 text-sm">
                    days active
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-[2rem] p-6 border border-violet-200 shadow-lg"
            >
              <p className="text-gray-500 text-sm uppercase tracking-[0.2em] mb-5">
                Cognitive State
              </p>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center shadow-xl">
                  <Trophy className="w-7 h-7 text-yellow-400" />
                </div>

                <div>
                  <p className="text-2xl font-black leading-tight">
                    {percentage >= 90
                      ? 'Deep Work'
                      : percentage >= 75
                      ? 'High Output'
                      : percentage >= 50
                      ? 'Productive'
                      : percentage >= 25
                      ? 'Consistent'
                      : 'Inactive'}
                  </p>

                  <p className="text-gray-500 text-sm mt-1">
                    current mental rhythm
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="mb-10 bg-black rounded-[2rem] p-6 border border-gray-800 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-black text-white">
                ➕ Custom Task Builder
              </h2>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4">
              <input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Task name"
                className="bg-gray-900 text-white border border-gray-700 rounded-2xl p-4"
              />

              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="bg-gray-900 text-white border border-gray-700 rounded-2xl p-4"
              >
                <option>Biology Deep Work</option>
                <option>Python / Biopython</option>
                <option>Research Training</option>
                <option>Reading Habit</option>
                <option>Mental Discipline</option>
                <option>Custom</option>
              </select>

              {selectedSection === 'Custom' && (
                <input
                  value={customSection}
                  onChange={(e) => setCustomSection(e.target.value)}
                  placeholder="Custom section name"
                  className="bg-gray-900 text-white border border-gray-700 rounded-2xl p-4"
                />
              )}

              <input
                type="number"
                value={newPoints}
                onChange={(e) => setNewPoints(Number(e.target.value))}
                placeholder="Points"
                className="bg-gray-900 text-white border border-gray-700 rounded-2xl p-4"
              />

              <button
                onClick={addTask}
                className="rounded-2xl bg-green-400 hover:bg-green-300 text-black font-black transition-all p-4"
              >
                Add Task
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {tasks.map((group, idx) => {
              return (
                <div
                  key={idx}
                  className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/90 backdrop-blur-2xl p-6 shadow-[0_0_40px_rgba(0,255,120,0.08)]"
                >
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-2xl font-bold text-white">
                      {group.section}
                    </h2>

                    <button
                      onClick={() => toggleSectionCollapse(group.section)}
                      className="px-5 py-2 rounded-xl bg-white text-black font-bold hover:scale-105 transition"
                    >
                      {collapsedSections[group.section]
                        ? '⬇ Show'
                        : '⬆ Hide'}
                    </button>
                  </div>

                  {!collapsedSections[group.section] && (
                  <div className="space-y-3">
                    {[...group.items]
                      .sort((a, b) => b.points - a.points)
                      .map((task, i) => {
                        return (
                          <motion.div
                            whileHover={{ y: -2 }}
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`relative overflow-hidden flex items-center gap-4 rounded-[1.7rem] p-5 border transition-all duration-500 text-white group ${checked[task.text] ? 'bg-gradient-to-r from-green-500/20 via-emerald-400/10 to-black border-green-400/40 shadow-[0_0_40px_rgba(0,255,120,0.18)]' : 'bg-black/40 border-white/10 hover:border-green-400/20'}`}
                          >
                            <button
                              onClick={() => toggleTask(task.text)}
                              className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${checked[task.text] ? 'bg-green-400 border-green-300 shadow-[0_0_30px_rgba(0,255,120,0.8)]' : 'bg-black border-gray-600 hover:border-green-400'}`}
                            >
                              {checked[task.text] && (
                                <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="text-black text-xl font-black"
                                >
                                  ✓
                                </motion.span>
                              )}
                            </button>

                            <div className="flex items-center justify-between w-full gap-4">
                              <span className={`text-lg font-medium tracking-wide transition-all duration-500 ${checked[task.text] ? 'text-green-100' : 'text-white'}`}>
                                {task.text}
                              </span>

                              <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-gray-400">
                                  +{task.points} pts
                                </span>

                                {checked[task.text] ? (
  <div className="relative overflow-hidden flex items-center gap-2 px-4 py-2 rounded-xl border border-green-400/40 bg-green-500/10 text-green-300 font-black shadow-[0_0_20px_rgba(34,197,94,0.35)]">
    <span className="animate-pulse text-lg">🎉</span>

    <span className="tracking-wide">
      COMPLETED
    </span>

    <span className="animate-pulse text-lg">✨</span>

    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-green-400 opacity-80 animate-pulse" />
  </div>
) : (
  <button
    onClick={(e) => {
      e.preventDefault();
      deleteTask(task.text);
    }}
    className="px-5 py-2 rounded-xl bg-red-500/90 hover:bg-red-400 text-white font-bold transition-all duration-300 hover:scale-105"
  >
    Delete
  </button>
)}
                              </div>
                            </div>
                          
                          </motion.div>
                        );
                      })}
                  </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-10 bg-black rounded-[2rem] border border-gray-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-black text-white">
                🗑 Deleted Tasks Bin
              </h2>

              <button
                onClick={() => setShowDeletedBin(!showDeletedBin)}
                className="px-5 py-2 rounded-xl bg-white text-black font-bold"
              >
                {showDeletedBin ? 'Hide Bin' : 'Show Bin'}
              </button>
            </div>

            {showDeletedBin && (
              <div className="space-y-4">
                {deletedTasks.length === 0 ? (
                  <p className="text-gray-400">
                    No deleted tasks stored.
                  </p>
                ) : (
                  deletedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-gray-900 rounded-2xl border border-gray-700 p-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-white font-bold">
                          {task.text}
                        </p>

                        <p className="text-gray-400 text-sm mt-1">
                          {task.section} • {task.points} pts
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => restoreDeletedTask(task)}
                          className="px-4 py-2 rounded-xl bg-green-500 text-black font-bold"
                        >
                          Restore
                        </button>

                        <button
                          onClick={() =>
                            setDeletedTasks((prev) =>
                              prev.filter((item) => item.id !== task.id)
                            )
                          }
                          className="px-4 py-2 rounded-xl bg-red-500 text-white font-bold"
                        >
                          Delete Forever
                        </button>
                      </div>
                    </div>
                  ))
                )}

                {deletedTasks.length > 0 && (
                  <button
                    onClick={() => setDeletedTasks([])}
                    className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black"
                  >
                    Clear Bin
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={resetTasks}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-red-500 text-white font-semibold hover:scale-105 transition"
            >
              <RotateCcw className="w-5 h-5" />
              Reset All Tasks
            </button>
          </div>

          <div className="mt-10 bg-slate-50 rounded-3xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">🧠 Daily Reflection</h2>

              <button
                onClick={saveReflection}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-black text-white font-semibold hover:scale-105 transition"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you understand today?"
              className="w-full h-40 rounded-2xl border border-gray-300 p-4 text-lg resize-none focus:outline-none"
            />
          </div>

          <div className="mt-10 bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <CalendarDays className="w-7 h-7" />
              <h2 className="text-2xl font-bold">Reflection Calendar</h2>
            </div>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-3 text-lg"
            />

            <div className="mt-6 bg-slate-50 rounded-2xl p-5 min-h-[120px] border border-gray-200">
              {selectedDate ? (
                savedReflections[selectedDate] ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        Score Achieved
                      </p>

                      <p className="text-2xl font-bold">
                        {savedReflections[selectedDate].score}/{maxScore}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        Reflection
                      </p>

                      <p className="text-lg whitespace-pre-wrap leading-relaxed">
                        {savedReflections[selectedDate].note}
                      </p>
                    </div>

                    {failureAnalysis[selectedDate] && (
                      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mt-4">
                        <p className="font-bold text-red-500 mb-3">
                          Failure Analysis
                        </p>

                        <div className="space-y-2 text-gray-700">
                          <p>
                            <span className="font-semibold">Reason:</span>{' '}
                            {failureAnalysis[selectedDate].analysis.reason}
                          </p>

                          <p>
                            <span className="font-semibold">Distraction:</span>{' '}
                            {failureAnalysis[selectedDate].analysis.distraction}
                          </p>

                          <p>
                            <span className="font-semibold">Fix:</span>{' '}
                            {failureAnalysis[selectedDate].analysis.fix}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">
                    No reflection saved for this date.
                  </p>
                )
              ) : (
                <p className="text-gray-500">
                  Select a date to view previous reflections.
                </p>
              )}
            </div>
          </div>

          {showFailureOverlay && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl p-6">
              <div className="w-full max-w-3xl bg-white rounded-[2rem] p-8 shadow-2xl relative text-black">
                <button
                  onClick={() => setShowFailureOverlay(false)}
                  className="absolute top-5 right-5 w-10 h-10 rounded-full bg-red-500 text-white font-black"
                >
                  ✕
                </button>

                <h2 className="text-4xl font-black mb-3 text-red-500">
                  Streak Failure Analysis
                </h2>

                <p className="text-gray-600 mb-8 leading-relaxed">
                  Your consistency dropped below the required threshold. Analyze the system failure before continuing.
                </p>

                <div className="space-y-5">
                  <textarea
                    value={failureForm.reason}
                    onChange={(e) =>
                      setFailureForm((prev) => ({
                        ...prev,
                        reason: e.target.value,
                      }))
                    }
                    placeholder="Why did today's system fail?"
                    className="w-full h-28 rounded-2xl border border-gray-300 p-4"
                  />

                  <textarea
                    value={failureForm.distraction}
                    onChange={(e) =>
                      setFailureForm((prev) => ({
                        ...prev,
                        distraction: e.target.value,
                      }))
                    }
                    placeholder="What distracted you specifically?"
                    className="w-full h-28 rounded-2xl border border-gray-300 p-4"
                  />

                  <textarea
                    value={failureForm.fix}
                    onChange={(e) =>
                      setFailureForm((prev) => ({
                        ...prev,
                        fix: e.target.value,
                      }))
                    }
                    placeholder="What system change will prevent this tomorrow?"
                    className="w-full h-28 rounded-2xl border border-gray-300 p-4"
                  />
                </div>

                <button
                  onClick={saveFailureOverlay}
                  className="mt-8 w-full py-4 rounded-2xl bg-black text-white font-black text-lg"
                >
                  Save Failure Analysis
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
