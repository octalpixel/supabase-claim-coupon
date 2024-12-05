import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

// Convert __dirname for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)



// Initialize Supabase client
const supabaseUrl = "https://mowgzyrspfshtgzbhshx.supabase.co"
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vd2d6eXJzcGZzaHRnemJoc2h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0MDYyMzQsImV4cCI6MjA0ODk4MjIzNH0.BY5008h0OU-TqLB_q3ndhnAQjegap4dsHTWbeVAg8Yw"

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function importCoupons() {
  try {
    // Read the CSV file
    const csvPath = path.join(__dirname, 'coupon.csv')
    const fileContent = await fs.readFile(csvPath, 'utf-8')
    
    // Parse the CSV content
    const lines = fileContent.split('\n')
    const coupons = lines
      .slice(1) // Skip the header line
      .filter(line => line.trim()) // Remove empty lines
      .map(code => ({
        code: code.trim(),
        claimed: false,
      }))

    // Insert coupons in batches of 100
    const batchSize = 100
    for (let i = 0; i < coupons.length; i += batchSize) {
      const batch = coupons.slice(i, i + batchSize)
      const { data, error } = await supabase
        .from('coupons')
        .insert(batch)

      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error)
      } else {
        console.log(`Successfully inserted batch ${i / batchSize + 1}`)
      }
    }

    console.log('Import completed!')
  } catch (error) {
    console.error('Error importing coupons:', error)
  }
}

importCoupons() 