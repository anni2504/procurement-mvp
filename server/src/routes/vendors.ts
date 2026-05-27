import { Router } from 'express'
import Vendor from '../models/Vendor.js'

const router = Router()

// List vendors with filtering and pagination
router.get('/', async (req, res) => {
  const { category, price_tier, min_rating, search, page = '1', limit = '20' } = req.query
  const pageNum = Math.max(1, parseInt(page as string))
  const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)))
  const skip = (pageNum - 1) * limitNum

  try {
    const filter: Record<string, any> = { isActive: true }

    if (category) filter.category = category
    if (price_tier) filter.priceTier = price_tier
    if (min_rating) filter.rating = { $gte: parseFloat(min_rating as string) }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ]
    }

    const [vendors, total] = await Promise.all([
      Vendor.find(filter).sort({ rating: -1, name: 1 }).skip(skip).limit(limitNum).lean(),
      Vendor.countDocuments(filter),
    ])

    res.json({
      vendors,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vendors' })
  }
})

// Get vendor categories
router.get('/categories', async (_req, res) => {
  try {
    const result = await Vendor.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { category: '$_id', count: 1, _id: 0 } },
    ])
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

// Add new vendor
router.post('/', async (req, res) => {
  const { name, email, phone, category, rating, price_tier, location } = req.body
  try {
    const vendor = await Vendor.create({
      name, email,
      phone: phone || '',
      category,
      rating: rating || 0,
      priceTier: price_tier || 'mid-range',
      location: location || '',
    })
    res.json(vendor)
  } catch (err) {
    res.status(500).json({ error: 'Failed to add vendor' })
  }
})

// Get single vendor
router.get('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id).lean()
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' })
    res.json(vendor)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vendor' })
  }
})

export default router
