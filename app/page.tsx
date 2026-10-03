'use client'

import { useMemo, useState } from 'react'
import {
  ArrowUpRight,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  Command,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Users,
  UserRoundPlus,
  WalletCards,
  X,
} from 'lucide-react'

const password = 'ChangeMe123!'

const navItems = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Enquiries', icon: UserRoundPlus, count: '24' },
  { label: 'Students', icon: GraduationCap },
  { label: 'Academics', icon: BookOpen },
  { label: 'Fees & payments', icon: WalletCards },
  { label: 'Attendance', icon: ClipboardCheck },
  { label: 'Reports', icon: CalendarDays },
]

const recentEnquiries = [
  { name: 'Aarav Mehta', course: 'JEE Advanced', source: 'Website', status: 'New', time: '12 min ago', initials: 'AM', color: 'bg-sky-100 text-sky-700' },
  { name: 'Ishita Sharma', course: 'NEET 2025', source: 'Referral', status: 'Follow-up', time: '38 min ago', initials: 'IS', color: 'bg-violet-100 text-violet-700' },
  { name: 'Rohan Kapoor', course: 'Class 10 CBSE', source: 'Walk-in', status: 'Converted', time: '1 hr ago', initials: 'RK', color: 'bg-amber-100 text-amber-700' },
  { name: 'Meera Iyer', course: 'Foundation 8–10', source: 'Instagram', status: 'New', time: '2 hrs ago', initials: 'MI', color: 'bg-rose-100 text-rose-700' },
]

const collection = [64, 52, 75, 61, 80, 72, 91, 68, 83, 94, 78, 86]

function BrandMark() {
  return (
    <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
      <GraduationCap className="size-5" />
    </div>
  )
}

function StatCard({ icon: Icon, label, value, change, tone }: { icon: typeof Users; label: string; value: string; change: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-[0_8px_30px_-24px_rgba(15,23,42,0.45)]">
      <div className="flex items-start justify-between">
        <div className={`flex size-10 items-center justify-center rounded-xl ${tone}`}><Icon className="size-5" /></div>
        <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700"><ArrowUpRight className="size-3" />{change}</span>
      </div>
      <p className="mt-5 text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
    </div>
  )
}

