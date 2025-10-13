export default function Loading() {
  return (
    <div className="content-container">
      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="w-full">
          {/* Image skeleton */}
          <div className="relative aspect-square w-full bg-ui-bg-subtle animate-pulse" />
        </div>
        <div className="px-4 pt-4 pb-6">
          <div className="h-6 w-32 bg-ui-bg-subtle animate-pulse mb-2" />
          <div className="h-8 w-3/4 bg-ui-bg-subtle animate-pulse" />
        </div>
      </div>

      {/* Tablet Layout */}
      <div className="hidden md:block xl:hidden">
        <div className="flex w-full min-h-screen items-center">
          <div className="w-[65%] flex items-center justify-center">
            <div className="relative aspect-square w-full bg-ui-bg-subtle animate-pulse" />
          </div>
          <div className="w-[35%] px-4">
            <div className="h-6 w-32 bg-ui-bg-subtle animate-pulse mb-4" />
            <div className="h-8 w-3/4 bg-ui-bg-subtle animate-pulse mb-8" />
            <div className="h-12 w-full bg-ui-bg-subtle animate-pulse" />
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden xl:block">
        <div className="flex w-full min-h-screen">
          <div className="w-1/5 pl-6">
            <div className="sticky top-0 h-screen flex items-center">
              <div className="w-full">
                <div className="h-6 w-32 bg-ui-bg-subtle animate-pulse mb-4" />
                <div className="h-8 w-full bg-ui-bg-subtle animate-pulse" />
              </div>
            </div>
          </div>
          <div className="w-[55%] flex justify-center">
            <div className="relative aspect-square w-full bg-ui-bg-subtle animate-pulse" />
          </div>
          <div className="w-1/4 pr-6">
            <div className="sticky top-0 h-screen flex items-center">
              <div className="h-12 w-full bg-ui-bg-subtle animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
