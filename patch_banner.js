const fs = require('fs');
const file = 'frontend/src/pages/DashboardPage.jsx';
let content = fs.readFileSync(file, 'utf8');

const banner = `
          {!user.isVerified && (
            <div className="mb-6 p-4 bg-brand-amberSoft border border-brand-amber/30 rounded-2xl flex items-center justify-between text-brand-ink animate-fade-in shadow-sm">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-brand-amber">mail</span>
                <div>
                  <h4 className="text-xs font-bold font-sans">Verify your email address</h4>
                  <p className="text-[11px] opacity-80 mt-0.5">Please click the link in the email we sent you to secure your sanctuary.</p>
                </div>
              </div>
              <button onClick={() => {}} className="px-4 py-1.5 bg-white border border-brand-border rounded-full text-[10px] font-bold text-brand-teal hover:bg-brand-sand transition-colors">
                Resend Email
              </button>
            </div>
          )}
`;
content = content.replace('<main', banner + '          <main');
fs.writeFileSync(file, content);
