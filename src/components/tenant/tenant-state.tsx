import { RefreshCcw, SearchX } from "lucide-react-native";
import { View } from "react-native";
import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import { FinderzLogo } from "@/components/ui/finderz-logo";
import { SafeAreaScreen } from "@/components/ui/safe-area-screen";

type TenantSkeletonVariant =
  | "home"
  | "list"
  | "enquiries"
  | "profile"
  | "property"
  | "gallery"
  | "conversation";

function SkeletonBlock({
  height,
  width = "100%",
  rounded = radius.xl,
}: {
  height: number;
  width?: number | `${number}%`;
  rounded?: number;
}) {
  return (
    <View
      style={{
        height,
        width,
        borderRadius: rounded,
        backgroundColor: colors.surfaceBlue,
      }}
    />
  );
}

function TenantHomeSkeleton() {
  return (
    <SafeAreaScreen edges={["right", "bottom", "left"]}>
      <View className="flex-row items-center justify-between px-4 pb-3">
        <View className="flex-row items-center gap-3">
          <FinderzLogo variant="mark" size="sm" />
          <View className="gap-2">
            <AppText variant="caption" muted>
              FinderZ is loading
            </AppText>
            <AppText variant="title">Finding homes near you</AppText>
          </View>
        </View>
        <SkeletonBlock height={40} width={40} rounded={radius.xl} />
      </View>

      <View className="px-4 pb-8">
        <SkeletonBlock height={56} rounded={radius.xl} />
        <View className="mt-5 flex-row gap-2">
          <SkeletonBlock height={40} width={88} rounded={999} />
          <SkeletonBlock height={40} width={104} rounded={999} />
          <SkeletonBlock height={40} width={84} rounded={999} />
        </View>

        <View className="mt-7 overflow-hidden rounded-2xl p-6" style={{ backgroundColor: colors.primaryContainer }}>
          <View className="absolute -right-8 -bottom-10 h-36 w-36 rounded-full bg-white/10" />
          <AppText variant="headline" style={{ color: "#fff" }}>
            Your next FinderZ home is loading
          </AppText>
          <AppText className="mt-2" style={{ color: colors.primaryMuted }}>
            Preparing recommended listings, nearby options, and fresh arrivals.
          </AppText>
          <View className="mt-5">
            <SkeletonBlock height={52} width={168} rounded={radius.lg} />
          </View>
        </View>

        <View className="mt-7">
          <AppText variant="title">Recommended for You</AppText>
          <View className="mt-3 flex-row gap-4">
            <SkeletonBlock height={312} width={280} rounded={radius.xl} />
            <SkeletonBlock height={312} width={280} rounded={radius.xl} />
          </View>
        </View>

        <View className="mt-7">
          <AppText variant="title">Affordable Near You</AppText>
          <View className="mt-3 gap-3">
            <SkeletonBlock height={136} rounded={radius.xl} />
            <SkeletonBlock height={136} rounded={radius.xl} />
          </View>
        </View>
      </View>
    </SafeAreaScreen>
  );
}

function TenantListSkeleton({
  title,
  showChips = false,
}: {
  title: string;
  showChips?: boolean;
}) {
  return (
    <SafeAreaScreen>
      <View className="px-4 pb-3 pt-4">
        <View className="flex-row items-center gap-3">
          <SkeletonBlock height={40} width={40} rounded={radius.lg} />
          <View className="min-w-0 flex-1 gap-2">
            <AppText variant="title">{title}</AppText>
            <AppText variant="caption" muted>
              Loading listings and saved details
            </AppText>
          </View>
        </View>
        {showChips ? (
          <View className="mt-4 flex-row gap-2">
            <SkeletonBlock height={40} width={86} rounded={999} />
            <SkeletonBlock height={40} width={108} rounded={999} />
            <SkeletonBlock height={40} width={96} rounded={999} />
          </View>
        ) : null}
      </View>

      <View className="gap-4 px-4 pb-10">
        <SkeletonBlock height={300} rounded={radius.xl} />
        <SkeletonBlock height={300} rounded={radius.xl} />
        <SkeletonBlock height={300} rounded={radius.xl} />
      </View>
    </SafeAreaScreen>
  );
}