export default function Page() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [email, setEmail] = useState('admin@edumanage.in')
  const [loginPassword, setLoginPassword] = useState('')
  const [error, setError] = useState('')
  const [active, setActive] = useState('Overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [search, setSearch] = useState('')

  const filteredEnquiries = useMemo(() => recentEnquiries.filter((item) => `${item.name} ${item.course}`.toLowerCase().includes(search.toLowerCase())), [search])

  if (!loggedIn) {
    return (
      <main className="flex min-h-screen bg-[#f7f9fc] text-foreground">
        <section className="relative hidden overflow-hidden bg-primary lg:flex lg:w-[48%] lg:flex-col lg:justify-between lg:p-12">
          <div className="absolute -right-32 -top-24 size-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-16 size-[28rem] rounded-full bg-teal-300/10 blur-3xl" />
          <div className="relative flex items-center gap-3 text-primary-foreground"><BrandMark /><span className="text-xl font-semibold tracking-tight">EduManage</span></div>
          <div className="relative max-w-lg">
            <p className="mb-5 text-sm font-medium uppercase tracking-[0.22em] text-primary-foreground/60">Built for better learning</p>
            <h1 className="text-5xl font-semibold leading-[1.08] tracking-[-0.04em] text-primary-foreground">Run your institution with clarity.</h1>
            <p className="mt-6 max-w-md text-base leading-7 text-primary-foreground/70">One calm workspace for admissions, academics, attendance, and fees — so your team can focus on every student.</p>
            <div className="mt-12 flex items-center gap-3 text-sm text-primary-foreground/75"><div className="flex -space-x-2"><span className="flex size-8 items-center justify-center rounded-full border-2 border-primary bg-amber-200 text-xs font-semibold text-amber-900">AS</span><span className="flex size-8 items-center justify-center rounded-full border-2 border-primary bg-sky-200 text-xs font-semibold text-sky-900">RK</span><span className="flex size-8 items-center justify-center rounded-full border-2 border-primary bg-rose-200 text-xs font-semibold text-rose-900">PV</span></div><span>Trusted by 2,400+ educators</span></div>
          </div>
          <p className="relative text-xs text-primary-foreground/45">© 2025 EduManage Technologies</p>
        </section>
        <section className="flex flex-1 items-center justify-center px-6 py-12 sm:px-12">
          <div className="w-full max-w-[420px]">
            <div className="mb-10 flex items-center gap-3 lg:hidden"><BrandMark /><span className="text-xl font-semibold tracking-tight">EduManage</span></div>
            <div className="mb-8"><div className="mb-5 inline-flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><ShieldCheck className="size-6" /></div><h2 className="text-3xl font-semibold tracking-tight">Welcome back</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Sign in to your institution workspace.</p></div>
            <form onSubmit={(event) => { event.preventDefault(); if (loginPassword === password) { setLoggedIn(true); setError('') } else setError('Incorrect password. Try the initial password provided.') }} className="flex flex-col gap-5">
              <label className="flex flex-col gap-2 text-sm font-medium">Work email<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" className="h-12 rounded-xl border border-border bg-card px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" /></label>
              <label className="flex flex-col gap-2 text-sm font-medium">Password<input value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} type="password" placeholder="Enter your password" className="h-12 rounded-xl border border-border bg-card px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" /></label>
              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
              <div className="flex items-center justify-between text-sm"><label className="flex items-center gap-2 text-muted-foreground"><input type="checkbox" className="size-4 rounded border-border accent-primary" /> Keep me signed in</label><button type="button" className="font-medium text-primary hover:underline">Forgot password?</button></div>
              <button type="submit" className="mt-2 h-12 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:opacity-90">Sign in to EduManage</button>
            </form>
            <p className="mt-8 text-center text-xs leading-5 text-muted-foreground">Initial admin password: <span className="font-semibold text-foreground">ChangeMe123!</span><br />You can change this from Settings after signing in.</p>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-foreground">
      <aside className={`fixed inset-y-0 left-0 z-20 flex w-[250px] flex-col border-r border-border/60 bg-white px-4 py-5 transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 px-2"><BrandMark /><div><p className="font-semibold tracking-tight">EduManage</p><p className="text-[11px] text-muted-foreground">Institution OS</p></div><button onClick={() => setSidebarOpen(false)} className="ml-auto rounded-lg p-2 text-muted-foreground lg:hidden"><X className="size-4" /></button></div>
        <div className="mt-8 rounded-xl bg-muted/60 p-3"><div className="flex items-center justify-between"><div><p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Workspace</p><p className="mt-1 text-sm font-semibold">Apex Academy</p></div><ChevronDown className="size-4 text-muted-foreground" /></div><p className="mt-1 text-xs text-muted-foreground">New Delhi · 2024–25</p></div>
        <nav className="mt-7 flex flex-1 flex-col gap-1" aria-label="Main navigation"><p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Workspace</p>{navItems.map((item) => { const Icon = item.icon; return <button key={item.label} onClick={() => { setActive(item.label); setSidebarOpen(false) }} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${active === item.label ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}><Icon className="size-[17px]" /><span className="flex-1">{item.label}</span>{item.count && <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${active === item.label ? 'bg-white/15 text-white' : 'bg-muted text-muted-foreground'}`}>{item.count}</span>}</button> })}<p className="mb-2 mt-7 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Manage</p><button onClick={() => setActive('Configuration')} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${active === 'Configuration' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}><Settings2 className="size-[17px]" /><span>Configuration</span></button></nav>
        <div className="border-t border-border/60 pt-4"><div className="flex items-center gap-3 rounded-xl p-2"><div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">AS</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">Ananya Singh</p><p className="truncate text-xs text-muted-foreground">Super Admin</p></div><button onClick={() => setLoggedIn(false)} aria-label="Sign out" className="text-muted-foreground hover:text-foreground"><LogOut className="size-4" /></button></div></div>
      </aside>
      {sidebarOpen && <button aria-label="Close navigation" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-10 bg-slate-950/20 lg:hidden" />}
      <div className="lg:pl-[250px]">
        <header className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b border-border/60 bg-white/90 px-5 backdrop-blur-md sm:px-8"><div className="flex items-center gap-3"><button onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-muted-foreground lg:hidden"><Menu className="size-5" /></button><div className="relative hidden w-[260px] sm:block"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search students, enquiries..." className="h-10 w-full rounded-xl border border-border/70 bg-muted/40 pl-9 pr-12 text-sm outline-none focus:border-primary" /><span className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-md border border-border bg-white px-1.5 py-0.5 text-[10px] text-muted-foreground"><Command className="size-3" /> K</span></div><p className="text-sm text-muted-foreground sm:hidden">{active}</p></div><div className="flex items-center gap-3"><button className="relative rounded-xl p-2 text-muted-foreground hover:bg-muted"><Bell className="size-[18px]" /><span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-rose-500" /></button><div className="hidden h-6 w-px bg-border sm:block" /><div className="flex items-center gap-2"><div className="flex size-9 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-800">AS</div><div className="hidden text-left sm:block"><p className="text-sm font-medium">Ananya Singh</p><p className="text-[11px] text-muted-foreground">Super Admin</p></div><ChevronDown className="hidden size-4 text-muted-foreground sm:block" /></div></div></header>
        <div className="mx-auto max-w-[1440px] p-5 sm:p-8"><div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm text-muted-foreground">Wednesday, 12 June 2025</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Good morning, Ananya</h1><p className="mt-2 text-sm text-muted-foreground">Here is what is happening across Apex Academy today.</p></div><button onClick={() => setShowQuickAdd(true)} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"><Plus className="size-4" /> Quick add</button></div>
          {active === 'Overview' ? <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard icon={Users} label="Total students" value="1,248" change="8.4%" tone="bg-sky-100 text-sky-700" /><StatCard icon={CircleDollarSign} label="Collected this month" value="₹8.42L" change="12.6%" tone="bg-emerald-100 text-emerald-700" /><StatCard icon={UserRoundPlus} label="New enquiries" value="86" change="18.2%" tone="bg-violet-100 text-violet-700" /><StatCard icon={ClipboardCheck} label="Today’s attendance" value="94.8%" change="2.1%" tone="bg-amber-100 text-amber-700" /></div><div className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_1fr]"><section className="rounded-2xl border border-border/70 bg-card p-5 shadow-[0_8px_30px_-24px_rgba(15,23,42,0.45)]"><div className="flex items-start justify-between"><div><h2 className="font-semibold">Fee collection</h2><p className="mt-1 text-sm text-muted-foreground">June 2025 · All branches</p></div><button className="rounded-lg p-2 text-muted-foreground hover:bg-muted"><MoreHorizontal className="size-5" /></button></div><div className="mt-8 flex h-48 items-end gap-2 sm:gap-3">{collection.map((height, index) => <div key={index} className="group flex flex-1 flex-col items-center gap-2"><div className={`w-full max-w-8 rounded-t-md transition group-hover:bg-primary ${index === 10 ? 'bg-primary' : 'bg-primary/15'}`} style={{ height: `${Math.round(height * 1.35)}px` }} /><span className="text-[10px] text-muted-foreground">{['1','3','5','7','9','11','13','15','17','19','21','23'][index]}</span></div>)}</div><div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4 text-sm"><span className="text-muted-foreground">This month</span><span className="font-semibold">₹8,42,500 <span className="ml-1 text-xs font-medium text-emerald-600">+12.6%</span></span></div></section><section className="rounded-2xl border border-border/70 bg-card p-5 shadow-[0_8px_30px_-24px_rgba(15,23,42,0.45)]"><div className="flex items-start justify-between"><div><h2 className="font-semibold">Today&apos;s snapshot</h2><p className="mt-1 text-sm text-muted-foreground">Wednesday, 12 June</p></div><div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><Sparkles className="size-4" /></div></div><div className="mt-6 flex flex-col gap-5"><div><div className="mb-2 flex justify-between text-sm"><span className="text-muted-foreground">Attendance marked</span><span className="font-medium">1,183 / 1,248</span></div><div className="h-2 rounded-full bg-muted"><div className="h-2 w-[95%] rounded-full bg-primary" /></div></div><div className="flex items-center justify-between border-b border-border/60 pb-4"><span className="flex items-center gap-2 text-sm text-muted-foreground"><span className="size-2 rounded-full bg-emerald-500" />Classes running</span><span className="text-sm font-semibold">32 / 34</span></div><div className="flex items-center justify-between border-b border-border/60 pb-4"><span className="flex items-center gap-2 text-sm text-muted-foreground"><span className="size-2 rounded-full bg-amber-500" />Pending follow-ups</span><span className="text-sm font-semibold">18</span></div><div className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm text-muted-foreground"><span className="size-2 rounded-full bg-rose-500" />Fees due today</span><span className="text-sm font-semibold">₹1,26,800</span></div></div></section></div><section className="mt-6 rounded-2xl border border-border/70 bg-card shadow-[0_8px_30px_-24px_rgba(15,23,42,0.45)]"><div className="flex flex-col gap-3 border-b border-border/60 p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold">Recent enquiries</h2><p className="mt-1 text-sm text-muted-foreground">Keep your admissions pipeline moving.</p></div><button onClick={() => setActive('Enquiries')} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">View all <ArrowUpRight className="size-4" /></button></div><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-muted/35 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-5 py-3 font-medium">Prospect</th><th className="px-5 py-3 font-medium">Interested in</th><th className="px-5 py-3 font-medium">Source</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 font-medium">Added</th><th className="px-5 py-3" /></tr></thead><tbody>{filteredEnquiries.map((item) => <tr key={item.name} className="border-t border-border/50"><td className="px-5 py-3.5"><div className="flex items-center gap-3"><div className={`flex size-8 items-center justify-center rounded-full text-[11px] font-semibold ${item.color}`}>{item.initials}</div><span className="font-medium">{item.name}</span></div></td><td className="px-5 py-3.5 text-muted-foreground">{item.course}</td><td className="px-5 py-3.5 text-muted-foreground">{item.source}</td><td className="px-5 py-3.5"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.status === 'Converted' ? 'bg-emerald-50 text-emerald-700' : item.status === 'Follow-up' ? 'bg-amber-50 text-amber-700' : 'bg-sky-50 text-sky-700'}`}>{item.status}</span></td><td className="px-5 py-3.5 text-muted-foreground">{item.time}</td><td className="px-5 py-3.5 text-right"><button className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"><MoreHorizontal className="size-4" /></button></td></tr>)}</tbody></table></div></section></> : <div className="flex min-h-[480px] items-center justify-center rounded-2xl border border-dashed border-border bg-card"><div className="text-center"><div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Settings2 className="size-6" /></div><h2 className="mt-4 text-xl font-semibold">{active}</h2><p className="mt-2 max-w-sm text-sm text-muted-foreground">This workspace is ready for your configured modules. Choose Overview to return to the dashboard.</p><button onClick={() => setActive('Overview')} className="mt-5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Back to overview</button></div></div>}
        </div>
      </div>
      {showQuickAdd && <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/25 p-4"><div role="dialog" aria-modal="true" aria-labelledby="quick-add-title" className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"><div className="flex items-start justify-between"><div><h2 id="quick-add-title" className="text-lg font-semibold">Quick add</h2><p className="mt-1 text-sm text-muted-foreground">Start with the task you need to do most.</p></div><button onClick={() => setShowQuickAdd(false)} aria-label="Close quick add" className="rounded-lg p-2 text-muted-foreground hover:bg-muted"><X className="size-4" /></button></div><div className="mt-6 grid gap-3 sm:grid-cols-2"><button onClick={() => { setActive('Enquiries'); setShowQuickAdd(false) }} className="flex items-center gap-3 rounded-xl border border-border p-4 text-left transition hover:border-primary hover:bg-primary/5"><UserRoundPlus className="size-5 text-primary" /><span><b className="block text-sm">New enquiry</b><small className="text-xs text-muted-foreground">Capture a prospect</small></span></button><button onClick={() => { setActive('Students'); setShowQuickAdd(false) }} className="flex items-center gap-3 rounded-xl border border-border p-4 text-left transition hover:border-primary hover:bg-primary/5"><GraduationCap className="size-5 text-primary" /><span><b className="block text-sm">Add student</b><small className="text-xs text-muted-foreground">Create an admission</small></span></button><button onClick={() => { setActive('Fees & payments'); setShowQuickAdd(false) }} className="flex items-center gap-3 rounded-xl border border-border p-4 text-left transition hover:border-primary hover:bg-primary/5"><WalletCards className="size-5 text-primary" /><span><b className="block text-sm">Collect fee</b><small className="text-xs text-muted-foreground">Record a payment</small></span></button><button onClick={() => setShowQuickAdd(false)} className="flex items-center gap-3 rounded-xl border border-border p-4 text-left transition hover:border-primary hover:bg-primary/5"><Check className="size-5 text-primary" /><span><b className="block text-sm">Mark attendance</b><small className="text-xs text-muted-foreground">Update a batch</small></span></button></div></div></div>}
    </main>
  )
}
