import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jfsytdhmogwuevnzoeja.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impmc3l0ZGhtb2d3dWV2bnpvZWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5NTA5OTksImV4cCI6MjA4OTUyNjk5OX0.Emag5Y4AyJjMHv3Of5hqFDbv7B0xJCR0L0K-XW5NwkI'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
