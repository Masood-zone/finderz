import { useMutation } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import { authClient } from "@/lib/auth-client";
import { getApiBaseUrl } from "@/lib/env";
import type { ApiResponse } from "@/types/api";

export type UploadPurpose =
  | "userProfile"
  | "landlordIdentity"
  | "propertyImage";

export interface UploadedCloudinaryFile {
  bytes?: number
  format?: string
  height?: number
  originalName?: string
  previewUrl: string
  public_id: string
  secure_url: string
  url: string
  width?: number
}

export interface UploadFileInput {
  file: {
    file?: File;
    uri: string;
    name: string;
    type?: string;
  };
  purpose: UploadPurpose;
}

export async function uploadFileToCloudinary({
  file,
  purpose,
}: UploadFileInput): Promise<UploadedCloudinaryFile> {
  const cookie = authClient.getCookie();
  const body = new FormData();
  body.append("purpose", purpose);
  body.append(
    "file",
    file.file ??
      ({
        uri: file.uri,
        name: file.name,
        type: file.type ?? "application/octet-stream",
      } as unknown as Blob),
  );

  const res = await fetch(`${getApiBaseUrl()}/api/uploads`, {
    body,
    credentials: "omit",
    headers: {
      ...(cookie
        ? {
            cookie,
            "x-finderz-auth-cookie": cookie,
          }
        : {}),
      "expo-origin": Linking.createURL("", { scheme: "finderz" }),
      "x-skip-oauth-proxy": "true",
    },
    method: "POST",
  });
  const payload = (await res.json()) as ApiResponse<UploadedCloudinaryFile>;

  if (!res.ok || !payload.success) {
    throw new Error(payload.success ? "File upload failed" : payload.error.message);
  }

  return payload.data;
}

export function useUploadFile() {
  return useMutation({
    mutationFn: uploadFileToCloudinary,
  });
}
