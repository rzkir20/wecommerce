import { supabaseAdmin } from '../lib/supabase.js'

type AuditLogInput = {
  action: string
  description?: string
  targetTable?: string
  targetId?: string
  userId?: string
}

export async function writeAuditLog(input: AuditLogInput): Promise<void> {
  const { error } = await supabaseAdmin.from('logs').insert({
    action: input.action.slice(0, 100),
    description: input.description?.slice(0, 1000) ?? null,
    target_table: input.targetTable?.slice(0, 100) ?? null,
    target_id: input.targetId?.slice(0, 191) ?? null,
    user_id: input.userId ?? null,
  })

  if (error) {
    console.error('[writeAuditLog]', error)
  }
}
