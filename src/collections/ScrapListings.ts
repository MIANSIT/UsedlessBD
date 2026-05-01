import type { CollectionConfig } from 'payload'

export const ScrapListings: CollectionConfig = {
  slug: 'scrap-listings',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'weight', 'status', 'user', 'assignedDealer', 'createdAt'],
    description: 'All scrap listing submissions from users',
  },
  fields: [
    // ── Core Info ───────────────────────────────────────────────
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Listing Title',
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Submitted By',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },

    // ── Scrap Details ────────────────────────────────────────────
    {
      name: 'type',
      type: 'select',
      required: true,
      label: 'Scrap Type',
      options: [
        { label: 'Metal (ধাতু)', value: 'metal' },
        { label: 'Plastic (প্লাস্টিক)', value: 'plastic' },
        { label: 'Electronics (ইলেকট্রনিক্স)', value: 'electronics' },
        { label: 'Paper (কাগজ)', value: 'paper' },
        { label: 'Glass (কাঁচ)', value: 'glass' },
        { label: 'Other (অন্যান্য)', value: 'other' },
      ],
    },
    {
      name: 'weight',
      type: 'number',
      required: true,
      label: 'Estimated Weight (kg)',
      min: 0.1,
      admin: {
        description: 'Approximate weight in kilograms',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: {
        description: 'Condition, defects, or any additional notes about the scrap',
      },
    },

    // ── Contact & Location ────────────────────────────────────────
    {
      name: 'phone',
      type: 'text',
      required: true,
      label: 'Contact Phone Number',
      admin: {
        description: '★ Primary contact – customers are reached via phone in Bangladesh',
      },
    },
    {
      name: 'location',
      type: 'text',
      required: true,
      label: 'Pickup Location',
      admin: {
        description: 'Area, thana, district (e.g. Gulshan, Dhaka)',
      },
    },

    // ── Images ──────────────────────────────────────────────────
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      label: 'Photos of Scrap',
    },

    // ── Status & Assignment (admin-managed) ───────────────────────
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      required: true,
      label: 'Status',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Connected', value: 'connected' },
        { label: 'Completed', value: 'completed' },
        { label: 'Rejected', value: 'rejected' },
      ],
      admin: {
        position: 'sidebar',
      },
      access: {
        update: ({ req }) => req.user?.role === 'admin',
      },
    },
    {
      name: 'assignedDealer',
      type: 'relationship',
      relationTo: 'dealers',
      label: 'Assigned Dealer',
      admin: {
        position: 'sidebar',
        description: 'Dealer assigned by admin',
      },
      access: {
        update: ({ req }) => req.user?.role === 'admin',
      },
    },
    {
      name: 'adminNotes',
      type: 'textarea',
      label: 'Admin Notes (Internal)',
      admin: {
        position: 'sidebar',
        description: 'Internal notes – not visible to the user',
      },
      access: {
        read: ({ req }) => req.user?.role === 'admin',
        update: ({ req }) => req.user?.role === 'admin',
      },
    },
  ],
  access: {
    create: ({ req }) => !!req.user,
    read: ({ req }) => {
      if (!req.user) return false
      if (req.user.role === 'admin') return true
      // Users can only read their own listings
      return { user: { equals: req.user.id } }
    },
    // Only admin can update (status, dealer, etc.)
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  hooks: {
    beforeChange: [
      ({ data, req, operation }) => {
        // Automatically set `user` to the currently logged-in user on create
        if (operation === 'create' && req.user) {
          data.user = req.user.id
        }
        return data
      },
    ],
  },
}
