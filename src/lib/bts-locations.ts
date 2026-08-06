/**
 * BTS-specific location exports.
 *
 * The canonical village list now lives in @/lib/tobago-locations,
 * which orders Megan Morrison's district (Mt. St. George/Goodwood)
 * first. This file re-exports it for backward compatibility with
 * BTS components that import from @/lib/bts-locations.
 */
export {
  TOBAGO_LOCATIONS as BTS_LOCATIONS,
  OTHER_LOCATION_VALUE,
  isKnownLocation,
  type TobagoLocation as BtsLocation,
} from "./tobago-locations";