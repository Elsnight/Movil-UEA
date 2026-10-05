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
  Gestionar: undefined;
  ValidarRetiro: undefined;
};

export type AdminTabParamList = {
  Pendientes: undefined;
  Gestionar: undefined;
};

export type ConsumidorStackParamList = {
  ConsumidorTabs: undefined;
  DetalleOferta: { ofertaId: string };
};

export type RootStackParamList = {
  Auth: undefined;
  Consumidor: undefined;
  Comerciante: undefined;
  Administrador: undefined;
};