function TenantEnquiriesSkeleton() {
  return (
    <SafeAreaScreen edges={["right", "bottom", "left"]}>
      <View className="px-4 pb-3">
        <View className="flex-row items-center justify-between">
          <View className="gap-2">
            <AppText variant="title">Enquiries</AppText>
            <AppText variant="caption" muted>
              Loading your conversations
            </AppText>
          </View>
          <SkeletonBlock height={32} width={90} rounded={999} />
        </View>
        <View className="mt-4 flex-row gap-2">
          <SkeletonBlock height={40} width={88} rounded={999} />
          <SkeletonBlock height={40} width={126} rounded={999} />
          <SkeletonBlock height={40} width={84} rounded={999} />
        </View>
      </View>

      <View className="gap-4 px-4 pb-10">
        <SkeletonBlock height={116} rounded={radius.xl} />
        <SkeletonBlock height={116} rounded={radius.xl} />
        <SkeletonBlock height={116} rounded={radius.xl} />
      </View>
    </SafeAreaScreen>
  );
}

function TenantProfileSkeleton() {
  return (
    <SafeAreaScreen edges={["right", "bottom", "left"]}>
      <View className="gap-6 px-4 pb-10">
        <View
          className="items-center rounded-2xl p-5"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
        >
          <SkeletonBlock height={96} width={96} rounded={48} />
          <View className="mt-4 w-full items-center gap-2">
            <SkeletonBlock height={18} width="52%" rounded={radius.md} />
            <SkeletonBlock height={14} width="64%" rounded={radius.md} />
            <SkeletonBlock height={28} width="42%" rounded={999} />
          </View>
        </View>

        {Array.from({ length: 4 }).map((_, index) => (
          <View key={index}>
            <SkeletonBlock height={14} width="24%" rounded={radius.sm} />
            <View
              className="mt-2 overflow-hidden rounded-2xl"
              style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
            >
              <SkeletonBlock height={58} rounded={0} />
              <SkeletonBlock height={58} rounded={0} />
            </View>
          </View>
        ))}

        <SkeletonBlock height={56} rounded={radius.xl} />
      </View>
    </SafeAreaScreen>
  );
}

function TenantPropertySkeleton() {
  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <SkeletonBlock height={360} rounded={0} />
      <View className="-mt-6 mx-4 rounded-2xl p-4" style={{ backgroundColor: colors.surface }}>
        <View className="flex-row gap-2">
          <SkeletonBlock height={36} width={96} rounded={999} />
          <SkeletonBlock height={36} width={80} rounded={999} />
        </View>
        <View className="mt-4 gap-2">
          <SkeletonBlock height={24} width="78%" />
          <SkeletonBlock height={16} width="48%" rounded={radius.md} />
        </View>
        <View className="mt-4 border-t pt-4" style={{ borderColor: colors.border }}>
          <SkeletonBlock height={14} width="24%" rounded={radius.sm} />
          <View className="mt-2">
            <SkeletonBlock height={28} width="38%" rounded={radius.md} />
          </View>
        </View>
      </View>
      <View className="mt-6 flex-row gap-2 px-4">
        <SkeletonBlock height={76} rounded={radius.xl} />
        <SkeletonBlock height={76} rounded={radius.xl} />
        <SkeletonBlock height={76} rounded={radius.xl} />
      </View>
      <View className="gap-7 px-4 py-7">
        <View className="gap-3">
          <SkeletonBlock height={18} width="32%" rounded={radius.sm} />
          <SkeletonBlock height={14} width="100%" rounded={radius.sm} />
          <SkeletonBlock height={14} width="88%" rounded={radius.sm} />
          <SkeletonBlock height={14} width="72%" rounded={radius.sm} />
        </View>
        <View className="gap-3">
          <SkeletonBlock height={18} width="28%" rounded={radius.sm} />
          <View className="flex-row flex-wrap gap-2">
            <SkeletonBlock height={36} width={92} rounded={999} />
            <SkeletonBlock height={36} width={78} rounded={999} />
            <SkeletonBlock height={36} width={108} rounded={999} />
          </View>
        </View>
      </View>
    </View>
  );
}

