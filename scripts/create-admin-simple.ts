/**
 * Create Super Admin User (Simple version)
 *
 * Usage:
 *   npx tsx scripts/create-admin-simple.ts <email> <password> <fullName>
 *
 * Example:
 *   npx tsx scripts/create-admin-simple.ts admin@example.com password123 "Super Admin"
 */

import { createClient } from '@supabase/supabase-js'

async function createAdmin(email: string, password: string, fullName: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  console.log('🔄 Creating admin user...')

  // Method 1: If using service role key
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('No user returned')

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        role: 'admin',
        is_active: true,
      })
      .eq('id', authData.user.id)

    if (profileError) throw profileError

    console.log('✅ Admin user created via service role!')
    console.log(`📧 Email: ${email}`)
    console.log(`👤 Name: ${fullName}`)
    console.log(`🔑 Role: admin`)
    return
  }

  // Method 2: Sign up and update (if no service role key)
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (signUpError) throw signUpError
  if (!signUpData.user) throw new Error('No user returned')

  console.log('✅ User signed up:', signUpData.user.id)
  console.log('⚠️  Please verify email and run this SQL in Supabase:')
  console.log(`\nUPDATE profiles SET role = 'admin', is_active = true WHERE email = '${email}';\n`)
}

// Parse command line arguments
const args = process.argv.slice(2)

if (args.length < 3) {
  console.error('Usage: npx tsx scripts/create-admin-simple.ts <email> <password> <fullName>')
  console.error('Example: npx tsx scripts/create-admin-simple.ts admin@example.com password123 "Super Admin"')
  process.exit(1)
}

const [email, password, fullName] = args

if (password.length < 6) {
  console.error('❌ Password must be at least 6 characters')
  process.exit(1)
}

createAdmin(email, password, fullName)
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error.message)
    process.exit(1)
  })
