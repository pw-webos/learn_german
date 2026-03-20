import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jfsytdhmogwuevnzoeja.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impmc3l0ZGhtb2d3dWV2bnpvZWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5NTA5OTksImV4cCI6MjA4OTUyNjk5OX0.Emag5Y4AyJjMHv3Of5hqFDbv7B0xJCR0L0K-XW5NwkI'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ── Profiles ──────────────────────────────────────────────────

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

// ── Episodes ──────────────────────────────────────────────────

export async function getEpisodes() {
  const { data } = await supabase.from('episodes').select('*').order('id')
  return data || []
}

// ── Vocabulary ────────────────────────────────────────────────

export async function getVocabulary(episodeId) {
  const { data } = await supabase.from('vocabulary').select('*').eq('episode_id', episodeId)
  return data || []
}

export async function getAllVocabulary() {
  const { data } = await supabase.from('vocabulary').select('*').order('episode_id')
  return data || []
}

export async function getVocabByLevel(level) {
  const { data } = await supabase
    .from('vocabulary')
    .select('*, episodes!inner(level)')
    .eq('episodes.level', level)
    .order('episode_id')
  return data || []
}

// ── Word progress (spaced repetition) ────────────────────────

export async function getWordProgress(profileId) {
  const { data } = await supabase
    .from('word_progress')
    .select('*')
    .eq('profile_id', profileId)
  return data || []
}

export async function saveWordProgress(profileId, vocabId, known) {
  const reviewCount = known ? 0 : 1
  // next review: known = 3 days, unknown = 1 day
  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + (known ? 3 : 1))

  await supabase.from('word_progress').upsert({
    profile_id: profileId,
    vocabulary_id: vocabId,
    known,
    review_count: reviewCount,
    next_review: nextReview.toISOString(),
    last_seen: new Date().toISOString(),
  }, { onConflict: 'profile_id,vocabulary_id' })
}

export async function getDueWords(profileId, limit = 20) {
  const { data } = await supabase
    .from('word_progress')
    .select('*, vocabulary(*)')
    .eq('profile_id', profileId)
    .eq('known', false)
    .lte('next_review', new Date().toISOString())
    .order('next_review')
    .limit(limit)
  return data || []
}

export async function getUnseen(profileId, episodeId, limit = 20) {
  // Words in episode that have no word_progress entry yet
  const { data: allWords } = await supabase
    .from('vocabulary')
    .select('*')
    .eq('episode_id', episodeId)

  const { data: seen } = await supabase
    .from('word_progress')
    .select('vocabulary_id')
    .eq('profile_id', profileId)

  const seenIds = new Set((seen || []).map(s => s.vocabulary_id))
  return (allWords || []).filter(w => !seenIds.has(w.id)).slice(0, limit)
}

// ── Phrases ───────────────────────────────────────────────────

export async function getPhrases() {
  const { data } = await supabase.from('phrases').select('*')
  return data || []
}

// ── Grammar ───────────────────────────────────────────────────

export async function getGrammar(level) {
  const query = supabase.from('grammar').select('*')
  if (level) query.eq('level', level)
  const { data } = await query
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

// ── AI Tutor (via Edge Function) ──────────────────────────────

export async function askTutor(question, lang = 'en') {
  const { data, error } = await supabase.functions.invoke('tutor', {
    body: { question, lang },
  })
  if (error) throw error
  if (data?.error === 'rate_limit') {
    const e = new Error('rate_limit')
    e.status = 429
    throw e
  }
  return data?.answer || ''
}
