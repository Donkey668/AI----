export type ForecastWarningRequestStatus =
  | "success"
  | "partial"
  | "invalid_park"
  | "failed";

export type ForecastWarningModuleStatus = "success" | "empty" | "failed";

export type ForecastWarningParkContext = {
  parkId: string;
  parkName: string;
  districtName: string;
  districtCode: string;
};

export type ForecastWarningModule<T> = {
  status: ForecastWarningModuleStatus;
  message: string;
  source: string;
  returnedCount: number;
  records: T[];
  attributions?: string[];
};

export type HourlyForecastRecord = {
  recId: string;
  forecastTime: string;
  weatherStatus: string;
  qpfTemp: string;
};

export type DistrictForecastRecord = {
  recId: string;
  forecastTime: string;
  weatherStatus: string;
  minTemperature: string;
  maxTemperature: string;
};

export type SunMoonTimingRecord = {
  keyId: string;
  forecastTime: string;
  attribName: string;
  attribValue: string;
};

export type DisasterWarningRecord = {
  sequence: number;
  issuedTime: string;
  eventTypeName: string;
  colorCode: string;
  senderName: string;
  effectiveTime: string;
  headline: string;
  description: string;
  instruction: string;
  district: string;
  textColorCss: string;
  isPlaceholder: boolean;
};

export type ForecastWarningModules = {
  hourlyForecast: ForecastWarningModule<HourlyForecastRecord>;
  districtForecast: ForecastWarningModule<DistrictForecastRecord>;
  sunMoonTiming: ForecastWarningModule<SunMoonTimingRecord>;
  disasterWarning: ForecastWarningModule<DisasterWarningRecord>;
};

export type ForecastWarningResponse = {
  requestStatus: ForecastWarningRequestStatus;
  message: string;
  requestedAt: string;
  park: ForecastWarningParkContext | null;
  hourlyForecast: ForecastWarningModule<HourlyForecastRecord> | null;
  districtForecast: ForecastWarningModule<DistrictForecastRecord> | null;
  sunMoonTiming: ForecastWarningModule<SunMoonTimingRecord> | null;
  disasterWarning: ForecastWarningModule<DisasterWarningRecord> | null;
};
