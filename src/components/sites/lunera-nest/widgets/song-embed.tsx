/**
 * The source hides a YouTube player (opacity 0) on top of the drawn player
 * controls, so pressing the gold play button starts the song.
 */
export function SongEmbed({ videoId }: { videoId: string }) {
  return (
    <iframe
      className="ln-song"
      src={`https://www.youtube-nocookie.com/embed/${videoId}`}
      title="Our graduation song"
      loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      sandbox="allow-same-origin allow-scripts allow-popups allow-presentation"
    />
  );
}
