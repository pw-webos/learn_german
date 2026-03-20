import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jfsytdhmogwuevnzoeja.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impmc3l0ZGhtb2d3dWV2bnpvZWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5NTA5OTksImV4cCI6MjA4OTUyNjk5OX0.Emag5Y4AyJjMHv3Of5hqFDbv7B0xJCR0L0K-XW5NwkI'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ── Profile ───────────────────────────────────────────────────

export async function getProfile(id) {
  const { data } = await supabase.from('profiles').select('*').eq('id', id).single()
  return data
}

export async function saveProgress(profile) {
  await supabase.from('profiles').upsert({
    id: profile.id,
    name: profile.name,
    xp: profile.xp,
    streak: profile.streak,
    completed_eps: profile.completedEps,
    active_ep: profile.activeEp,
    last_seen: new Date().toISOString().split('T')[0],
  })
}

// ── Content ───────────────────────────────────────────────────

export async function getEpisodes() {
  const { data } = await supabase.from('episodes').select('*').order('id')
  return data || []
}

export async function getVocabulary(episodeId) {
  const { data } = await supabase.from('vocabulary').select('*').eq('episode_id', episodeId)
  return data || []
}

export async function getPhrases() {
  const { data } = await supabase.from('phrases').select('*')
  return data || []
}

export async function getGrammar() {
  const { data } = await supabase.from('grammar').select('*')
  return data || []
}

// ── Mistakes ──────────────────────────────────────────────────

export async function addMistake(profileId, wordDe, wordEn) {
  const { data } = await supabase.from('mistakes').select('*')
    .eq('profile_id', profileId).eq('word_de', wordDe).single()
  if (data) {
    await supabase.from('mistakes')
      .update({ wrong_count: data.wrong_count + 1, last_seen: new Date().toISOString() })
      .eq('id', data.id)
  } else {
    await supabase.from('mistakes').insert({ profile_id: profileId, word_de: wordDe, word_en: wordEn })
  }
}

export async function getMistakes(profileId) {
  const { data } = await supabase.from('mistakes').select('*')
    .eq('profile_id', profileId).order('wrong_count', { ascending: false })
  return data || []
}
