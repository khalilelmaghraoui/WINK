import type { Invite } from "./invite-store";
import type { LocationLink, LocationProvider } from "./providers/location-provider";

export function getInviteLocationLink(
  placeDetails: Invite["placeDetails"],
  provider: LocationProvider
): LocationLink | null {
  return provider.createLocationLink({
    placeName: placeDetails.name ?? null,
    address: placeDetails.address ?? null
  });
}
