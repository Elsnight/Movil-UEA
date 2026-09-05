export type AuthStackParamList = {
  Login: undefined;
  Registro: undefined;
};

export type ConsumidorTabParamList = {
  Explorar: undefined;
  MisReservas: undefined;
};

export type ComercianteTabParamList = {
  MisOfertas: undefined;
  Publicar: undefined;
  ValidarRetiro: undefined;
};

export type ConsumidorStackParamList = {
  ConsumidorTabs: undefined;
  DetalleOferta: { ofertaId: string };
};

export type RootStackParamList = {
  Auth: undefined;
  Consumidor: undefined;
  Comerciante: undefined;
};