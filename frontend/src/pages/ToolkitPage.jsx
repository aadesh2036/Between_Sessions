import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardShell from '../components/DashboardShell';
import { toolkitApi } from '../services/api';

export default function ToolkitPage() {
  const [searchParams] = useSearchParams();
  const initialTool = searchParams.get('tool') || 'grounding';
  const [activeTool, setActiveTool] = useState(initialTool);

  // Sync tool from query param if changed
  useEffect(() => {
    const t = searchParams.get('tool');
    if (t && ['grounding', 'breathing', 'pause-choose', 'reassurance', 'focus'].includes(t)) {
      setActiveTool(t);
    }
  }, [searchParams]);

  return (
    <DashboardShell>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header>
          <div className="flex items-center gap-2 text-brand-teal text-xs font-semibold uppercase tracking-wider mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-teal"></span>
            <span>Digital Regulation Sanctuary</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl text-brand-ink font-medium leading-tight">
            Calm Toolkit for <span className="italic text-brand-teal">Difficult Moments</span>
          </h1>
          <p className="text-xs sm:text-sm text-brand-ink/70 mt-1 max-w-2xl leading-relaxed">
            These tools steady your body and mind so you can return to meaningful activity. They are not intended to eliminate anxiety or guarantee certainty.
          </p>
        </header>

        {/* ── NON-RITUAL CLINICAL DISCLAIMER BANNER ───────────────────────── */}
        <div className="p-5 rounded-2xl bg-brand-amberSoft border border-brand-amber/40 shadow-xs flex items-start gap-3.5">
          <span className="material-symbols-outlined text-brand-amber text-[22px] shrink-0 mt-0.5">
            shield
          </span>
          <div className="text-xs text-brand-ink/80 space-y-1">
            <span className="font-bold text-brand-ink block text-sm">
              Clinical Boundary: Grounding is NOT an OCD Neutralizing Ritual
            </span>
            <p className="leading-relaxed">
              This tool is for getting oriented and returning to your activity. You don't need to use it to prove that the thought is safe, prevent a catastrophe, or make the uncomfortable feeling disappear. If you find yourself grounding to "sanitize" an intrusive thought, pause and allow the doubt to remain.
            </p>
          </div>
        </div>

        {/* ── Tool Tabs ───────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 border-b border-brand-border/60 pb-3" role="tablist" aria-label="Calm toolkit categories">
          {[
            { id: 'grounding', label: 'Grounding & Sensory', icon: 'spa' },
            { id: 'breathing', label: 'Paced Breathing', icon: 'air' },
            { id: 'pause-choose', label: 'Pause & Choose', icon: 'pause_circle' },
            { id: 'reassurance', label: 'Reassurance Interrupter', icon: 'help_center' },
            { id: 'focus', label: 'Focus Timer', icon: 'timer' },
          ].map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={activeTool === t.id}
              onClick={() => setActiveTool(t.id)}
              className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
                activeTool === t.id
                  ? 'bg-brand-ink text-white shadow-xs font-semibold'
                  : 'bg-brand-paper border border-brand-border text-brand-ink/75 hover:bg-brand-canvas hover:text-brand-ink'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* ── Active Tool Component Container ─────────────────────────────── */}
        <div key={activeTool} className="bg-brand-paper border border-brand-border/70 rounded-3xl p-6 sm:p-8 shadow-card-lift animate-tab-switch">
          {activeTool === 'grounding' && <GroundingTool />}
          {activeTool === 'breathing' && <BreathingTool />}
          {activeTool === 'pause-choose' && <PauseChooseTool />}
          {activeTool === 'reassurance' && <ReassuranceTool />}
          {activeTool === 'focus' && <FocusTool />}
        </div>

      </div>
    </DashboardShell>
  );
}

/* ═════════════════════════════════════════════════════════════════════════════
   1. GROUNDING TOOL (5-4-3-2-1, Orienting, Feet-on-floor, Sensory Anchor)
   ═════════════════════════════════════════════════════════════════════════════ */
