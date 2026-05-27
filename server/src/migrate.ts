import pool from './db.js'

export async function migrate() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    await client.query(`
      CREATE TABLE IF NOT EXISTS workflows (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS workflow_steps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
        step_number INTEGER NOT NULL,
        step_name VARCHAR(100) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
        data JSONB DEFAULT '{}',
        started_at TIMESTAMP WITH TIME ZONE,
        completed_at TIMESTAMP WITH TIME ZONE,
        UNIQUE(workflow_id, step_number)
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS vendors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(200) NOT NULL,
        email VARCHAR(200),
        phone VARCHAR(50),
        category VARCHAR(100) NOT NULL,
        rating DECIMAL(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
        price_tier VARCHAR(20) CHECK (price_tier IN ('budget', 'mid-range', 'premium')),
        location VARCHAR(200),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS vendor_quotes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
        vendor_id UUID REFERENCES vendors(id),
        quote_amount DECIMAL(12,2) NOT NULL,
        is_selected BOOLEAN DEFAULT false,
        submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)

    await client.query(`CREATE INDEX IF NOT EXISTS idx_workflow_steps_workflow ON workflow_steps(workflow_id)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_vendors_category ON vendors(category)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_vendors_rating ON vendors(rating)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_vendor_quotes_workflow ON vendor_quotes(workflow_id)`)

    await client.query('COMMIT')
    console.log('✅ Migration completed successfully')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌ Migration failed:', err)
    throw err
  } finally {
    client.release()
  }
}
