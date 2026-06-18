export type GhanaCity = {
  id: string;
  name: string;
  slug: string;
};

export type GhanaRegion = {
  id: string;
  name: string;
  slug: string;
  capital: string | null;
  cities: GhanaCity[];
};

export type GhanaLocationsResponse = {
  regions: GhanaRegion[];
};
