import React, { createContext, useContext, useState, ReactNode } from 'react'
import { submissionsData as initialData } from '@/lib/data'

export interface Submission {
  id: string
  date: string
  title: string
  user: string
  axis: string
  status: string
  points: number | string
}

const mockAdminSubmissions: Submission[] = [
  {
    id: 'SUB-101',
    user: 'Ana Souza',
    title: 'Titulação (Doutorado)',
    date: '12/03/2026',
    status: 'Em Análise',
    axis: 'Eixo I',
    points: '-',
  },
  {
    id: 'SUB-102',
    user: 'Carlos Silva',
    title: 'Artigo Científico',
    date: '11/03/2026',
    status: 'Em Análise',
    axis: 'Eixo I',
    points: '-',
  },
  {
    id: 'SUB-104',
    user: 'Camila Barros',
    title: 'Desenvolver projetos viários',
    date: '09/03/2026',
    status: 'Em Análise',
    axis: 'Eixo II',
    points: '-',
  },
]

interface SubmissionsState {
  submissions: Submission[]
  addSubmission: (sub: { title: string; axis: string }) => void
}

const SubmissionsContext = createContext<SubmissionsState | undefined>(undefined)

export const SubmissionsProvider = ({ children }: { children: ReactNode }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([
    ...initialData.map((s) => ({ ...s, user: 'Você' })),
    ...mockAdminSubmissions,
  ])

  const addSubmission = (sub: { title: string; axis: string }) => {
    const newSub: Submission = {
      ...sub,
      id: `SUB-${String(submissions.length + 1).padStart(3, '0')}`,
      user: 'Você',
      date: new Date().toLocaleDateString('pt-BR'),
      status: 'Em Análise',
      points: '-',
    }
    setSubmissions([newSub, ...submissions])
  }

  return (
    <SubmissionsContext.Provider value={{ submissions, addSubmission }}>
      {children}
    </SubmissionsContext.Provider>
  )
}

export default function useSubmissionsStore() {
  const context = useContext(SubmissionsContext)
  if (!context) {
    throw new Error('useSubmissionsStore must be used within a SubmissionsProvider')
  }
  return context
}
