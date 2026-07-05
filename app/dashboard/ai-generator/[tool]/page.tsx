export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { getGeneratorTool } from '@/lib/generators'
import { ToolClient } from './tool-client'

export default function GeneratorToolPage({
  params,
  searchParams,
}: {
  params: { tool: string }
  searchParams: { project?: string }
}) {
  const tool = getGeneratorTool(params.tool)
  if (!tool) notFound()
  return <ToolClient toolId={tool!.id} projectId={searchParams?.project ?? null} />
}
