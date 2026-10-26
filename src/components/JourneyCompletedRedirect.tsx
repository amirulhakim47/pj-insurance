export function JourneyCompletedRedirect() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-3 px-6 text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      <p className="text-sm text-muted-foreground">
        Payment for this quotation is complete. Taking you to your confirmation page...
      </p>
    </div>
  );
}
