'use client'

import { useTranslations } from 'next-intl'
import { useActionState, useEffect, useRef, useState } from 'react'
import { useRouter } from '@/lib/navigation'
import { createListingAction, type ListingResult } from '@/app/actions/listings'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'

const SCRAP_TYPES = [
  { value: 'metal', label: 'Metal (ধাতু)' },
  { value: 'plastic', label: 'Plastic (প্লাস্টিক)' },
  { value: 'electronics', label: 'Electronics (ইলেকট্রনিক্স)' },
  { value: 'paper', label: 'Paper (কাগজ)' },
  { value: 'glass', label: 'Glass (কাঁচ)' },
  { value: 'other', label: 'Other (অন্যান্য)' },
]

type UploadedImage = { id: string; url: string; name: string }

export default function ScrapListingForm() {
  const t = useTranslations('listing')
  const router = useRouter()

  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Bind image IDs to the server action
  const boundAction = createListingAction.bind(null, uploadedImages.map((img) => img.id))

  const [state, formAction, isPending] = useActionState<ListingResult | null, FormData>(
    boundAction,
    null,
  )

  // Redirect on success
  useEffect(() => {
    if (state?.success) {
      router.push('/dashboard')
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
        if (file.size > 5_000_000) {
          setUploadError(`${file.name} exceeds 5 MB limit`)
          continue
        }

        const formData = new FormData()
        formData.append('file', file)
        formData.append('alt', file.name)

        const res = await fetch('/api/media', {
            method: 'POST',
            body: formData,
            credentials: 'include',
          })

        if (!res.ok) {
          setUploadError(`Failed to upload ${file.name}`)
          continue
        }

        const data = await res.json()
        const mediaDoc = data.doc ?? data
        setUploadedImages((prev) => [
          ...prev,
          {
            id: String(mediaDoc.id),
            url: mediaDoc.url ?? URL.createObjectURL(file),
            name: file.name,
          },
        ])
      }
    } catch {
      setUploadError('Image upload failed. Please try again.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeImage = (id: string) =>
    setUploadedImages((prev) => prev.filter((img) => img.id !== id))

  const fieldErrors = !state?.success && state?.fieldErrors ? state.fieldErrors : {}

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
      {!state?.success && state?.error && !state.fieldErrors && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-6">
        {/* Title */}
        <Input
          name="title"
          label={t('title')}
          placeholder={t('titlePlaceholder')}
          required
          error={fieldErrors.title?.[0]}
        />

        {/* Type + Weight row */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Select
            name="type"
            label={t('type')}
            placeholder={t('typePlaceholder')}
            required
            options={SCRAP_TYPES}
            error={fieldErrors.type?.[0]}
            defaultValue=""
          />
          <Input
            name="weight"
            type="number"
            label={t('weight')}
            placeholder={t('weightPlaceholder')}
            min="0.1"
            step="0.1"
            required
            error={fieldErrors.weight?.[0]}
          />
        </div>

        {/* Description */}
        <Textarea
          name="description"
          label={t('description')}
          placeholder={t('descriptionPlaceholder')}
          rows={4}
          error={fieldErrors.description?.[0]}
        />

        {/* Location */}
        <Input
          name="location"
          label={t('location')}
          placeholder={t('locationPlaceholder')}
          required
          error={fieldErrors.location?.[0]}
        />

        {/* Phone – highlighted as most important field */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
          <Input
            name="phone"
            type="tel"
            label={`📞 ${t('phone')}`}
            placeholder={t('phonePlaceholder')}
            required
            helpText={t('phoneHelp')}
            error={fieldErrors.phone?.[0]}
            className="bg-white"
          />
        </div>

        {/* Images */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            {t('images')}{' '}
            <span className="text-gray-400 font-normal">({uploadedImages.length}/5)</span>
          </label>

          {/* Uploaded previews */}
          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {uploadedImages.map((img) => (
                <div key={img.id} className="relative group rounded-lg overflow-hidden aspect-square border border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.name} className="object-cover w-full h-full" />
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-lg"
                    aria-label={`Remove ${img.name}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload button */}
          {uploadedImages.length < 5 && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="image-upload"
                aria-label="Upload images"
              />
              <label
                htmlFor="image-upload"
                className={`flex items-center justify-center gap-2 h-24 border-2 border-dashed rounded-xl cursor-pointer transition-colors text-sm font-medium
                  ${isUploading ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed' : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50 text-gray-500 hover:text-primary-600'}`}
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
                  <>📷 {t('images')}</>
                )}
              </label>
            </div>
          )}

          {uploadError && (
            <p className="text-xs text-red-600" role="alert">
              {uploadError}
            </p>
          )}
          <p className="text-xs text-gray-400">{t('imagesHelp')}</p>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          className="w-full"
          isLoading={isPending}
          disabled={isUploading}
        >
          {isPending ? t('submitting') : t('submitListing')}
        </Button>
      </form>
    </div>
  )
}
