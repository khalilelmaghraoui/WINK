export interface LocationLinkInput {
  placeName: string | null;
  address: string | null;
}

export interface LocationLink {
  href: string;
  providerLabel: string;
  accessibleLabel: string;
}

export interface LocationProvider {
  createLocationLink(input: LocationLinkInput): LocationLink | null;
}
