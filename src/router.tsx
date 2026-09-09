import { createBrowserRouter, Navigate } from 'react-router'
import { StaffLogin } from '@/components/StaffLogin/StaffLogin'
import { InviteRedeem } from '@/components/InviteRedeem/InviteRedeem'
import { StaffDashboard } from '@/components/StaffDashboard/StaffDashboard'
import { ProjectDetail } from '@/components/ProjectDetail/ProjectDetail'
import { AnswerReview } from '@/components/AnswerReview/AnswerReview'
import { AgreedPlan } from '@/components/AgreedPlan/AgreedPlan'
import { QuestionBank } from '@/components/QuestionBank/QuestionBank'
import { QuestionImport } from '@/components/QuestionImport/QuestionImport'
import { ClientAnswers } from '@/components/ClientAnswers/ClientAnswers'
import { RequireStaffAuth } from '@/components/RequireStaffAuth/RequireStaffAuth'
import { RequireClientAuth } from '@/components/RequireClientAuth/RequireClientAuth'
import { StaffLayout } from '@/components/StaffLayout/StaffLayout'

export const router = createBrowserRouter([
  { path: '/staff/login', element: <StaffLogin /> },
  { path: '/invite/:token', element: <InviteRedeem /> },
  { path: '/projects/:id/agreed-plan', element: <AgreedPlan /> },
  {
    path: '/client',
    element: (
      <RequireClientAuth>
        <ClientAnswers />
      </RequireClientAuth>
    ),
  },
  {
    path: '/staff',
    element: (
      <RequireStaffAuth>
        <StaffLayout />
      </RequireStaffAuth>
    ),
    children: [
      { index: true, element: <StaffDashboard /> },
      { path: 'projects/:id', element: <ProjectDetail /> },
      { path: 'projects/:id/review', element: <AnswerReview /> },
      { path: 'questions', element: <QuestionBank /> },
      { path: 'questions/import', element: <QuestionImport /> },
    ],
  },
  { path: '*', element: <Navigate to="/staff" replace /> },
])
