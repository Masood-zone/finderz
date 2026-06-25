import { z } from "zod";
import { internalServerErrorResponse, successResponse, validationErrorResponse } from "@/lib/api-response";
import { guardErrorResponse, requireSession } from "@/lib/auth-guards.server";
import { uploadBuffer } from "@/lib/cloudinary/cloudinary-service";

const uploadSchema = z.object({
  purpose: z.enum(["userProfile", "landlordIdentity", "propertyImage"]),
});

const folders = {
  userProfile: "finderz/users/profiles",
  landlordIdentity: "finderz/landlords/identity-documents",
  propertyImage: "finderz/properties/images",
} satisfies Record<z.infer<typeof uploadSchema>["purpose"], string>;

const resourceTypes = {
  userProfile: "image",
  landlordIdentity: "auto",
  propertyImage: "image",
} as const;

export async function POST(request: Request) {
  try {
    await requireSession(request);
    const formData = (await request.formData()) as unknown as FormData & {
      get(name: string): FormDataEntryValue | null;
    };
    const parsed = uploadSchema.safeParse({
      purpose: formData.get("purpose"),
    });

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const file = formData.get("file");
    if (!(file instanceof File)) {
      return Response.json({ success: false, error: { code: "VALIDATION_ERROR", message: "A file is required." } }, { status: 400 });
    }

    const upload = await uploadBuffer({
      buffer: await file.arrayBuffer(),
      filename: file.name,
      folder: folders[parsed.data.purpose],
      resourceType: resourceTypes[parsed.data.purpose],
    });

    return successResponse({
      bytes: upload.bytes,
      format: upload.format,
      height: upload.height,
      originalName: file.name,
      previewUrl: upload.secure_url,
      public_id: upload.public_id,
      secure_url: upload.secure_url,
      url: upload.url,
      width: upload.width,
    });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
