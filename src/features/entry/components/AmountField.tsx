interface AmountFieldProps {
  symbol: string
  value: string
  placeholder: string
  onChange: (v: string) => void
}

export function AmountField({ symbol, value, placeholder, onChange }: AmountFieldProps) {
  return (
    <label
      htmlFor="f-amount"
      className="flex items-baseline gap-1.5 border-b border-dashed border-input pt-[18px] pb-3.5"
    >
      <span className="font-display text-[26px] font-semibold text-muted-foreground">{symbol}</span>
      <input
        id="f-amount"
        name="amount"
        inputMode="decimal"
        autoComplete="off"
        placeholder={placeholder}
        aria-label="Amount"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 border-0 bg-transparent font-display text-5xl leading-none font-extrabold tracking-[-0.04em] tabular-nums outline-0 placeholder:text-input"
      />
    </label>
  )
}
