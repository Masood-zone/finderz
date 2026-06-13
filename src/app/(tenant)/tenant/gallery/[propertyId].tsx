import { useMemo, useRef, useState } from "react";
import { Dimensions, Image, NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, Share, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Share2, ZoomIn } from "lucide-react-native";
import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/design-system";
import { TenantErrorState, TenantSkeleton } from "@/components/tenant/tenant-state";
import { getErrorMessage } from "@/lib/get-error-message";
import { useTenantProperty } from "@/services/queries/hooks";

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function TenantGalleryScreen() {
  const params = useLocalSearchParams<{ propertyId?: string }>();
  const propertyId = firstParam(params.propertyId) ?? "";
  const propertyQuery = useTenantProperty(propertyId);
  const [index, setIndex] = useState(0);
  const screenWidth = Dimensions.get("window").width;
  const scrollRef = useRef<ScrollView>(null);

  const images = useMemo(() => propertyQuery.data?.property.images ?? [], [propertyQuery.data?.property.images]);

  if (propertyQuery.isLoading) {
    return <TenantSkeleton rows={4} />;
  }

  if (propertyQuery.isError || !propertyQuery.data?.property) {
    return <TenantErrorState title="Gallery unavailable" message={getErrorMessage(propertyQuery.error, "This gallery could not be loaded.")} onRetry={() => void propertyQuery.refetch()} />;
  }

  const property = propertyQuery.data.property;
  const galleryImages = images.length ? images : property.coverImage ? [{ id: "cover", url: property.coverImage, position: 0, isCover: true }] : [];

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(event.nativeEvent.contentOffset.x / screenWidth));
  };

  return (
    <View className="flex-1 bg-black">
      <ScrollView ref={scrollRef} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={16}>
        {galleryImages.map((image) => (
          <View key={image.id} style={{ width: screenWidth }} className="items-center justify-center">
            <Image source={{ uri: image.url }} resizeMode="cover" style={{ width: "100%", height: "100%" }} />
          </View>
        ))}
      </ScrollView>

      <View className="absolute left-0 right-0 top-0 flex-row items-center justify-between px-5 py-12">
        <View className="flex-row items-center gap-3">
          <Pressable className="h-11 w-11 items-center justify-center rounded-full bg-black/60" onPress={() => router.back()}>
            <ArrowLeft color="#fff" size={22} />
          </Pressable>
          <View>
            <AppText style={{ color: "#fff", fontFamily: "Manrope_800ExtraBold" }} numberOfLines={1}>
              {property.title}
            </AppText>
            <AppText variant="caption" style={{ color: "rgba(255,255,255,0.7)" }}>
              {Math.min(index + 1, Math.max(galleryImages.length, 1))} / {Math.max(galleryImages.length, 1)}
            </AppText>
          </View>
        </View>
        <View className="flex-row gap-2">
          <Pressable className="h-11 w-11 items-center justify-center rounded-full bg-black/60">
            <ZoomIn color="#fff" size={20} />
          </Pressable>
          <Pressable className="h-11 w-11 items-center justify-center rounded-full bg-black/60" onPress={() => Share.share({ title: property.title, message: property.title })}>
            <Share2 color="#fff" size={20} />
          </Pressable>
        </View>
      </View>

      <View className="absolute bottom-10 left-0 right-0 items-center">
        <View className="flex-row items-center gap-2 rounded-full bg-black/60 px-4 py-3">
          {galleryImages.map((image, dotIndex) => (
            <Pressable
              key={image.id}
              className="h-2 rounded-full"
              style={{ width: index === dotIndex ? 24 : 8, backgroundColor: index === dotIndex ? colors.gold : "rgba(255,255,255,0.35)" }}
              onPress={() => scrollRef.current?.scrollTo({ x: dotIndex * screenWidth, animated: true })}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
