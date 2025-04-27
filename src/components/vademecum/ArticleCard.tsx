
// In the button for narration
<Button
  size="icon"
  variant="ghost"
  className="h-8 w-8"
  onClick={onNarrate}
  title={isCurrentlyNarrating ? "Parar narração" : "Narrar artigo"}
>
  {isCurrentlyNarrating ? (
    <VolumeX className="h-4 w-4" />
  ) : (
    <Volume className="h-4 w-4" /> // Use Volume instead of VolumeUp
  )}
</Button>
