import { useState, useEffect } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
  AreaChart, Area,
} from 'recharts'
import * as passationService from '../services/passationService'

const COLORS = {
  PLANIFIEE: '#0891b2',
  EN_COURS: '#2563eb',
  TERMINEE: '#16a34a',
  ANNULEE: '#dc2626',
}

const PIE_COLORS = ['#0891b2', '#2563eb', '#16a34a', '#dc2626']

// Mock: alertes per week (last 8 weeks)
const generateAlertMockData = () => {
  const weeks = []
  for (let i = 7; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i * 7)
    weeks.push({
      semaine: `S${8 - i}`,
      critique: Math.floor(Math.random() * 5),
      warning: Math.floor(Math.random() * 8),
      info: Math.floor(Math.random() * 10),
    })
  }
  return weeks
}

// Mock: completion % over months
const generateCompletionData = () => {
  const months = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun']
  return months.map((m, i) => ({
    mois: m,
    pourcentage: Math.min(100, 20 + i * 12 + Math.floor(Math.random() * 10)),
  }))
}

export default function AnalyticsPage() {
  const [passations, setPassations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    passationService.getAll()
      .then(res => setPassations(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Erreur lors du chargement des donnees'))
      .finally(() => setLoading(false))
  }, [])

  // Data by statut
  const statutData = ['PLANIFIEE', 'EN_COURS', 'TERMINEE', 'ANNULEE'].map(s => ({
    name: s,
    value: passations.filter(p => p.statut === s).length,
  })).filter(d => d.value > 0)

  // Data by departement
  const deptMap = {}
  passations.forEach(p => {
    const dept = p.departement || p.partant?.departement || 'Inconnu'
    deptMap[dept] = (deptMap[dept] || 0) + 1
  })
  const deptData = Object.entries(deptMap)
    .map(([name, count]) => ({ departement: name, passations: count }))
    .sort((a, b) => b.passations - a.passations)
    .slice(0, 8)

  const completionData = generateCompletionData()
  const alerteData = generateAlertMockData()

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner spinner-lg" />
        <span>Chargement...</span>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1>Analytiques</h1>
        <p>Tableau de bord analytique des passations</p>
      </div>

      {error && <div className="error-container">{error}</div>}

      <div className="grid-2" style={{ gap: '20px' }}>
        {/* PieChart: statuts */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Repartition par statut</div>
              <div className="card-subtitle">{passations.length} passations au total</div>
            </div>
          </div>
          {statutData.length === 0 ? (
            <div className="loading-container" style={{ padding: '40px' }}>
              <span className="text-muted">Aucune donnee</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {statutData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[entry.name] || PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* BarChart: departements */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Passations par departement</div>
              <div className="card-subtitle">Top 8 departements</div>
            </div>
          </div>
          {deptData.length === 0 ? (
            <div className="loading-container" style={{ padding: '40px' }}>
              <span className="text-muted">Aucune donnee</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={deptData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="departement"
                  tick={{ fontSize: 11 }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="passations" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* LineChart: completion over time */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Evolution du taux de completion</div>
              <div className="card-subtitle">Moyenne mensuelle (donnees indicatives)</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={completionData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} tickFormatter={v => `${v}%`} />
              <Tooltip formatter={(v) => [`${v}%`, 'Completion']} />
              <Line
                type="monotone"
                dataKey="pourcentage"
                stroke="var(--primary)"
                strokeWidth={2.5}
                dot={{ fill: 'var(--primary)', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* AreaChart: alertes per week */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Alertes par semaine</div>
              <div className="card-subtitle">8 dernieres semaines (donnees indicatives)</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={alerteData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="semaine" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="critique"
                stackId="1"
                stroke="var(--danger)"
                fill="#fecaca"
                name="Critique"
              />
              <Area
                type="monotone"
                dataKey="warning"
                stackId="1"
                stroke="var(--warning)"
                fill="#fde68a"
                name="Warning"
              />
              <Area
                type="monotone"
                dataKey="info"
                stackId="1"
                stroke="var(--info)"
                fill="#bae6fd"
                name="Info"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
