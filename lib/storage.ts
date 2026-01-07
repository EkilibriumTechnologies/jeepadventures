import { supabaseClient } from "./supabase"

/**
 * Upload a license image to Supabase Storage
 * @param file - The image file to upload
 * @param userId - Optional user ID for organizing files
 * @returns Public URL of the uploaded image
 */
export async function uploadLicenseImage(
  file: File,
  userId?: string
): Promise<{ url: string; path: string }> {
  const fileExt = file.name.split(".").pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = userId ? `${userId}/${fileName}` : fileName

  const { data, error } = await supabaseClient.storage
    .from("licenses")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

  if (error) {
    throw new Error(`Failed to upload license image: ${error.message}`)
  }

  const { data: urlData } = supabaseClient.storage
    .from("licenses")
    .getPublicUrl(filePath)

  return {
    url: urlData.publicUrl,
    path: filePath,
  }
}

/**
 * Delete a license image from Supabase Storage
 * @param filePath - The path of the file to delete
 */
export async function deleteLicenseImage(filePath: string): Promise<void> {
  const { error } = await supabaseClient.storage
    .from("licenses")
    .remove([filePath])

  if (error) {
    throw new Error(`Failed to delete license image: ${error.message}`)
  }
}

