import type { CollectionConfig } from 'payload'

export const Dealers: CollectionConfig = {
  slug: 'dealers',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'area', 'materialsAccepted', 'isActive'],
    description: 'Registered scrap dealers that can be assigned to listings',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Dealer Name / Business Name',
    },
    {
      name: 'phone',
      type: 'text',
      required: true,
      label: 'Phone Number',
      admin: {
        description: 'Primary contact number for the dealer',
      },
    },
    {
      name: 'altPhone',
      type: 'text',
      label: 'Alternate Phone',
    },
    {
      name: 'address',
      type: 'text',
      required: true,
      label: 'Business Address',
    },
    {
      name: 'area',
      type: 'text',
      label: 'Service Area / Thana',
      admin: {
        description: 'Primary service area (e.g., Mirpur, Dhaka)',
      },
    },
    {
      name: 'materialsAccepted',
      type: 'select',
      hasMany: true,
      label: 'Materials Accepted',
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
      name: 'isActive',
      type: 'checkbox',
      label: 'Active',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Uncheck to hide from dealer assignment dropdown',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Internal Notes',
      admin: {
        description: 'Any internal notes about this dealer',
      },
    },
  ],
  access: {
    // Only logged-in users can read (admins see full list, users see minimally)
    read: ({ req }) => !!req.user,
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
}
