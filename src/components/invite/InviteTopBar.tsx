import type { InviteVenueInfo } from "@/lib/couple-utils";
import { WeddingCountdown } from "@/components/invite/WeddingCountdown";
import styles from "./PremiumInviteExperience.module.css";

interface InviteTopBarProps {
  weddingDate?: string;
  weddingTime?: string;
  venue?: InviteVenueInfo | null;
  variant?: "dock";
}

export function InviteTopBar({
  weddingDate,
  weddingTime,
  venue,
}: InviteTopBarProps) {
  const hasCountdown = Boolean(weddingDate?.trim());
  const hasVenue = Boolean(venue);

  if (!hasCountdown && !hasVenue) return null;

  return (
    <header className={`${styles.topBar} ${styles.topBarDock}`}>
      {hasCountdown ? (
        <WeddingCountdown
          weddingDate={weddingDate!}
          weddingTime={weddingTime}
        />
      ) : null}

      {hasVenue && venue ? (
        <div className={styles.venueBlock}>
          <p className={styles.venueLabel}>Düğün yeri</p>
          {venue.name ? <p className={styles.venueName}>{venue.name}</p> : null}
          {venue.address ? (
            <p className={styles.venueAddress}>{venue.address}</p>
          ) : null}
          {venue.mapsUrl ? (
            <a
              href={venue.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.venueMapsCta}
            >
              Haritada aç
            </a>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
