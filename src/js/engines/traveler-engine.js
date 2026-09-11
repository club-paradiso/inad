// Traveller pool access and portrait resolution. Every traveller has exactly one portrait
// (src/assets/portraits/<id>.webp) that is used in the queue, passenger header, passport,
// biometrics, procedure screens, reports and replays. Passport photo mismatches for the
// forgery case are expressed by `case.passportPortraitId`, never by swapping portraits here.
import { TRAVELER_POOL } from '../../data/travelers.js';
import { portraitSrc } from '../services/portraits.js';

export const travelerMap = new Map(TRAVELER_POOL.map((t) => [t.id, { ...t, portrait: portraitSrc(t.id) }]));
export const getTraveler = (id) => travelerMap.get(id);
export const CORE_TRAVELER_IDS = (cases) => new Set(cases.map((c) => c.travelerId));
export const poolSize = () => travelerMap.size;
