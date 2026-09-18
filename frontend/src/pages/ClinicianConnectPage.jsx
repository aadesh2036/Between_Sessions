import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ClinicianConnectPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const testCedarAuth = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/v1/practitioner/patients/usr_veteran456/summary');
      const data = await res.json();
      setResult(data);
    } catch(err) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/app" className="w-8 h-8 rounded-full bg-brand-canvas flex items-center justify-center text-brand-ink/60 hover:text-brand-teal transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        </Link>
        <h1 className="font-editorial text-3xl text-brand-ink">Clinician Connect</h1>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-brand-border/40 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-full bg-brand-softerTeal flex items-center justify-center text-brand-teal">
            <span className="material-symbols-outlined text-[24px]">medical_services</span>
          </div>
          <h3 className="font-editorial text-2xl text-brand-ink">Cedar Auth Demo</h3>
          <p className="text-brand-ink/60 text-sm">
            Test the AWS Cedar authorization policy protecting this data. The mock backend requires the practitioner to have an ACTIVE connection and PRACTICE_HISTORY consent.
          </p>
          <button onClick={testCedarAuth} disabled={loading} className="px-6 py-2.5 bg-brand-teal text-white text-xs font-bold rounded-full hover:bg-brand-tealDark transition-all shadow-sm disabled:opacity-70">
            {loading ? 'Evaluating Policy...' : 'Simulate Practitioner Request'}
          </button>
        </div>

        {result && (
          <div className={`p-6 rounded-3xl border ${result.error ? 'bg-brand-coralSoft border-brand-coral/20' : 'bg-brand-canvas border-brand-border'}`}>
            <h4 className={`text-xs font-bold uppercase tracking-widest mb-3 ${result.error ? 'text-brand-coral' : 'text-brand-teal'}`}>
              {result.error ? 'Access Denied (Cedar)' : 'Access Granted (Cedar)'}
            </h4>
            <pre className="text-xs font-mono text-brand-ink whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
