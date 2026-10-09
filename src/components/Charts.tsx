import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { useTheme } from '@/lib/theme'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend, Filler)

function useChartTheme() {
  const { theme } = useTheme()
  const dark = theme === 'dark'
  return {
    grid: dark ? 'rgba(148,210,230,0.07)' : 'rgba(10,21,40,0.06)',
    tick: dark ? '#7f93ad' : '#61748e',
    tooltip: {
      backgroundColor: dark ? 'rgba(10,21,40,0.92)' : 'rgba(255,255,255,0.96)',
      titleColor: dark ? '#e8f1f8' : '#0a1528',
      bodyColor: dark ? '#93a6bf' : '#52657e',
      borderColor: dark ? 'rgba(148,210,230,0.15)' : 'rgba(10,21,40,0.08)',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 12,
      boxPadding: 4,
      usePointStyle: true,
    },
  }
}

export function TrendChart({ labels, created, resolved }: { labels: string[]; created: number[]; resolved: number[] }) {
  const t = useChartTheme()
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: t.tooltip,
    },
    scales: {
      x: { grid: { display: false }, border: { display: false }, ticks: { color: t.tick, font: { family: 'Geist' } } },
      y: { grid: { color: t.grid }, border: { display: false }, ticks: { color: t.tick, font: { family: 'Geist' }, maxTicksLimit: 5 } },
    },
    elements: { line: { tension: 0.42, borderWidth: 2.5 }, point: { radius: 0, hoverRadius: 5, hitRadius: 20 } },
  }
  return (
    <Line
      options={options}
      data={{
        labels,
        datasets: [
          {
            label: 'Created',
            data: created,
            borderColor: '#22d3ee',
            pointBackgroundColor: '#22d3ee',
            fill: true,
            backgroundColor: (ctx) => {
              const { ctx: c, chartArea } = ctx.chart
              if (!chartArea) return 'transparent'
              const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
              g.addColorStop(0, 'rgba(34,211,238,0.28)')
              g.addColorStop(1, 'rgba(34,211,238,0)')
              return g
            },
          },
          { label: 'Resolved', data: resolved, borderColor: '#a78bfa', pointBackgroundColor: '#a78bfa', borderDash: [6, 5], fill: false },
        ],
      }}
    />
  )
}

export function StatusDonut({ labels, values, colors }: { labels: string[]; values: number[]; colors: string[] }) {
  const t = useChartTheme()
  return (
    <Doughnut
      options={{
        responsive: true,
        maintainAspectRatio: false,
        cutout: '74%',
        plugins: { legend: { display: false }, tooltip: t.tooltip },
      }}
      data={{ labels, datasets: [{ data: values, backgroundColor: colors, borderWidth: 0, spacing: 3, borderRadius: 6, hoverOffset: 6 }] }}
    />
  )
}

export function CategoryBars({ labels, values }: { labels: string[]; values: number[] }) {
  const t = useChartTheme()
  return (
    <Bar
      options={{
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: t.tooltip },
        scales: {
          x: { grid: { color: t.grid }, border: { display: false }, ticks: { color: t.tick, precision: 0, font: { family: 'Geist' } } },
          y: { grid: { display: false }, border: { display: false }, ticks: { color: t.tick, font: { family: 'Geist' } } },
        },
      }}
      data={{
        labels,
        datasets: [
          {
            data: values,
            borderRadius: 8,
            borderSkipped: false,
            barThickness: 14,
            backgroundColor: (ctx) => {
              const { ctx: c, chartArea } = ctx.chart
              if (!chartArea) return '#2dd4bf'
              const g = c.createLinearGradient(chartArea.left, 0, chartArea.right, 0)
              g.addColorStop(0, 'rgba(20,184,166,0.55)')
              g.addColorStop(1, 'rgba(56,189,248,0.95)')
              return g
            },
          },
        ],
      }}
    />
  )
}
