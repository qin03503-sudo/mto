-- Enum and type definitions for the MTO Pricing Web App.

CREATE TYPE offer_status AS ENUM (
  'draft',
  'pricing',
  'ready',
  'sent',
  'closed',
  'cancelled'
);

CREATE TYPE calculation_method AS ENUM (
  'VALUE_X_UNIT_PRICE',
  'QTY_X_UNIT_PRICE',
  'DIMENSIONAL_WEIGHT',
  'ZERO_OR_INFO',
  'MANUAL'
);

CREATE TYPE calculation_status AS ENUM (
  'not_calculated',
  'current',
  'outdated',
  'failed'
);
