export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')

  // Return full capabilities for admin/master, or specific permissions for roles
  if (id?.includes('master') || id?.includes('owner') || id?.includes('admin')) {
    return {
      data: ['all', 'all_school', 'manage_classes', 'manage_students', 'manage_finances', 'manage_security']
    }
  }

  if (id?.includes('teach')) {
    return {
      data: ['create_lesson_notes', 'mark_attendance', 'manage_assessments', 'enter_grades']
    }
  }

  if (id?.includes('stud')) {
    return {
      data: ['take_cbt', 'view_timetable', 'use_ai_tutor', 'view_report_card', 'request_exeat']
    }
  }

  return {
    data: ['view_records']
  }
})
