"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PeriodFilterProps {
  value: string
  onChange: (value: string) => void
}

export function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Selecione o período" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="today">Hoje</SelectItem>
        <SelectItem value="week">Esta Semana</SelectItem>
        <SelectItem value="month">Este Mês</SelectItem>
        <SelectItem value="all">Todos os Períodos</SelectItem>
      </SelectContent>
    </Select>
  )
}
