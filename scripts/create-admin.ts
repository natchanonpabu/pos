/**
 * Create Super Admin User
 *
 * Usage:
 *   npx tsx scripts/create-admin.ts
 *
 * Environment variables required:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   SUPABASE_SERVICE_ROLE_KEY (optional, for direct user creation)
 */

import { createClient } from '@supabase/supabase-js'
import * as readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve)
  })
}

async function main() {
  console.log('🚀 Create Super Admin User\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables')
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  // Get admin details
  const email = await question('Email: ')
  const password = await question('Password (min 6 characters): ')
  const fullName = await question('Full Name: ')

  if (!email || !password || password.length < 6) {
    console.error('❌ Invalid input')
    rl.close()
    process.exit(1)
  }

  console.log('\n🔄 Creating admin user...')

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
    },
  })

  if (authError) {
    console.error('❌ Error creating auth user:', authError.message)
    rl.close()
    process.exit(1)
  }

  if (!authData.user) {
    console.error('❌ No user returned')
    rl.close()
    process.exit(1)
  }

  console.log('✅ Auth user created:', authData.user.id)

  // Update profile to admin
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      role: 'admin',
      is_active: true,
    })
    .eq('id', authData.user.id)

  if (profileError) {
    console.error('❌ Error updating profile:', profileError.message)
    rl.close()
    process.exit(1)
  }

  console.log('✅ Profile updated to admin')
  console.log('\n🎉 Super Admin user created successfully!')
  console.log(`\n📧 Email: ${email}`)
  console.log(`👤 Name: ${fullName}`)
  console.log(`🔑 Role: admin`)
  console.log('\n✨ You can now login at /login')

  rl.close()
}

main().catch((error) => {
  console.error('❌ Error:', error.message)
  rl.close()
  process.exit(1)
})
