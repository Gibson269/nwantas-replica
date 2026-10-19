import { db } from '~~/server/utils/db'

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug')
  const school = db.schools.find(s => s.slug === slug || s.id === slug) || db.schools[0]
  if (!school) {
    throw createError({ statusCode: 404, statusMessage: 'School not found' })
  }

  return {
    data: {
      id: school.id,
      name: school.name,
      slug: school.slug,
      motto: school.motto,
      currency: school.currency,
      symbol: school.symbol,
      address: school.address,
      country: school.country,
      email: school.email,
      phone: school.phone,
      planId: school.planId
    }
  }
})
