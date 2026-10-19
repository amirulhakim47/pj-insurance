import type { AVVariantItem } from '@/types/allianz';

/**
 * Sample rows from Allianz UAT GET /lov/avVariant (Hostinger log, 14 Oct 2026).
 * Used only for `/results?demo=true` so the Agreed Value accordion can be reviewed
 * without a live vehicle lookup. No customer identifiers included.
 */
export const DEMO_AV_VARIANTS_FROM_UAT_LOV: AVVariantItem[] = [
  {
    Variant: 'STANDARD 4D HATCHBACK 5 SP MANUAL CKD 1332 CC - LOW',
    AvCode: 'IYZ14I-LO',
    SumInsured: '12000.00',
    VehicleEngineCC: 1332,
    MakeYear: '2014',
  },
  {
    Variant: 'STANDARD 4D HATCHBACK 5 SP MANUAL CKD 1332 CC',
    AvCode: 'IYZ14I',
    SumInsured: '13000.00',
    VehicleEngineCC: 1332,
    MakeYear: '2014',
  },
  {
    Variant: 'STANDARD 4D HATCHBACK 5 SP MANUAL CKD 1332 CC - HIGH',
    AvCode: 'IYZ14I-HI',
    SumInsured: '14000.00',
    VehicleEngineCC: 1332,
    MakeYear: '2014',
  },
  {
    Variant: 'STANDARD 4D HATCHBACK CVT AUTO 5 SP SEQUENTIAL CKD 1332 CC - LOW',
    AvCode: 'IZ014I-LO',
    SumInsured: '13000.00',
    VehicleEngineCC: 1332,
    MakeYear: '2014',
  },
  {
    Variant: 'STANDARD 4D HATCHBACK CVT AUTO 5 SP SEQUENTIAL CKD 1332 CC',
    AvCode: 'IZ014I',
    SumInsured: '14000.00',
    VehicleEngineCC: 1332,
    MakeYear: '2014',
  },
  {
    Variant: 'STANDARD 4D HATCHBACK CVT AUTO 5 SP SEQUENTIAL CKD 1332 CC - HIGH',
    AvCode: 'IZ014I-HI',
    SumInsured: '15000.00',
    VehicleEngineCC: 1332,
    MakeYear: '2014',
  },
  {
    Variant: 'EXECUTIVE 4D HATCHBACK 5 SP MANUAL CKD 1332 CC - LOW',
    AvCode: 'IZ114I-LO',
    SumInsured: '13000.00',
    VehicleEngineCC: 1332,
    MakeYear: '2014',
  },
  {
    Variant: 'EXECUTIVE 4D HATCHBACK 5 SP MANUAL CKD 1332 CC',
    AvCode: 'IZ114I',
    SumInsured: '14000.00',
    VehicleEngineCC: 1332,
    MakeYear: '2014',
  },
  {
    Variant: 'EXECUTIVE 4D HATCHBACK 5 SP MANUAL CKD 1332 CC - HIGH',
    AvCode: 'IZ114I-HI',
    SumInsured: '15000.00',
    VehicleEngineCC: 1332,
    MakeYear: '2014',
  },
  {
    Variant: 'PREMIUM 4D HATCHBACK 5 SP MANUAL CKD 1597 CC - LOW',
    AvCode: 'IZ514I-LO',
    SumInsured: '17000.00',
    VehicleEngineCC: 1597,
    MakeYear: '2014',
  },
  {
    Variant: 'PREMIUM 4D HATCHBACK 5 SP MANUAL CKD 1597 CC',
    AvCode: 'IZ514I',
    SumInsured: '18000.00',
    VehicleEngineCC: 1597,
    MakeYear: '2014',
  },
  {
    Variant: 'PREMIUM 4D HATCHBACK 5 SP MANUAL CKD 1597 CC - HIGH',
    AvCode: 'IZ514I-HI',
    SumInsured: '19000.00',
    VehicleEngineCC: 1597,
    MakeYear: '2014',
  },
  {
    Variant: 'PREMIUM 4D HATCHBACK CVT AUTO 5 SP SEQUENTIAL CKD 1597 CC - LOW',
    AvCode: 'IZ614I-LO',
    SumInsured: '18000.00',
    VehicleEngineCC: 1597,
    MakeYear: '2014',
  },
  {
    Variant: 'PREMIUM 4D HATCHBACK CVT AUTO 5 SP SEQUENTIAL CKD 1597 CC',
    AvCode: 'IZ614I',
    SumInsured: '19000.00',
    VehicleEngineCC: 1597,
    MakeYear: '2014',
  },
  {
    Variant: 'PREMIUM 4D HATCHBACK CVT AUTO 5 SP SEQUENTIAL CKD 1597 CC - HIGH',
    AvCode: 'IZ614I-HI',
    SumInsured: '20000.00',
    VehicleEngineCC: 1597,
    MakeYear: '2014',
  },
];
