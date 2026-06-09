'use client'

import { useTranslations } from 'next-intl'
import { useActionState, useEffect, useRef, useState } from 'react'
import { useRouter } from '@/lib/navigation'
import { createListingAction, type ListingResult } from '@/app/actions/listings'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import { DIVISIONS, getDistrictsByDivision } from '@/lib/regions'

const CATEGORIES = [
  { value: 'electronics', label: 'Electronics (ইলেকট্রনিক্স)' },
  { value: 'furniture', label: 'Furniture (আসবাবপত্র)' },
  { value: 'fashion', label: 'Fashion (পোশাক)' },
  { value: 'books', label: 'Books (বই)' },
  { value: 'sports', label: 'Sports (স্পোর্টস)' },
  { value: 'home_garden', label: 'Home & Garden (ঘর ও বাগান)' },
  { value: 'others', label: 'Others (অন্যান্য)' },
]

const CONDITIONS = [
  { value: 'brand_new', label: 'Brand New (একদম নতুন)' },
  { value: 'like_new', label: 'Like New (নতুনের মতো)' },
  { value: 'good', label: 'Good (ভালো)' },
  { value: 'fair', label: 'Fair (মোটামুটি)' },
  { value: 'poor', label: 'Poor (খারাপ)' },
]

type UploadedImage = { url: string; name: string }

export default function ListingForm() {
  const t = useTranslations('listing')
  const router = useRouter()

  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [negotiable, setNegotiable] = useState(false)
  const [selectedDivision, setSelectedDivision] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const boundAction = createListingAction.bind(null, uploadedImages.map((img) => img.url))
  const [state, formAction, isPending] = useActionState<ListingResult | null, FormData>(
    boundAction,
    null,
  )

  useEffect(() => {
    if (state?.success) {
      router.push('/my-listings')
    }
  }, [state, router])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    if (uploadedImages.length + files.length > 5) {
      setUploadError('Maximum 5 images allowed')
      return
    }
    setUploadError(null)
    setIsUploading(true)
    try {
      for (const file of files) {
        if (file.size > 5_000_000) { setUploadError(`${file.name} exceeds 5 MB`); continue }
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/media', { method: 'POST', body: fd, credentials: 'include' })
        if (!res.ok) { setUploadError(`Failed to upload ${file.name}`); continue }
        const data = await res.json()
        setUploadedImages((prev) => [...prev, { url: data.url, name: file.name }])
      }
    } catch {
      setUploadError('Image upload failed. Please try again.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeImage = (url: string) =>
    setUploadedImages((prev) => prev.filter((img) => img.url !== url))

  const districtOptions = selectedDivision
    ? getDistrictsByDivision(selectedDivision).map((d) => ({ value: d.value, label: d.label }))
    : []

  const fieldErrors = !state?.success && state?.fieldErrors ? state.fieldErrors : {}

  return (
    <div className="bg-white rounded-[8px] shadow-card border border-border p-6 sm:p-8">
      {!state?.success && state?.error && !state.fieldErrors && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-[8px] p-4 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-6">
        {/* Title */}
        <Input
          name="title"
          label={t('titleLabel')}
          placeholder={t('titlePlaceholder')}
          required
          error={fieldErrors.title?.[0]}
        />

        {/* Category + Condition */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Select
            name="category"
            label={t('categoryLabel')}
            placeholder={t('categoryPlaceholder')}
            required
            options={CATEGORIES}
            error={fieldErrors.category?.[0]}
            defaultValue=""
          />
          <Select
            name="condition"
            label={t('conditionLabel')}
            placeholder={t('conditionPlaceholder')}
            required
            options={CONDITIONS}
            error={fieldErrors.condition?.[0]}
            defaultValue=""
          />
        </div>

        {/* Price + Negotiable */}
        <div className="grid sm:grid-cols-2 gap-4 items-end">
          <Input
            name="price"
            type="number"
            label={t('priceLabel')}
            placeholder="0"
            min="1"
            required
            error={fieldErrors.price?.[0]}
          />
          <div className="flex items-center gap-3 pb-2">
            <button
              type="button"
              role="switch"
              aria-checked={negotiable}
              onClick={() => setNegotiable(!negotiable)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 ${
                negotiable ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  negotiable ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <input type="hidden" name="negotiable" value={negotiable ? 'true' : 'false'} />
            <label className="text-sm font-medium text-gray-700">{t('negotiableLabel')}</label>
          </div>
        </div>

        {/* Description */}
        <Textarea
          name="description"
          label={t('descriptionLabel')}
          placeholder={t('descriptionPlaceholder')}
          rows={4}
          maxLength={500}
          error={fieldErrors.description?.[0]}
        />

        {/* Division + District */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Select
            name="division"
            label={t('divisionLabel')}
            placeholder={t('divisionPlaceholder')}
            required
            options={DIVISIONS.map((d) => ({ value: d.value, label: d.label }))}
            error={fieldErrors.division?.[0]}
            defaultValue=""
            onChange={(e) => {
              setSelectedDivision(e.target.value)
            }}
          />
          <Select
            name="district"
            label={t('districtLabel')}
            placeholder={selectedDivision ? t('districtPlaceholder') : t('selectDivisionFirst')}
            required
            options={districtOptions}
            error={fieldErrors.district?.[0]}
            defaultValue=""
            disabled={!selectedDivision}
          />
        </div>

        {/* Photos */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            {t('imagesLabel')}{' '}
            <span className="text-gray-400 font-normal">({uploadedImages.length}/5)</span>
          </label>

          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {uploadedImages.map((img) => (
                <div
                  key={img.url}
                  className="relative group rounded-[8px] overflow-hidden aspect-square border border-border"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.name} className="object-cover w-full h-full" />
                  <button
                    type="button"
                    onClick={() => removeImage(img.url)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-lg"
                    aria-label={`Remove ${img.name}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {uploadedImages.length < 5 && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className={`flex items-center justify-center gap-2 h-24 border-2 border-dashed rounded-[8px] cursor-pointer transition-colors text-sm font-medium ${
                  isUploading
                    ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 hover:border-primary-600 hover:bg-blue-50 text-gray-500 hover:text-primary-600'
                }`}
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Uploading…
                  </>
                ) : (
                  <>📷 {t('imagesLabel')}</>
                )}
              </label>
            </>
          )}

          {uploadError && <p className="text-xs text-red-600" role="alert">{uploadError}</p>}
          <p className="text-xs text-gray-400">{t('imagesHelp')}</p>
        </div>

        {/* Submit */}
        <Button type="submit" size="lg" className="w-full" isLoading={isPending} disabled={isUploading}>
          {isPending ? t('submitting') : t('submitListing')}
        </Button>
      </form>
    </div>
  )
}
