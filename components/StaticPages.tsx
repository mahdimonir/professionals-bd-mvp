
import React from 'react';
import { Shield, Mail, Phone, MapPin, Target, Award, Users, CheckCircle } from 'lucide-react';

const About: React.FC = () => (
  <div className="pt-40 pb-20 px-4">
    <div className="max-w-4xl mx-auto space-y-24">
      <div className="text-center space-y-8">
        <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-[0.85]">
          Built on <span className="text-primary-600">Trust.</span>
        </h1>
        <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
          ProfessionalsBD is the premier high-trust network platform bridging the gap between elite Bangladeshi experts and global citizens.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        <div className="glass p-12 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
          <div className="w-16 h-16 bg-primary-600/10 rounded-2xl flex items-center justify-center border border-primary-500/20">
            <Target className="w-8 h-8 text-primary-500" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Our Core Mission</h3>
          <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            To provide every citizen and business in Bangladesh with instant access to world-class professional consultation via secure digital architecture.
          </p>
        </div>
        <div className="glass p-12 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
          <div className="w-16 h-16 bg-indigo-600/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
            <Shield className="w-8 h-8 text-indigo-500" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Radical Transparency</h3>
          <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            We operate on a zero-compromise vetting policy. Every expert on our platform is hand-picked based on performance, ethics, and deep domain expertise.
          </p>
        </div>
      </div>

      <div className="space-y-12">
        <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 text-center">Verified Industry Excellence</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: Users, label: "Client Base", val: "10,000+" },
            { icon: Award, label: "Expert Hubs", val: "4 Core" },
            { icon: Shield, label: "Uptime", val: "99.99%" },
            { icon: Target, label: "Resolution", val: "15 Mins" }
          ].map((item, i) => (
            <div key={i} className="text-center group">
              <item.icon className="w-6 h-6 text-primary-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <p className="text-2xl font-black text-slate-900 dark:text-white">{item.val}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const Contact: React.FC = () => (
  <div className="pt-40 pb-20 px-4">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
        <div className="space-y-12">
          <div className="space-y-6">
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-[0.85]">
              Say <span className="text-primary-600">Hello.</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium">
              Have a high-stakes professional need? Our concierge team is standing by to assist with custom matching.
            </p>
          </div>

          <div className="space-y-8">
             <div className="flex items-center gap-6 group">
                <div className="bg-primary-600/10 p-4 rounded-2xl border border-primary-500/20 group-hover:bg-primary-600 transition-all">
                  <Mail className="w-6 h-6 text-primary-500 group-hover:text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Correspondence</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">nexus@professionalsbd.com</p>
                </div>
             </div>
             <div className="flex items-center gap-6 group">
                <div className="bg-indigo-600/10 p-4 rounded-2xl border border-indigo-500/20 group-hover:bg-indigo-600 transition-all">
                  <Phone className="w-6 h-6 text-indigo-500 group-hover:text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Direct Hotline</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">+880 1711 000000</p>
                </div>
             </div>
             <div className="flex items-center gap-6 group">
                <div className="bg-slate-900/10 dark:bg-white/10 p-4 rounded-2xl border border-slate-200 dark:border-white/10 group-hover:bg-slate-900 transition-all">
                  <MapPin className="w-6 h-6 text-slate-600 dark:text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dhaka Core Office</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">Gulshan 2, Dhaka, BD</p>
                </div>
             </div>
          </div>
        </div>

        <div className="glass p-12 rounded-[4rem] border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden">
           <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-600/20 blur-3xl"></div>
           <div className="space-y-8 relative z-10">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Concierge Request</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Name</label>
                  <input className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl outline-none focus:border-primary-500 font-bold" placeholder="Professional Name" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Email</label>
                  <input className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl outline-none focus:border-primary-500 font-bold" placeholder="nexus@company.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Your Professional Need</label>
                <textarea className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl outline-none focus:border-primary-500 h-40 font-bold" placeholder="How can our network assist you today?"></textarea>
              </div>
              <button className="w-full bg-primary-600 hover:bg-primary-500 text-white font-black py-6 rounded-3xl uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95">Send Secure Signal</button>
           </div>
        </div>
      </div>
    </div>
  </div>
);

const Terms: React.FC = () => (
  <div className="pt-40 pb-20 px-4">
    <div className="max-w-4xl mx-auto prose dark:prose-invert">
      <h1 className="text-5xl font-black uppercase tracking-tighter mb-12">Terms of Engagement</h1>
      <p className="text-xl font-bold text-primary-600">Last Revised: February 2026</p>
      <div className="space-y-12 mt-16">
        <section>
          <h3 className="text-2xl font-black uppercase tracking-tight">1. Scope of Network</h3>
          <p className="text-slate-500 leading-relaxed font-medium">ProfessionalsBD acts as a high-trust matching layer. We do not provide professional services directly; instead, we facilitate encrypted channels between verified independent experts and seekers of professional advice.</p>
        </section>
        <section>
          <h3 className="text-2xl font-black uppercase tracking-tight">2. User Conduct & Trust</h3>
          <p className="text-slate-500 leading-relaxed font-medium">All sessions are conducted under a mutual agreement of professional ethics. Any violation of platform standards will result in permanent removal from the high-trust node network.</p>
        </section>
        <section>
          <h3 className="text-2xl font-black uppercase tracking-tight">3. Financial Protocol</h3>
          <p className="text-slate-500 leading-relaxed font-medium">Payment is held in our secure escrow until the professional session is successfully initiated. Refunds are subject to the specific expert's cancellation policy as disclosed at the time of booking.</p>
        </section>
      </div>
    </div>
  </div>
);

const Policy: React.FC = () => (
  <div className="pt-40 pb-20 px-4">
    <div className="max-w-4xl mx-auto prose dark:prose-invert">
      <h1 className="text-5xl font-black uppercase tracking-tighter mb-12">Privacy Protocol</h1>
      <p className="text-xl font-bold text-indigo-600">Data Sovereignty First.</p>
      <div className="space-y-12 mt-16">
        <section>
          <h3 className="text-2xl font-black uppercase tracking-tight">1. End-to-End Encryption</h3>
          <p className="text-slate-500 leading-relaxed font-medium">Your video sessions are transmitted over end-to-end encrypted tunnels. ProfessionalsBD does not record or monitor live sessions unless explicitly requested by the host for archival purposes.</p>
        </section>
        <section>
          <h3 className="text-2xl font-black uppercase tracking-tight">2. Data Minimization</h3>
          <p className="text-slate-500 leading-relaxed font-medium">We collect only the bare essentials required for professional matchmaking. We will never sell your professional history to third-party data brokers.</p>
        </section>
        <section>
          <h3 className="text-2xl font-black uppercase tracking-tight">3. Security Audits</h3>
          <p className="text-slate-500 leading-relaxed font-medium">Our platform undergoes bi-weekly security audits to ensure compliance with the highest international standards of data protection and privacy.</p>
        </section>
      </div>
    </div>
  </div>
);

export default { About, Contact, Terms, Policy };
