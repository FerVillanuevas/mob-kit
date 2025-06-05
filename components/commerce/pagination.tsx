import { TouchableOpacity, View } from "react-native"
import Icon from "~/components/icon"
import { Skeleton } from "~/components/ui/skeleton"
import { Text } from "~/components/ui/text"
import { cn } from "~/lib/utils"

export function PaginationSkeleton() {
  return (
    <View className="space-y-4">
      {/* Results info skeleton */}
      <View className="items-center">
        <Skeleton className="h-4 w-40 rounded-md" pulse />
      </View>

      {/* Pagination skeleton */}
      <View className="flex-row items-center justify-center gap-1">
        {/* Previous Button */}
        <Skeleton className="h-10 w-24 rounded-md" pulse />

        {/* Page Numbers */}
        <View className="flex-row items-center gap-1 mx-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-9 w-9 rounded-md" pulse />
          ))}
        </View>

        {/* Next Button */}
        <Skeleton className="h-10 w-24 rounded-md" pulse />
      </View>

      {/* Page info skeleton */}
      <View className="items-center">
        <Skeleton className="h-3 w-20 rounded-md" pulse />
      </View>
    </View>
  )
}

export function Pagination({
  total,
  requestedLimit,
  offset,
  navigate,
  isLoading = false,
}: {
  requestedLimit: number
  total: number
  offset: number
  navigate: any
  isLoading?: boolean
}) {
  const limit = requestedLimit

  const currentPage = Math.floor(offset / limit) + 1
  const totalPages = Math.ceil(total / limit)
  const hasNext = offset + limit < total
  const hasPrev = offset > 0

  const itemsStart = offset + 1
  const itemsEnd = Math.min(offset + limit, total)

  const goToPage = (page: number) => {
    const newOffset = (page - 1) * limit
    navigate((prev: any) => ({ ...prev, offset: newOffset }))
  }

  const nextPage = () => {
    if (hasNext) {
      navigate((prev: any) => ({ ...prev, offset: offset + limit }))
    }
  }

  const prevPage = () => {
    if (hasPrev) {
      navigate((prev: any) => ({ ...prev, offset: Math.max(0, offset - limit) }))
    }
  }

  // Generate visible page numbers
  const getVisiblePages = () => {
    const pages: (number | "ellipsis")[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push("ellipsis")
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push("ellipsis")
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push("ellipsis")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push("ellipsis")
        pages.push(totalPages)
      }
    }

    return pages
  }

  if (isLoading) {
    return <PaginationSkeleton />
  }

  if (totalPages <= 1) {
    return (
      <View className="py-4 items-center">
        <Text className="text-muted-foreground text-sm">
          Showing {total} {total === 1 ? "product" : "products"}
        </Text>
      </View>
    )
  }

  return (
    <View className="gap-4">
      {/* Results info */}
      <View className="items-center">
        <Text className="text-muted-foreground text-sm">
          Showing {itemsStart}-{itemsEnd} of {total} products
        </Text>
      </View>

      {/* Pagination */}
      <View className="flex-row items-center justify-center gap-1">
        {/* Previous Button */}
        <TouchableOpacity
          onPress={prevPage}
          disabled={!hasPrev}
          className={cn(
            "flex-row items-center gap-1 px-3 py-2 rounded-md border border-border shadow-sm",
            !hasPrev ? "opacity-50" : "bg-background",
          )}
          activeOpacity={0.7}
        >
          <Icon name="chevron-back" size={16} className="text-foreground" />
          <Text className="text-sm font-medium">Previous</Text>
        </TouchableOpacity>

        {/* Page Numbers */}
        <View className="flex-row items-center gap-1 mx-2">
          {getVisiblePages().map((page, index) => (
            <View key={index}>
              {page === "ellipsis" ? (
                <View className="flex items-center justify-center w-9 h-9">
                  <Icon name="ellipsis-horizontal" size={16} className="text-muted-foreground" />
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => goToPage(page)}
                  className={cn(
                    "w-9 h-9 items-center justify-center rounded-md border shadow-sm",
                    page === currentPage ? "border-primary bg-primary" : "border-border bg-background",
                  )}
                  activeOpacity={0.7}
                >
                  <Text
                    className={cn(
                      "text-sm font-medium",
                      page === currentPage ? "text-primary-foreground" : "text-foreground",
                    )}
                  >
                    {page}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Next Button */}
        <TouchableOpacity
          onPress={nextPage}
          disabled={!hasNext}
          className={cn(
            "flex-row items-center gap-1 px-3 py-2 rounded-md border border-border shadow-sm",
            !hasNext ? "opacity-50" : "bg-background",
          )}
          activeOpacity={0.7}
        >
          <Text className="text-sm font-medium">Next</Text>
          <Icon name="chevron-forward" size={16} className="text-foreground" />
        </TouchableOpacity>
      </View>

      {/* Page info */}
      <View className="items-center">
        <Text className="text-muted-foreground text-xs">
          Page {currentPage} of {totalPages}
        </Text>
      </View>
    </View>
  )
}
