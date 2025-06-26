import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import StatsCards from '@/components/dashboard/StatsCards'

describe('StatsCards', () => {
  const mockStats = {
    totalMedications: 5,
    dailyDoses: 3,
    missedDoses: 1,
    adherenceRate: 85.5,
    upcomingAppointments: 2,
    criticalAlerts: 0
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all stats cards', () => {
    render(<StatsCards stats={mockStats} />)
    
    expect(screen.getByText('Total Medications')).toBeInTheDocument()
    expect(screen.getByText('Daily Doses')).toBeInTheDocument()
    expect(screen.getByText('Missed Doses')).toBeInTheDocument()
    expect(screen.getByText('Adherence Rate')).toBeInTheDocument()
    expect(screen.getByText('Upcoming Appointments')).toBeInTheDocument()
    expect(screen.getByText('Critical Alerts')).toBeInTheDocument()
  })

  it('displays correct stat values', () => {
    render(<StatsCards stats={mockStats} />)
    
    expect(screen.getByText('5')).toBeInTheDocument() // totalMedications
    expect(screen.getByText('3')).toBeInTheDocument() // dailyDoses
    expect(screen.getByText('1')).toBeInTheDocument() // missedDoses
    expect(screen.getByText('85.5%')).toBeInTheDocument() // adherenceRate
    expect(screen.getByText('2')).toBeInTheDocument() // upcomingAppointments
    expect(screen.getByText('0')).toBeInTheDocument() // criticalAlerts
  })

  it('shows warning for missed doses', () => {
    render(<StatsCards stats={mockStats} />)
    
    const missedDosesCard = screen.getByText('Missed Doses').closest('.stat-card')
    expect(missedDosesCard).toHaveClass('warning')
  })

  it('shows danger for critical alerts', () => {
    const statsWithAlerts = { ...mockStats, criticalAlerts: 3 }
    render(<StatsCards stats={statsWithAlerts} />)
    
    const alertsCard = screen.getByText('Critical Alerts').closest('.stat-card')
    expect(alertsCard).toHaveClass('danger')
  })

  it('shows good adherence rate in green', () => {
    const goodStats = { ...mockStats, adherenceRate: 95 }
    render(<StatsCards stats={goodStats} />)
    
    const adherenceCard = screen.getByText('Adherence Rate').closest('.stat-card')
    expect(adherenceCard).toHaveClass('success')
  })

  it('shows poor adherence rate in red', () => {
    const poorStats = { ...mockStats, adherenceRate: 65 }
    render(<StatsCards stats={poorStats} />)
    
    const adherenceCard = screen.getByText('Adherence Rate').closest('.stat-card')
    expect(adherenceCard).toHaveClass('danger')
  })

  it('handles loading state', () => {
    render(<StatsCards loading />)
    
    expect(screen.getAllByTestId('skeleton')).toHaveLength(6)
  })

  it('handles missing stats gracefully', () => {
    render(<StatsCards stats={{}} />)
    
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('renders with proper accessibility attributes', () => {
    render(<StatsCards stats={mockStats} />)
    
    const cards = screen.getAllByRole('article')
    expect(cards).toHaveLength(6)
    
    cards.forEach(card => {
      expect(card).toHaveAttribute('tabindex', '0')
    })
  })

  it('renders icons for each stat card', () => {
    render(<StatsCards stats={mockStats} />)
    
    const icons = screen.getAllByTestId('stat-icon')
    expect(icons).toHaveLength(6)
  })

  it('formats adherence rate with one decimal place', () => {
    const stats = { ...mockStats, adherenceRate: 85.67 }
    render(<StatsCards stats={stats} />)
    
    expect(screen.getByText('85.7%')).toBeInTheDocument()
  })

  it('handles zero values correctly', () => {
    const zeroStats = {
      totalMedications: 0,
      dailyDoses: 0,
      missedDoses: 0,
      adherenceRate: 0,
      upcomingAppointments: 0,
      criticalAlerts: 0
    }
    
    render(<StatsCards stats={zeroStats} />)
    
    const zeroTexts = screen.getAllByText('0')
    expect(zeroTexts.length).toBeGreaterThan(0)
  })
}) 