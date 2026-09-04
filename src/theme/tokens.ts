export const primitive = {
  orange50: '#FFF4EC',
  orange100: '#FFE4CF',
  orange400: '#FF8A3D',
  orange600: '#E8641C',

  green50: '#F1F8F0',
  green400: '#5FA85A',
  green600: '#3D7A3A',

  charcoal900: '#22201D',
  charcoal700: '#4A453F',

  neutral200: '#E7E2DA',
  neutral50: '#FDFBF7',

  red500: '#E8493C',
  yellow400: '#F5B942',

  white: '#FFFFFF',

  fontSize: {
    10: 10,
    12: 12,
    13: 13,
    14: 14,
    16: 16,
    18: 18,
    20: 20,
    22: 22,
    24: 24,
    28: 28,
    32: 32,
  } as const,

  lineHeight: {
    14: 14,
    16: 16,
    18: 18,
    20: 20,
    22: 22,
    24: 24,
    26: 26,
    28: 28,
    32: 32,
    36: 36,
    40: 40,
  } as const,

  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },

  space: {
    0: 0,
    2: 2,
    4: 4,
    6: 6,
    8: 8,
    10: 10,
    12: 12,
    14: 14,
    16: 16,
    18: 18,
    20: 20,
    24: 24,
    28: 28,
    32: 32,
    40: 40,
    48: 48,
  } as const,

  radius: {
    4: 4,
    6: 6,
    8: 8,
    10: 10,
    12: 12,
    16: 16,
    20: 20,
    999: 999,
  } as const,
} as const;

export const color = {
  background: primitive.neutral50,
  surface: primitive.white,
  textPrimary: primitive.charcoal900,
  textSecondary: primitive.charcoal700,
  primary: primitive.orange400,
  primaryPressed: primitive.orange600,
  primaryLight: primitive.orange50,
  success: primitive.green400,
  successLight: primitive.green50,
  warning: primitive.yellow400,
  danger: primitive.red500,
  border: primitive.neutral200,
  overlay: 'rgba(34, 32, 29, 0.6)',
} as const;

export const spacing = {
  xs: primitive.space[4],
  sm: primitive.space[8],
  md: primitive.space[16],
  lg: primitive.space[24],
  xl: primitive.space[32],
  xxl: primitive.space[48],
} as const;

export const radius = {
  button: primitive.radius[12],
  card: primitive.radius[20],
  badge: primitive.radius[999],
  input: primitive.radius[10],
} as const;

export const typography = {
  display: {
    fontSize: primitive.fontSize[32],
    lineHeight: primitive.lineHeight[40],
    fontWeight: primitive.fontWeight.bold,
  } as const,
  heading: {
    fontSize: primitive.fontSize[22],
    lineHeight: primitive.lineHeight[28],
    fontWeight: primitive.fontWeight.semiBold,
  } as const,
  body: {
    fontSize: primitive.fontSize[16],
    lineHeight: primitive.lineHeight[22],
    fontWeight: primitive.fontWeight.regular,
  } as const,
  caption: {
    fontSize: primitive.fontSize[13],
    lineHeight: primitive.lineHeight[18],
    fontWeight: primitive.fontWeight.medium,
  } as const,
  price: {
    fontSize: primitive.fontSize[20],
    lineHeight: primitive.lineHeight[24],
    fontWeight: primitive.fontWeight.bold,
  } as const,
} as const;