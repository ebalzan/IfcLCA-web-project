// import { NextResponse } from 'next/server'
// import { Types } from 'mongoose'
// import ILCAIndicators from '@/interfaces/materials/ILCAIndicators'
// import { AuthenticatedRequest, getUserId, withAuthAndDBParams } from '@/lib/api-middleware'
// import { validatePathParams } from '@/lib/validation-middleware'
// import { Element, Project } from '@/models'
// import { projectIdSchema } from '@/schemas/api'

// async function getProjectEmissions(
//   request: AuthenticatedRequest,
//   context: { params: Promise<Record<string, string>> }
// ) {
//   const userId = getUserId(request)

//   const validatedParams = await validatePathParams(projectIdSchema, context.params)
//   const projectId = new Types.ObjectId(validatedParams.id)

//   const project = await Project.findOne({ _id: projectId, userId })
//   if (!project) {
//     return NextResponse.json({ error: 'Project not found' }, { status: 404 })
//   }

//   // Calculate totals using MongoDB aggregation
//   const [totals] = await Element.aggregate<ILCAIndicators>([
//     { $match: { projectId, isArchived: false } },
//     { $unwind: '$materials' },
//     {
//       $group: {
//         _id: '$projectId',
//         gwp: { $sum: { $ifNull: ['$materials.indicators.gwp', 0] } },
//         ubp: { $sum: { $ifNull: ['$materials.indicators.ubp', 0] } },
//         penre: { $sum: { $ifNull: ['$materials.indicators.penre', 0] } },
//       },
//     },
//   ]).exec()

//   // Update project with calculated totals
//   await Project.updateOne(
//     { _id: projectId },
//     {
//       $set: {
//         emissions: {
//           gwp: totals?.gwp || 0,
//           ubp: totals?.ubp || 0,
//           penre: totals?.penre || 0,
//           lastCalculated: new Date(),
//         },
//       },
//     }
//   )

//   return NextResponse.json({
//     success: true,
//     totals: {
//       totalGWP: totals?.gwp || 0,
//       totalUBP: totals?.ubp || 0,
//       totalPENRE: totals?.penre || 0,
//     },
//   })
// }

// export const POST = withAuthAndDBParams(getProjectEmissions)