function GroundingTool() {
  const [subTool, setSubTool] = useState('54321');
  const [step54321, setStep54321] = useState(5);
  const [logged, setLogged] = useState(false);

  const STEPS = {
    5: { count: 5, prompt: '5 things you can see around the room', desc: 'Notice colors, reflections, or shapes that have nothing to do with your thoughts.', icon: 'visibility' },
    4: { count: 4, prompt: '4 things you can physically touch or feel', desc: 'The texture of your clothes, the warmth of a desk, feet inside your shoes.', icon: 'touch_app' },
    3: { count: 3, prompt: '3 distinct sounds you can hear right now', desc: 'A distant car, hum of a fan, birds outside, or your own breath.', icon: 'hearing' },
    2: { count: 2, prompt: '2 things you can smell or scents nearby', desc: 'Fresh coffee, outdoor air, hand soap, or paper.', icon: 'air' },
    1: { count: 1, prompt: '1 thing you can taste or physical sensation in mouth', desc: 'A sip of cold water, mint, or noticing the palate.', icon: 'restaurant' },
  };

  const current = STEPS[step54321];

  const handleNext54321 = async () => {
    if (step54321 > 1) {
      setStep54321(step54321 - 1);
    } else {
      setLogged(true);
      try {
        await toolkitApi.logInteraction({
          toolId: 'grounding',
          durationSeconds: 120,
          actionChosen: '5-4-3-2-1 completed',
          notes: 'Completed full sensory grounding sequence',
        });
      } catch { /* best effort */ }
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Subtool Selector */}
      <div className="flex flex-wrap gap-2 border-b border-brand-border/60 pb-3 text-xs" role="tablist" aria-label="Grounding sub-tools">
        {[
          { id: '54321', label: '5-4-3-2-1 Sensory' },
          { id: 'orienting', label: 'Room Orienting' },
          { id: 'feet', label: 'Feet on the Floor' },
          { id: 'anchor', label: 'Physical Anchor' },
        ].map((st) => (
          <button
            key={st.id}
            role="tab"
            aria-selected={subTool === st.id}
            onClick={() => {
              setSubTool(st.id);
              setLogged(false);
              setStep54321(5);
            }}
            className={`min-h-[44px] px-4 py-2 rounded-xl transition-colors flex items-center justify-center ${
              subTool === st.id
                ? 'bg-brand-softerTeal text-brand-teal font-semibold border border-brand-teal/30'
                : 'text-brand-ink/75 hover:text-brand-ink'
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {subTool === '54321' && (
        <div className="space-y-6 animate-fade-in text-center py-4">
          {!logged ? (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-softerTeal text-brand-teal border border-brand-teal/20 shadow-xs">
                <span className="material-symbols-outlined text-[30px]">{current.icon}</span>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-teal px-3 py-1 rounded-full bg-brand-softerTeal">
                  Step {6 - step54321} of 5
                </span>
                <h2 className="font-editorial text-2xl sm:text-3xl text-brand-ink font-medium">
                  {current.prompt}
                </h2>
                <p className="text-xs sm:text-sm text-brand-ink/75 max-w-md mx-auto leading-relaxed">
                  {current.desc}
                </p>
              </div>

              <div className="pt-4 flex justify-center gap-3">
                {step54321 < 5 && (
                  <button
                    onClick={() => setStep54321(step54321 + 1)}
                    className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-medium text-brand-ink/75 hover:text-brand-ink"
                  >
                    Previous
                  </button>
                )}
                <button
                  onClick={handleNext54321}
                  className="min-h-[44px] px-6 py-2.5 rounded-xl bg-brand-teal hover:bg-brand-tealDark text-white text-xs font-medium transition-colors shadow-xs flex items-center"
                >
                  {step54321 === 1 ? 'Complete Sequence' : 'I Notice These → Next'}
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4 py-6">
              <div className="w-14 h-14 rounded-full bg-brand-softSuccess text-clinical-success mx-auto flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[26px]">check</span>
              </div>
              <h3 className="font-editorial text-2xl text-brand-ink font-medium">
                Sensory Sequence Complete
              </h3>
              <p className="text-xs text-brand-ink/70 max-w-md mx-auto">
                You are here, right in this physical room. The intrusive thought may still be there, and that is okay. Return to your meaningful task.
              </p>
              <button
                onClick={() => {
                  setLogged(false);
                  setStep54321(5);
                }}
                className="px-4 py-2 rounded-xl border border-brand-border text-xs text-brand-ink hover:bg-brand-canvas"
              >
                Reset Exercise
              </button>
            </div>
          )}
        </div>
      )}

      {subTool === 'orienting' && (
        <div className="space-y-4 animate-fade-in text-left">
          <h3 className="font-editorial text-2xl text-brand-ink font-medium">
            Room Orienting Exercise
          </h3>
          <p className="text-xs sm:text-sm text-brand-ink/70 leading-relaxed">
            When obsessions hijack attention, mental focus narrows onto imaginary catastrophes. Orienting gently invites your visual system to explore physical reality.
          </p>
          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-2xl bg-brand-canvas border border-brand-border/60 text-xs text-brand-ink/80 space-y-1">
              <span className="font-bold text-brand-ink block">1. Slow Head Turn</span>
              <p>Turn your head slowly to the left, taking in everything from floor to ceiling. Then turn gently to the right.</p>
            </div>
            <div className="p-4 rounded-2xl bg-brand-canvas border border-brand-border/60 text-xs text-brand-ink/80 space-y-1">
              <span className="font-bold text-brand-ink block">2. Identify 3 Neutral Items</span>
              <p>Pick three inanimate objects that have no emotional charge (e.g. a book spine, a door hinge, a coffee mug). Name their material: wood, metal, ceramic.</p>
            </div>
            <div className="p-4 rounded-2xl bg-brand-canvas border border-brand-border/60 text-xs text-brand-ink/80 space-y-1">
              <span className="font-bold text-brand-ink block">3. Remind Yourself</span>
              <p className="italic">"Right here in this room, at this exact moment, I am sitting safely. The doubt is in my head, not in the room."</p>
            </div>
          </div>
        </div>
      )}

      {subTool === 'feet' && (
        <div className="space-y-4 animate-fade-in text-left">
          <h3 className="font-editorial text-2xl text-brand-ink font-medium">
            Feet-on-Floor Somatic Anchor
          </h3>
          <p className="text-xs sm:text-sm text-brand-ink/70 leading-relaxed">
            Bring all awareness into the soles of your feet resting on the floor.
          </p>
          <div className="space-y-3 pt-2 text-xs text-brand-ink/80">
            <p className="p-4 rounded-2xl bg-brand-canvas border border-brand-border/60">
              Feel the gravity pressing down through your heels and toes. Notice the firm resistance of the floor beneath you supporting your entire body.
            </p>
            <p className="p-4 rounded-2xl bg-brand-canvas border border-brand-border/60">
              Wiggle your toes slightly. Notice the fabric of your socks or the chill of the tiles. You do not need to push away any intrusive thoughts; simply let them exist above you like clouds while your roots stay grounded.
            </p>
          </div>
        </div>
      )}

      {subTool === 'anchor' && (
        <div className="space-y-4 animate-fade-in text-left">
          <h3 className="font-editorial text-2xl text-brand-ink font-medium">
            Sensory Physical Anchor
          </h3>
          <p className="text-xs sm:text-sm text-brand-ink/70 leading-relaxed">
            Hold a tangible physical item in your hand—a stone, a keyset, a piece of wood, or a glass of water.
          </p>
          <div className="space-y-3 pt-2 text-xs text-brand-ink/80">
            <p className="p-4 rounded-2xl bg-brand-canvas border border-brand-border/60">
              Notice the temperature: is it cool or warm? Notice the weight in your palm. Run your thumb across its edge.
            </p>
            <p className="p-4 rounded-2xl bg-brand-canvas border border-brand-border/60">
              This physical object exists in consensus reality. When mental loops try to drag you into catastrophic speculation, hold the anchor and remind yourself: <span className="italic font-medium">"I am here with this object now."</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════════════
   2. PACED BREATHING (Gentle, strictly NO vagus/HRV/cortisol claims)
   ═════════════════════════════════════════════════════════════════════════════ */
function BreathingTool() {
  const [phase, setPhase] = useState('Inhale'); // Inhale | Hold | Exhale
  const [running, setRunning] = useState(false);
  const [duration, setDuration] = useState(120); // 60s, 120s, 300s
  const [timeLeft, setTimeLeft] = useState(120);

  useEffect(() => {
    if (!running) return;

    // Breathing rhythm: Inhale 4s, Hold 2s, Exhale 6s (12s total cycle)
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setRunning(false);
          toolkitApi.logInteraction({
            toolId: 'breathing',
            durationSeconds: duration,
            notes: `Completed ${duration / 60}m paced breathing session`,
          }).catch(() => {});
          return duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running, duration]);

  useEffect(() => {
    if (!running) return;
    const cyclePos = (duration - timeLeft) % 12;
    if (cyclePos < 4) setPhase('Inhale slowly');
    else if (cyclePos < 6) setPhase('Soft hold');
    else setPhase('Exhale smoothly');
  }, [timeLeft, running, duration]);

  const handleToggle = () => {
    if (running) {
      setRunning(false);
    } else {
      setTimeLeft(duration);
      setRunning(true);
    }
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto text-center py-4">
      <div className="space-y-1">
        <h2 className="font-editorial text-2xl sm:text-3xl text-brand-ink font-medium">
          Paced Breath Cadence
        </h2>
        <p className="text-xs text-brand-ink/75 max-w-md mx-auto">
          A gentle pacing aid to steady your respiration while tolerating distress.
        </p>
      </div>

      {/* Mode selection */}
      {!running && (
        <div className="flex justify-center gap-2 text-xs">
          {[
            { s: 60, label: '1 Minute' },
            { s: 120, label: '2 Minutes' },
            { s: 300, label: '5 Minutes' },
          ].map((m) => (
            <button
              key={m.s}
              onClick={() => {
                setDuration(m.s);
                setTimeLeft(m.s);
              }}
              className={`min-h-[44px] px-4 py-2.5 rounded-xl transition-colors ${
                duration === m.s
                  ? 'bg-brand-ink text-white font-semibold'
                  : 'bg-brand-canvas text-brand-ink/75 border border-brand-border hover:text-brand-ink'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}

      {/* Animated visual breath circle */}
      <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
        <div
          className={`absolute inset-0 rounded-full bg-brand-softerTeal/70 border border-brand-teal/30 transition-transform duration-[4000ms] ease-in-out ${
            running && phase.startsWith('Inhale')
              ? 'scale-110 opacity-90'
              : running && phase.startsWith('Soft hold')
              ? 'scale-110 opacity-100 ring-2 ring-brand-teal/30'
              : 'scale-90 opacity-60'
          }`}
        ></div>

        <div className="relative z-10 space-y-1">
          <span className="font-editorial text-xl font-medium text-brand-ink block" aria-live="polite" aria-atomic="true">
            {running ? phase : 'Ready'}
          </span>
          <span className="font-mono text-xs text-brand-teal block">
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={handleToggle}
          className={`min-h-[44px] px-7 py-2.5 rounded-xl text-xs font-medium transition-colors shadow-xs flex items-center justify-center mx-auto ${
            running
              ? 'bg-brand-coral hover:bg-brand-coral/90 text-white'
              : 'bg-brand-teal hover:bg-brand-tealDark text-white'
          }`}
        >
          {running ? 'Stop Pacing' : 'Begin Paced Breathing'}
        </button>
      </div>

      <p className="text-xs text-brand-ink/75 italic">
        Tip: Allow breathing to be comfortable and unforced. The goal is steady presence, not eliminating all physical sensations.
      </p>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════════════
   3. PAUSE & CHOOSE (Notice -> Allow -> Choose -> Act)
   ═════════════════════════════════════════════════════════════════════════════ */
function PauseChooseTool() {
  const [step, setStep] = useState(1);
  const [chosen, setChosen] = useState(null);
  const [completed, setCompleted] = useState(false);

  const handlePick = async (choice) => {
    setChosen(choice);
    try {
      await toolkitApi.logInteraction({
        toolId: 'pause-choose',
        actionChosen: choice,
        details: 'Selected during multi-step hesitation in Toolkit',
      });
    } catch { /* non-blocking */ }
    setCompleted(true);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto text-center py-2">
      <div className="space-y-1">
        <h2 className="font-editorial text-2xl sm:text-3xl text-brand-ink font-medium">
          Pause & Choose
        </h2>
        <p className="text-xs text-brand-ink/75">
          Insert a conscious pause between the OCD urge and your behavioral response.
        </p>
      </div>

      {!completed ? (
        <div className="p-6 rounded-2xl bg-brand-canvas border border-brand-border/70 space-y-4 shadow-xs text-left">
          <div className="flex items-center justify-between text-xs border-b border-brand-border/60 pb-2">
            <span className="font-semibold text-brand-ink">Step {step} of 4</span>
            <span className="text-brand-ink/75 font-sans font-semibold">
              {step === 1 ? 'Notice' : step === 2 ? 'Allow' : step === 3 ? 'Choose' : 'Act'}
            </span>
          </div>

          {step === 1 && (
            <div className="space-y-3 animate-fade-in text-xs">
              <h3 className="text-sm font-bold text-brand-ink">1. Notice the Urge</h3>
              <p className="text-brand-ink/75 leading-relaxed">
                Take a breath and observe what is happening: "I notice an intrusive thought has arrived, and my brain is urgently asking me to check, wash, confess, or replay."
              </p>
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-brand-lavender text-white font-medium hover:bg-brand-lavender/90 transition-all shadow-xs flex items-center"
                >
                  I Notice It → Next
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3 animate-fade-in text-xs">
              <h3 className="text-sm font-bold text-brand-ink">2. Allow the Discomfort</h3>
              <p className="text-brand-ink/75 leading-relaxed">
                Don't push the feeling away. Locate where it lives in your body: tight chest? knot in the stomach? Allow the discomfort to be there for 30 seconds without trying to fix it.
              </p>
              <div className="pt-2 flex justify-between items-center">
                <button
                  onClick={() => setStep(1)}
                  className="min-h-[44px] px-3 py-2 text-brand-ink/75 hover:text-brand-ink text-xs font-medium flex items-center"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-brand-lavender text-white font-medium hover:bg-brand-lavender/90 transition-all shadow-xs flex items-center"
                >
                  I Can Sit with It → Next
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3 animate-fade-in text-xs">
              <h3 className="text-sm font-bold text-brand-ink">3. Choose Your Direction</h3>
              <p className="text-brand-ink/75 leading-relaxed">
                You have agency. You are not forced to obey the OCD siren. Select how you wish to respond:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {[
                  { id: 'delay', label: 'Delay by 15 mins', desc: 'I will wait before performing any check' },
                  { id: 'resist', label: 'Resist completely', desc: 'I will not perform the ritual today' },
                  { id: 'return', label: 'Return to activity', desc: 'Pivot back to my work or reading' },
                  { id: 'compulsion', label: 'Perform ritual', desc: 'Honest log — will try again next time' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handlePick(opt.id)}
                    className="p-3.5 rounded-2xl border border-brand-border bg-white hover:border-brand-lavender hover:bg-brand-lavenderSoft/50 text-left transition-all shadow-2xs"
                  >
                    <span className="font-semibold block text-brand-ink">{opt.label}</span>
                    <span className="text-xs text-brand-ink/75">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-brand-softSuccess/40 border border-brand-teal/30 text-center space-y-3 animate-fade-in shadow-xs">
          <div className="w-12 h-12 rounded-full bg-brand-teal text-white mx-auto flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-[24px]">check</span>
          </div>
          <h3 className="font-editorial text-2xl text-brand-ink font-medium">
            Choice Recorded: <span className="capitalize text-brand-teal">{chosen}</span>
          </h3>
          <p className="text-xs text-brand-ink/75 max-w-sm mx-auto leading-relaxed">
            Every moment you delay or step back from an urge, your neural pathways adapt. Trust the process.
          </p>
          <button
            onClick={() => {
              setCompleted(false);
              setStep(1);
              setChosen(null);
            }}
            className="min-h-[44px] px-5 py-2.5 rounded-xl border border-brand-border text-xs text-brand-ink hover:bg-white transition-colors"
          >
            Start Another Pause
          </button>
        </div>
      )}
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════════════
   4. REASSURANCE INTERRUPTER ("Am I checking?")
   ═════════════════════════════════════════════════════════════════════════════ */
function ReassuranceTool() {
  const [selectedAction, setSelectedAction] = useState(null);
  const [recorded, setRecorded] = useState(false);

  const ACTIONS = [
    {
      id: 'sit_uncertainty',
      title: 'Sit with Uncertainty for 10 Minutes',
      desc: 'Set a timer. Say to yourself: "Maybe my fear is true, maybe it isn’t. I choose to leave it unresolved right now."',
      icon: 'hourglass_empty',
    },
    {
      id: 'leave_unanswered',
      title: 'Leave This Question Unanswered Today',
      desc: 'Close the browser tab or avoid asking your family member. Treat the doubt as an unread spam email.',
      icon: 'mark_email_unread',
    },
    {
      id: 'return_activity',
      title: 'Return to What You Were Doing',
      desc: 'Pick up your book, return to your code, or resume cooking. Bring all your hands and senses back into your activity.',
      icon: 'arrow_back',
    },
    {
      id: 'bring_to_clinician',
      title: 'Bring This to Your Next Session',
      desc: 'Write down the obsession in one factual sentence without researching it, and review it with your ERP therapist.',
      icon: 'note_alt',
    },
  ];

  const handleAction = async (act) => {
    setSelectedAction(act);
    try {
      await toolkitApi.logInteraction({
        toolId: 'reassurance-interrupter',
        actionChosen: act.id,
        notes: `Reassurance Interrupted: ${act.title}`,
      });
    } catch { /* best effort */ }
    setRecorded(true);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto py-2">
      <div className="text-center space-y-1">
        <span className="text-xs uppercase font-bold tracking-widest text-brand-coral px-2.5 py-0.5 rounded-full bg-brand-coralSoft border border-brand-coral/30">
          Certainty Interceptor
        </span>
        <h2 className="font-editorial text-2xl sm:text-3xl text-brand-ink font-medium">
          “Am I Checking Right Now?”
        </h2>
        <p className="text-xs text-brand-ink/75 max-w-md mx-auto leading-relaxed">
          Reassurance seeking is OCD’s most insidious compulsion. It pretends to be harmless research, but only feeds the flame of doubt.
        </p>
      </div>

      {!recorded ? (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-brand-coralSoft/50 border border-brand-coral/20 text-xs text-brand-ink/80 shadow-xs">
            <span className="font-bold text-brand-coral block mb-1.5 text-sm">Common Reassurance Traps:</span>
            <ul className="list-disc pl-4 space-y-1 text-brand-ink/75 leading-relaxed">
              <li>Googling medical symptoms or philosophical doubts</li>
              <li>Asking a partner: "Are you sure this is okay?"</li>
              <li>Mentally replaying a past conversation over and over</li>
              <li>Checking bodily sensations to verify how you "feel"</li>
            </ul>
          </div>

          <div className="space-y-2.5 pt-1">
            <span className="text-xs font-semibold text-brand-ink uppercase tracking-wider block">
              Choose a Healthy Behavioral Alternative:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ACTIONS.map((act) => (
                <button
                  key={act.id}
                  onClick={() => handleAction(act)}
                  className="p-4 rounded-2xl border border-brand-border bg-white hover:border-brand-coral hover:bg-brand-coralSoft/30 text-left transition-all space-y-1.5 shadow-xs"
                >
                  <div className="flex items-center gap-2 text-brand-coral font-semibold text-xs">
                    <span className="material-symbols-outlined text-[18px]">{act.icon}</span>
                    <span>{act.title}</span>
                  </div>
                  <p className="text-xs text-brand-ink/75 leading-relaxed">{act.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-brand-softSuccess/40 border border-brand-teal/30 text-center space-y-3 animate-fade-in shadow-xs">
          <div className="w-12 h-12 rounded-full bg-brand-teal text-white mx-auto flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-[24px]">check</span>
          </div>
          <h3 className="font-editorial text-2xl text-brand-ink font-medium">
            Reassurance Interrupted!
          </h3>
          <p className="text-xs text-brand-ink/75 max-w-sm mx-auto leading-relaxed">
            You chose: <span className="font-semibold text-brand-ink">{selectedAction?.title}</span>.
            Certainty is a mirage in OCD. Embracing the doubt is freedom.
          </p>
          <button
            onClick={() => {
              setRecorded(false);
              setSelectedAction(null);
            }}
            className="min-h-[44px] px-5 py-2.5 rounded-xl border border-brand-border text-xs text-brand-ink hover:bg-white transition-colors"
          >
            Reset Tool
          </button>
        </div>
      )}
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════════════
   5. FOCUS TOOL (10, 25, 45 min focus linked to Values)
   ═════════════════════════════════════════════════════════════════════════════ */
function FocusTool() {
  const [durationMin, setDurationMin] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [taskName, setTaskName] = useState('');

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          toolkitApi.logInteraction({
            toolId: 'focus-timer',
            durationSeconds: durationMin * 60,
            notes: `Completed ${durationMin}m focus session: ${taskName || 'Values task'}`,
          }).catch(() => {});
          return durationMin * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, durationMin, taskName]);

  const handleSetMinutes = (mins) => {
    setDurationMin(mins);
    setSecondsLeft(mins * 60);
    setIsActive(false);
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return (
    <div className="space-y-6 max-w-md mx-auto text-center py-2">
      <div className="space-y-1">
        <h2 className="font-editorial text-2xl sm:text-3xl text-brand-ink font-medium">
          Life-Aligned Focus Timer
        </h2>
        <p className="text-xs text-brand-ink/75">
          Dedicate undistracted attention to an action outside of OCD.
        </p>
      </div>

      <div>
        <input
          type="text"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          placeholder="What are you focusing on? (e.g. Reading, painting, writing)"
          disabled={isActive}
          className="w-full text-xs text-center px-4 py-2.5 rounded-xl border border-brand-border bg-brand-canvas text-brand-ink focus:outline-none focus:border-brand-teal"
        />
      </div>

      {/* Minutes selector */}
      {!isActive && (
        <div className="flex justify-center gap-2 text-xs">
          {[10, 25, 45].map((m) => (
            <button
              key={m}
              onClick={() => handleSetMinutes(m)}
              className={`min-h-[44px] px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center ${
                durationMin === m
                  ? 'bg-brand-ink text-white font-semibold shadow-xs'
                  : 'bg-brand-canvas text-brand-ink/75 border border-brand-border hover:text-brand-ink'
              }`}
            >
              {m} Minutes
            </button>
          ))}
        </div>
      )}

      {/* Timer display */}
      <div className="py-4">
        <div className="font-mono text-5xl sm:text-6xl font-medium text-brand-ink tracking-tight">
          {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <button
          onClick={() => setIsActive(!isActive)}
          className={`min-h-[44px] px-6 py-2.5 rounded-xl text-xs font-medium transition-colors shadow-xs flex items-center justify-center ${
            isActive
              ? 'bg-brand-coral hover:bg-brand-coral/90 text-white'
              : 'bg-brand-teal hover:bg-brand-tealDark text-white'
          }`}
        >
          {isActive ? 'Pause Focus' : 'Start Focus Session'}
        </button>
        {isActive && (
          <button
            onClick={() => handleSetMinutes(durationMin)}
            className="min-h-[44px] px-4 py-2.5 rounded-xl border border-brand-border text-xs text-brand-ink hover:bg-brand-canvas transition-colors flex items-center justify-center"
          >
            Reset
          </button>
        )}
      </div>

      <p className="text-xs text-brand-ink/75 italic">
        When an intrusive thought tries to interrupt your work, notice it, don't debate it, and return attention to this timer.
      </p>
    </div>
  );
}
