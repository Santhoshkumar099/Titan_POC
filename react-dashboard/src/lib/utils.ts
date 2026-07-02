import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatINR(value: number): string {
  return new Intl.NumberFormat('en-IN').format(value)
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

export const COLORS = {
  gold:        '#C8A24A',
  goldLight:   '#EDD898',
  goldDark:    '#9A6E20',
  maroon:      '#6D213C',
  maroonLight: '#8B2A4E',
  maroonDark:  '#4A1628',
  cream:       '#FAF7F2',
} as const
