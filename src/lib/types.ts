export type MediaType = "photo" | "video";
export type CoupleStatus = "active" | "passive" | "archived";
export type RsvpStatus = "attending" | "not_attending" | "maybe";
export type PackageType = "basic" | "premium" | "luxury";
export type PaymentStatus =
  | "manual_pending"
  | "paid"
  | "pending"
  | "failed"
  | "refunded";
export type OrderStatus = "active" | "passive" | "archived";

export interface Couple {
  id: string;
  slug: string;
  /** Legacy combined name — kept in sync with displayTitle */
  names: string;
  brideName: string;
  groomName: string;
  displayTitle: string;
  brandName: string;
  weddingDate: string;
  heroSubtitle: string;
  heroVideoUrl: string;
  quizEnabled: boolean;
  quizWinnerName: string | null;
  playlistTitle: string;
  playlistArtist: string;
  playlistUrl: string;
  status: CoupleStatus;
  packageType: PackageType | null;
  leafCount: number;
  brideEmail: string;
  groomEmail: string;
  driveFolderUrl: string;
  mediaUploadEnabled: boolean;
  memoriesGalleryEnabled: boolean;
  couplePhotoUrl: string;
  /** Only set on admin fetches — never expose on public pages intentionally */
  adminPin?: string;
  driveFolderId?: string;
  createdAt?: string;
  createdByOrderId?: string | null;
  deletedAt?: string | null;
  archivedAt?: string | null;
  invitationEnabled: boolean;
  invitationTitle: string;
  invitationMessage: string;
  venueName: string;
  venueAddress: string;
  venueMapsUrl: string;
  weddingTime: string;
  rsvpEnabled: boolean;
  rsvpDeadline: string;
  maxGuestCount: number;
  /** @deprecated use heroSubtitle */
  tagline?: string;
}

export interface CoupleSettingsInput {
  brideName: string;
  groomName: string;
  displayTitle: string;
  slug: string;
  weddingDate: string;
  heroSubtitle: string;
  heroVideoUrl: string;
  quizEnabled: boolean;
  quizWinnerName: string;
  playlistTitle: string;
  playlistArtist: string;
  playlistUrl: string;
  brideEmail: string;
  groomEmail: string;
  driveFolderUrl: string;
  mediaUploadEnabled: boolean;
  couplePhotoUrl: string;
  adminPin: string;
  status: CoupleStatus;
  invitationEnabled: boolean;
  invitationTitle: string;
  invitationMessage: string;
  venueName: string;
  venueAddress: string;
  venueMapsUrl: string;
  weddingTime: string;
  rsvpEnabled: boolean;
  rsvpDeadline: string;
  maxGuestCount: number;
}

export interface CoupleCreateInput {
  brideName: string;
  groomName: string;
  displayTitle: string;
  slug: string;
  weddingDate: string;
  heroSubtitle: string;
  heroVideoUrl: string;
  adminPin: string;
  quizEnabled: boolean;
  playlistTitle: string;
  playlistArtist: string;
  playlistUrl: string;
  status: CoupleStatus;
  packageType?: PackageType | null;
  brideEmail?: string;
  groomEmail?: string;
  mediaUploadEnabled?: boolean;
}

export interface CreateCoupleOrderInput {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  package_type: PackageType;
  bride_name: string;
  groom_name: string;
  wedding_date?: string;
  bride_email?: string;
  groom_email?: string;
  playlist_title?: string;
  playlist_artist?: string;
  playlist_url?: string;
  media_upload_enabled?: boolean;
  quiz_enabled?: boolean;
  notes?: string;
}

export interface CreateCoupleResponse {
  success: true;
  orderId: string;
  coupleId: string;
  slug: string;
  publicUrl: string;
  adminUrl: string;
  adminPin: string;
  driveFolderUrl: string | null;
  packageType: PackageType;
}

export interface OrderRecord {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  packageType: PackageType | null;
  price: number | null;
  paymentStatus: PaymentStatus;
  paymentProvider: string | null;
  paymentReference: string | null;
  coupleId: string | null;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string | null;
  archivedAt: string | null;
  deletedAt: string | null;
  coupleSlug?: string | null;
  coupleDisplayTitle?: string | null;
  driveFolderUrl?: string | null;
}

export interface CouplePhoto {
  id: string;
  coupleId: string;
  caption: string | null;
  sortOrder: number;
  imageUrl: string;
  filename: string | null;
  mimeType: string | null;
  driveFileId: string | null;
  driveWebViewLink: string | null;
  frameZoom: number;
  framePanX: number;
  framePanY: number;
  isVisible: boolean;
  createdAt: string;
}

export interface CoupleListItem {
  id: string;
  slug: string;
  displayTitle: string;
  names: string;
  weddingDate: string;
  leafCount: number;
  mediaCount: number;
  quizEnabled: boolean;
  status: CoupleStatus;
  packageType: PackageType | null;
  createdAt: string;
  driveFolderUrl: string;
  rsvpGuestCount?: number;
  rsvpResponseCount?: number;
  invitationEnabled?: boolean;
}

export interface RsvpResponse {
  id: string;
  coupleId: string;
  guestName: string;
  phone: string | null;
  status: RsvpStatus;
  guestCount: number;
  note: string | null;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface RsvpStats {
  totalGuestCount: number;
  totalResponses: number;
  attendingCount: number;
  notAttendingCount: number;
  maybeCount: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface PlaylistTrack {
  id: string;
  title: string;
  artist: string;
  duration: string;
  url?: string;
}
