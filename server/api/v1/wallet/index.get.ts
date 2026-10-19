import { db } from '~~/server/utils/db'

export default defineEventHandler(() => {
  const school = db.schools[0]

  return {
    wallet: {
      balance: school.walletBalance,
      currency: school.currency,
      symbol: school.symbol,
      bankAccount: {
        bankName: 'Zenith Bank PLC',
        accountNumber: '1019283746',
        accountName: 'Apex International Academy Ltd'
      }
    },
    feeSchedules: [
      { id: 'fee-01', title: 'Senior Secondary Tuition (Term 2)', amount: 350000, category: 'Mandatory' },
      { id: 'fee-02', title: 'STEM & Robotics Lab Levy', amount: 45000, category: 'Mandatory' },
      { id: 'fee-03', title: 'Full Boarding & Hostel Maintenance', amount: 280000, category: 'Optional (Boarders)' },
      { id: 'fee-04', title: 'PTA Development Levy', amount: 15000, category: 'Mandatory' }
    ],
    recentTransactions: [
      { id: 'tx-001', studentName: 'Chidi Okonkwo', type: 'Tuition Fee Payment', amount: 395000, date: '2026-10-18', channel: 'Paystack Direct Debit', status: 'Success' },
      { id: 'tx-002', studentName: 'Adaeze Okonkwo', type: 'Tuition Instalment 1', amount: 200000, date: '2026-10-17', channel: 'Hosted Payment Link', status: 'Success' },
      { id: 'tx-003', studentName: 'Amina Bello', type: 'Tuition & Boarding Fee', amount: 675000, date: '2026-10-15', channel: 'Flutterwave Card', status: 'Success' }
    ]
  }
})

