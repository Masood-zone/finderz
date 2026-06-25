export interface CloudinaryUploadResponse {
  public_id: string
  secure_url: string
  url: string
  format?: string
  width?: number
  height?: number
  bytes?: number
  created_at?: string
  original_filename?: string
}

export type CloudinaryResourceType = "auto" | "image" | "raw"

let configured = false
let clockOffsetMs = 0
let clockOffsetCheckedAt = 0
let credentials: {
  cloudName: string
  apiKey: string
  apiSecret: string
} | null = null

function ensureConfigured() {
  if (configured) return

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials are missing from environment")
  }

  credentials = { cloudName, apiKey, apiSecret }

  configured = true
}

async function sha1Hex(value: string) {
  const data = new TextEncoder().encode(value)
  const hash = await crypto.subtle.digest("SHA-1", data)

  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

async function createSignature(params: Record<string, string | number>) {
  ensureConfigured()

  if (!credentials) {
    throw new Error("Cloudinary credentials are missing from environment")
  }

  const payload = Object.entries(params)
    .filter(([, value]) => value !== "" && value !== undefined && value !== null)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&")

  return sha1Hex(`${payload}${credentials.apiSecret}`)
}

async function getUploadTimestamp(): Promise<number> {
  const now = Date.now()
  const offsetTtlMs = 5 * 60 * 1000

  if (clockOffsetCheckedAt && now - clockOffsetCheckedAt < offsetTtlMs) {
    return Math.floor((now + clockOffsetMs) / 1000)
  }

  try {
    const response = await fetch("https://api.cloudinary.com", {
      method: "HEAD",
      cache: "no-store",
    })
    const cloudinaryDate = response.headers.get("date")

    if (cloudinaryDate) {
      const serverTime = new Date(cloudinaryDate).getTime()
      if (!Number.isNaN(serverTime)) {
        clockOffsetMs = serverTime - now
        clockOffsetCheckedAt = now
      }
    }
  } catch (error) {
    console.warn("Could not check Cloudinary server time:", error)
  }

  return Math.floor((Date.now() + clockOffsetMs) / 1000)
}

export async function uploadBuffer(args: {
  buffer: ArrayBuffer
  folder?: string
  filename?: string
  resourceType?: CloudinaryResourceType
}): Promise<CloudinaryUploadResponse> {
  ensureConfigured()
  if (!credentials) {
    throw new Error("Cloudinary credentials are missing from environment")
  }

  const resourceType = args.resourceType || "auto"
  const timestamp = await getUploadTimestamp()
  const uploadParams = {
    folder: args.folder || "finderz/uploads",
    filename_override: args.filename || "",
    resource_type: resourceType,
    timestamp,
    unique_filename: "true",
    use_filename: "true",
  }
  const formData = new FormData()

  formData.append("file", new Blob([args.buffer]), args.filename || "upload")
  formData.append("api_key", credentials.apiKey)
  formData.append("folder", uploadParams.folder)
  formData.append("resource_type", uploadParams.resource_type)
  formData.append("timestamp", String(uploadParams.timestamp))
  formData.append("unique_filename", uploadParams.unique_filename)
  formData.append("use_filename", uploadParams.use_filename)

  if (uploadParams.filename_override) {
    formData.append("filename_override", uploadParams.filename_override)
  }

  const signatureParams: Record<string, string | number> = {
    folder: uploadParams.folder,
    resource_type: uploadParams.resource_type,
    timestamp: uploadParams.timestamp,
    unique_filename: uploadParams.unique_filename,
    use_filename: uploadParams.use_filename,
  }

  if (uploadParams.filename_override) {
    signatureParams.filename_override = uploadParams.filename_override
  }

  formData.append("signature", await createSignature(signatureParams))

  const response = await fetch(`https://api.cloudinary.com/v1_1/${credentials.cloudName}/${resourceType}/upload`, {
    method: "POST",
    body: formData,
  })

  const result = (await response.json()) as CloudinaryUploadResponse & {
    error?: { message?: string }
  }

  if (!response.ok) {
    throw new Error(result.error?.message || "Cloudinary upload failed")
  }

  return {
    public_id: result.public_id,
    secure_url: result.secure_url,
    url: result.url,
    format: result.format,
    width: result.width,
    height: result.height,
    bytes: result.bytes,
    created_at: result.created_at,
    original_filename: result.original_filename,
  }
}

export async function uploadImageBuffer(args: {
  buffer: ArrayBuffer
  folder?: string
  filename?: string
}): Promise<CloudinaryUploadResponse> {
  return uploadBuffer({ ...args, resourceType: "image" })
}
