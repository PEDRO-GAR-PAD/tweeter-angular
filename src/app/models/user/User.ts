export interface User {
    id: number;
    email: string;
    username: string;   // <-- AGREGA ESTA LÍNEA
    password: string;
    firstName?: string;
    lastName?: string;
  }
  