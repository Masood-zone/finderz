import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { FileText, ImagePlus, Trash2, Upload } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, View } from "react-native";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import { useUploadFile, type UploadedCloudinaryFile, type UploadPurpose } from "@/services/uploads/uploads";

export type UploadedFileResult = {
  file?: File;
  name: string;
  uri: string;
  type?: string;
  upload?: UploadedCloudinaryFile;
};

type FileUploadProps = {
  label: string;
  helperText?: string;
  mode?: "image" | "document";
  uploadMode?: "single" | "multi";
  purpose: UploadPurpose;
  value?: UploadedFileResult[];
  onChange: (files: UploadedFileResult[]) => void;
};

function getNameFromUri(uri: string, fallback: string) {
  return uri.split("/").pop() || fallback;
}

export default function FileUpload({
  label,
  helperText,
  mode = "image",
  uploadMode = "single",
  purpose,
  value = [],
  onChange,
}: FileUploadProps) {
  const upload = useUploadFile();
  const [uploading, setUploading] = useState(false);

  const pick = async () => {
    try {
      setUploading(true);
      const picked =
        mode === "image"
          ? await ImagePicker.launchImageLibraryAsync({
              allowsMultipleSelection: uploadMode === "multi",
              mediaTypes: ["images"],
              quality: 0.82,
            })
          : await DocumentPicker.getDocumentAsync({
              copyToCacheDirectory: true,
              multiple: uploadMode === "multi",
              type: ["application/pdf", "image/*"],
            });

      const assets =
        "canceled" in picked && picked.canceled
          ? []
          : mode === "image"
            ? (picked as ImagePicker.ImagePickerSuccessResult).assets.map((asset) => ({
                file: asset.file,
                name: asset.fileName ?? getNameFromUri(asset.uri, "image.jpg"),
                type: asset.mimeType ?? "image/jpeg",
                uri: asset.uri,
              }))
            : (picked as DocumentPicker.DocumentPickerSuccessResult).assets.map((asset) => ({
                file: asset.file,
                name: asset.name,
                type: asset.mimeType ?? "application/octet-stream",
                uri: asset.uri,
              }));

      if (!assets.length) {
        return;
      }

      const uploaded = await Promise.all(
        assets.map(async (file) => ({
          ...file,
          upload: await upload.mutateAsync({ file, purpose }),
        })),
      );

      onChange(uploadMode === "single" ? uploaded.slice(0, 1) : [...value, ...uploaded]);
    } catch (error) {
      Alert.alert("Upload failed", error instanceof Error ? error.message : "Please try another file.");
    } finally {
      setUploading(false);
    }
  };

  const remove = (uri: string) => {
    onChange(value.filter((file) => file.uri !== uri));
  };

  return (
    <View>
      <AppText variant="label" muted className="mb-2 ml-1">
        {label}
      </AppText>
      <Pressable
        accessibilityRole="button"
        className="items-center justify-center gap-2 border border-dashed px-4 py-5"
        style={{ borderColor: colors.borderStrong, borderRadius: radius.lg, backgroundColor: colors.surface }}
        onPress={pick}
      >
        {uploading ? (
          <ActivityIndicator color={colors.primary} />
        ) : mode === "image" ? (
          <ImagePlus color={colors.primary} size={28} />
        ) : (
          <Upload color={colors.primary} size={28} />
        )}
        <AppText style={{ fontFamily: "Manrope_700Bold" }}>{uploading ? "Uploading..." : "Choose file"}</AppText>
        {helperText ? (
          <AppText variant="caption" muted className="text-center">
            {helperText}
          </AppText>
        ) : null}
      </Pressable>

      {value.length ? (
        <View className="mt-3 gap-2">
          {value.map((file) => (
            <View
              key={file.uri}
              className="flex-row items-center gap-3 rounded-xl border p-3"
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
            >
              {mode === "image" ? (
                <Image source={{ uri: file.upload?.secure_url ?? file.uri }} style={{ width: 48, height: 48, borderRadius: radius.md }} />
              ) : (
                <View className="h-12 w-12 items-center justify-center rounded-lg" style={{ backgroundColor: colors.surfaceBlue }}>
                  <FileText color={colors.primary} size={22} />
                </View>
              )}
              <View className="min-w-0 flex-1">
                <AppText numberOfLines={1} style={{ fontFamily: "Manrope_700Bold" }}>
                  {file.name}
                </AppText>
                <AppText variant="caption" muted>
                  {file.upload ? "Uploaded securely" : "Ready"}
                </AppText>
              </View>
              <Pressable className="h-10 w-10 items-center justify-center" onPress={() => remove(file.uri)}>
                <Trash2 color={colors.error} size={20} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