function TenantGallerySkeleton() {
  return (
    <View className="flex-1 bg-black">
      <SkeletonBlock height={999} rounded={0} />
      <View className="absolute left-0 right-0 top-0 px-5 py-12">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <SkeletonBlock height={44} width={44} rounded={22} />
            <View className="gap-2">
              <SkeletonBlock height={18} width={180} rounded={radius.sm} />
              <SkeletonBlock height={12} width={64} rounded={radius.sm} />
            </View>
          </View>
          <View className="flex-row gap-2">
            <SkeletonBlock height={44} width={44} rounded={22} />
            <SkeletonBlock height={44} width={44} rounded={22} />
          </View>
        </View>
      </View>
      <View className="absolute bottom-10 left-0 right-0 items-center">
        <SkeletonBlock height={40} width={132} rounded={999} />
      </View>
    </View>
  );
}

function TenantConversationSkeleton() {
  return (
    <SafeAreaScreen>
      <View className="flex-row items-center gap-3 px-4 py-4">
        <SkeletonBlock height={40} width={40} rounded={radius.lg} />
        <View className="min-w-0 flex-1 gap-2">
          <SkeletonBlock height={18} width="58%" rounded={radius.sm} />
          <SkeletonBlock height={12} width="32%" rounded={radius.sm} />
        </View>
      </View>
      <View className="gap-3 px-4 pb-8">
        <View className="items-end">
          <SkeletonBlock height={86} width="76%" rounded={radius.xl} />
        </View>
        <View className="items-start">
          <SkeletonBlock height={72} width="68%" rounded={radius.xl} />
        </View>
        <View className="items-end">
          <SkeletonBlock height={92} width="72%" rounded={radius.xl} />
        </View>
      </View>
    </SafeAreaScreen>
  );
}

export function TenantSkeleton({
  rows = 3,
  variant = "list",
}: {
  rows?: number;
  variant?: TenantSkeletonVariant;
}) {
  if (variant === "home") {
    return <TenantHomeSkeleton />;
  }

  if (variant === "enquiries") {
    return <TenantEnquiriesSkeleton />;
  }

  if (variant === "profile") {
    return <TenantProfileSkeleton />;
  }

  if (variant === "property") {
    return <TenantPropertySkeleton />;
  }

  if (variant === "gallery") {
    return <TenantGallerySkeleton />;
  }

  if (variant === "conversation") {
    return <TenantConversationSkeleton />;
  }

  return (
    <TenantListSkeleton
      title="Loading FinderZ listings"
      showChips={rows >= 4}
    />
  );
}

export function TenantCardStackSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <View className="gap-4 px-4 py-6">
      {Array.from({ length: rows }).map((_, index) => (
        <SkeletonBlock key={index} height={160} rounded={radius.xl} />
      ))}
    </View>
  );
}

export function TenantEmptyState({ title, message, actionTitle, onAction }: { title: string; message: string; actionTitle?: string; onAction?: () => void }) {
  return (
    <View className="items-center justify-center px-6 py-12">
      <View className="h-20 w-20 items-center justify-center" style={{ borderRadius: radius.xxl, backgroundColor: colors.surfaceBlue }}>
        <SearchX color={colors.primary} size={38} />
      </View>
      <AppText variant="title" className="mt-5 text-center">
        {title}
      </AppText>
      <AppText muted className="mt-2 text-center">
        {message}
      </AppText>
      {actionTitle && onAction ? (
        <View className="mt-5 w-full">
          <AppButton title={actionTitle} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

export function TenantErrorState({ title = "Unable to load", message, onRetry }: { title?: string; message: string; onRetry: () => void }) {
  return (
    <View className="items-center justify-center px-6 py-12">
      <View className="h-20 w-20 items-center justify-center" style={{ borderRadius: radius.xxl, backgroundColor: colors.errorSoft }}>
        <RefreshCcw color={colors.error} size={34} />
      </View>
      <AppText variant="title" className="mt-5 text-center">
        {title}
      </AppText>
      <AppText muted className="mt-2 text-center">
        {message}
      </AppText>
      <View className="mt-5 w-full">
        <AppButton title="Retry" variant="secondary" onPress={onRetry} />
      </View>
    </View>
  );
}
