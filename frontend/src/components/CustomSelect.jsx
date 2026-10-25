import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

export default function CustomSelect({ value, options, onChange, className = '' }) {
  const [open, setOpen] = useState(false); const ref = useRef(null)
  useEffect(() => { const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }; document.addEventListener('mousedown', close); return () => document.removeEventListener('mousedown', close) }, [])
  const label = options.find((option) => (typeof option === 'string' ? option : option.value) === value)
  const text = typeof label === 'string' ? label : label?.label
  return <div className={`custom-select ${className}`} ref={ref}><button type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(!open)}><span>{text}</span><ChevronDown size={15}/></button>{open && <div className="select-menu" role="listbox">{options.map((option) => { const item = typeof option === 'string' ? { value: option, label: option } : option; return <button type="button" role="option" aria-selected={item.value === value} key={item.value} onClick={() => { onChange(item.value); setOpen(false) }}><span>{item.label}</span>{item.value === value && <Check size={15}/>}</button> })}</div>}</div>
}
