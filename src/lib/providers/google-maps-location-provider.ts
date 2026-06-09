import type {
  LocationLink,
  LocationLinkInput,
  LocationProvider
} from "./location-provider";

const googleMapsSearchUrl = "https://www.google.com/maps/search/?api=1&query=";

export class GoogleMapsLocationProvider implements LocationProvider {
  createLocationLink(input: LocationLinkInput): LocationLink | null {
    const query = createLocationQuery(input);

    if (!query) {
      return null;
    }

    return {
      href: `${googleMapsSearchUrl}${encodeURIComponent(query)}`,
      providerLabel: "Google Maps",
      accessibleLabel: "Open this place in Google Maps"
    };
  }
}

export function createGoogleMapsLocationProvider(): LocationProvider {
  return new GoogleMapsLocationProvider();
}

function createLocationQuery({
  address,
  placeName
}: LocationLinkInput): string | null {
  const cleanedName = cleanLocationPart(placeName);
  const cleanedAddress = cleanLocationPart(address);

  if (!cleanedName && !cleanedAddress) {
    return null;
  }

  if (cleanedName && cleanedAddress) {
    if (cleanedName.toLowerCase() === cleanedAddress.toLowerCase()) {
      return cleanedName;
    }

    return `${cleanedName}, ${cleanedAddress}`;
  }

  return cleanedName ?? cleanedAddress;
}

function cleanLocationPart(value: string | null): string | null {
  const cleaned = value?.replace(/\s+/g, " ").trim();

  return cleaned ? cleaned : null;
}
