export const SPECIES_REFERENCE_VIEWS = ["preview", "full"] as const;
type ParkSpeciesSourceStatus = "available" | "missing" | "unreadable";
export type SpeciesReferenceView = (typeof SPECIES_REFERENCE_VIEWS)[number];

export type SpeciesReferenceRequestStatus =
  | "success"
  | "empty"
  | "invalid_park"
  | "failed";

export type BirdSpeciesRecord = {
  sequence: number;
  speciesName: string;
  residencyType: string;
  protectionLevel: string;
  ecologicalTraits: string;
  observationDifficulty: string;
};

export type SpeciesReferenceCollection = {
  view: SpeciesReferenceView;
  totalCount: number;
  returnedCount: number;
  hasMore: boolean;
  isComplete: boolean;
  records: BirdSpeciesRecord[];
};

export type SpeciesReferenceResponse = {
  requestStatus: SpeciesReferenceRequestStatus;
  message: string;
  requestedAt: string;
  parkId: string | null;
  parkName: string | null;
  sourceStatus: ParkSpeciesSourceStatus | null;
  collection: SpeciesReferenceCollection | null;
};
