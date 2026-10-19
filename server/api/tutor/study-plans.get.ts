export default defineEventHandler(() => {
  return {
    studyPlans: [
      {
        id: 'plan-phy-ss2',
        title: 'Mastery of Senior Secondary Physics & Electromagnetism',
        subject: 'Physics',
        progress: '68%',
        targetExam: 'WASSCE & JAMB 2026',
        modules: [
          {
            id: 'mod-1',
            title: 'Module 1: Magnetic Flux & Induction Dynamics',
            status: 'Completed',
            masteryScore: '94%'
          },
          {
            id: 'mod-2',
            title: 'Module 2: AC Circuits, Capacitive & Inductive Reactance',
            status: 'In Progress',
            masteryScore: '72%'
          },
          {
            id: 'mod-3',
            title: 'Module 3: Quantum Mechanics, Photoelectric Effect & X-Rays',
            status: 'Upcoming',
            masteryScore: 'Pending'
          }
        ]
      }
    ]
  }
})

