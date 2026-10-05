import { useEffect, useState } from 'react'
import { api, ApiError } from './lib/api'

type Tab = 'Institution' | 'Modules' | 'Masters' | 'Numbering' | 'Academic Years'
const tabs: Tab[] = ['Institution', 'Modules', 'Masters', 'Numbering', 'Academic Years']
const masterTypes = ['SCHOOL', 'BOARD', 'CATEGORY', 'RELATION', 'ENQUIRY_SOURCE', 'PAYMENT_MODE']

export function useMasters(type: string) {
  const [items, setItems] = useState<Array<{ id: string; label: string; code?: string }>>([])
  useEffect(() => { void api.get<typeof items>(`/config/masters/${type}`).then(setItems).catch(() => setItems([])) }, [type])
  return items
}

export function SettingsPage({ toast }: { toast: (message: string) => void }) {
  const [tab, setTab] = useState<Tab>('Institution')
  const [institution, setInstitution] = useState<Record<string, string>>({})
  const [modules, setModules] = useState<Array<{ moduleKey: string; enabled: boolean }>>([])
  const [masters, setMasters] = useState<Array<{ id: string; label: string; code?: string }>>([])
  const [masterType, setMasterType] = useState(masterTypes[0])
  const [newMaster, setNewMaster] = useState('')
  const [numbering, setNumbering] = useState<Array<{ key: string; pattern: string }>>([])
  const [years, setYears] = useState<Array<{ id: string; label: string; isCurrent: boolean }>>([])
  const [error, setError] = useState('')
  const run = async (action: () => Promise<void>) => { try { setError(''); await action(); toast('Changes saved') } catch (e) { setError(e instanceof ApiError ? e.message : 'Unable to save changes') } }
  useEffect(() => { void Promise.all([api.get<Record<string, string>>('/config/institution').then(setInstitution), api.get<typeof modules>('/config/modules').then(setModules), api.get<typeof numbering>('/config/numbering').then(setNumbering), api.get<typeof years>('/config/academic-years').then(setYears)]).catch((e) => setError(e instanceof ApiError ? e.message : 'Unable to load settings')) }, [])
  useEffect(() => { void api.get<typeof masters>(`/config/masters/${masterType}`).then(setMasters).catch(() => setMasters([])) }, [masterType])
  const toggle = (key: string) => setModules((current) => current.map((item) => item.moduleKey === key ? { ...item, enabled: !item.enabled } : item))
  return <div className="page settings-page"><div className="toolbar"><div><p className="eyebrow">ADMINISTRATION</p><h2>Settings</h2><p className="muted">Institution configuration is saved to the API.</p></div></div><div className="settings-tabs">{tabs.map((item) => <button key={item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{item}</button>)}</div>{error && <div className="notice">{error}</div>}{tab === 'Institution' && <section className="panel form-grid"><label>Institution name<input value={institution.name ?? ''} onChange={(e) => setInstitution({ ...institution, name: e.target.value })} /></label><label>Phone<input value={institution.phone ?? ''} onChange={(e) => setInstitution({ ...institution, phone: e.target.value })} /></label><label>Address<input value={institution.address ?? ''} onChange={(e) => setInstitution({ ...institution, address: e.target.value })} /></label><button className="primary" onClick={() => void run(async () => { await api.put('/config/institution', institution) })}>Save institution</button></section>}{tab === 'Modules' && <section className="panel settings-list">{modules.map((item) => <div className="settings-row" key={item.moduleKey}><div><b>{item.moduleKey}</b><p className="muted">Show this module in the workspace</p></div><button className={item.enabled ? 'primary' : 'secondary'} onClick={() => { toggle(item.moduleKey); void run(async () => { await api.put('/config/modules', { moduleKey: item.moduleKey, enabled: !item.enabled }) }) }}>{item.enabled ? 'Enabled' : 'Disabled'}</button></div>)}</section>}{tab === 'Masters' && <section className="panel settings-list"><div className="master-controls"><select value={masterType} onChange={(e) => setMasterType(e.target.value)}>{masterTypes.map((type) => <option key={type}>{type}</option>)}</select><input placeholder="New item label" value={newMaster} onChange={(e) => setNewMaster(e.target.value)} /><button className="primary" onClick={() => void run(async () => { const item = await api.post<typeof masters[number]>(`/config/masters/${masterType}`, { label: newMaster }); setMasters([...masters, item]); setNewMaster('') })}>Add master</button></div>{masters.map((item) => <div className="settings-row" key={item.id}><b>{item.label}</b><button className="secondary" onClick={() => void run(async () => { await api.delete(`/config/masters/${masterType}/${item.id}`); setMasters(masters.filter((x) => x.id !== item.id)) })}>Delete</button></div>)}</section>}{tab === 'Numbering' && <section className="panel settings-list">{numbering.map((item) => <div className="settings-row" key={item.key}><label><b>{item.key}</b><input value={item.pattern} onChange={(e) => setNumbering(numbering.map((x) => x.key === item.key ? { ...x, pattern: e.target.value } : x))} /></label><button className="primary" onClick={() => void run(async () => { await api.put(`/config/numbering/${item.key}`, { pattern: item.pattern }) })}>Save</button></div>)}</section>}{tab === 'Academic Years' && <section className="panel settings-list">{years.map((year) => <div className="settings-row" key={year.id}><div><b>{year.label}</b><p className="muted">{year.isCurrent ? 'Current academic year' : 'Academic year'}</p></div></div>)}</section>}</div>
}
