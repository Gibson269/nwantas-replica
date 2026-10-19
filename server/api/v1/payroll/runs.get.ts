export default defineEventHandler(() => {
  return {
    runs: [
      {
        id: 'pr-2026-09',
        month: 'September 2026',
        totalStaff: 86,
        grossSalary: 18450000,
        deductions: 2150000, // Pension + PAYE tax
        netDisbursement: 16300000,
        status: 'Disbursed',
        disbursedDate: '2026-09-28',
        approvedBy: 'Chief Anthony Balogun (Owner)'
      },
      {
        id: 'pr-2026-10',
        month: 'October 2026',
        totalStaff: 86,
        grossSalary: 18450000,
        deductions: 2150000,
        netDisbursement: 16300000,
        status: 'Ready for Review',
        disbursedDate: null,
        approvedBy: null
      }
    ]
  }
})

