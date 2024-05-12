export class Benzinarie {
  public id: number;
  public nume: string;
  public locatie: string;
  public brand: string;
  public telefon: string;  // Adăugarea câmpului pentru numărul de telefon
  public email: string;    // Adăugarea câmpului pentru email

  constructor() {
    this.id = 0;
    this.nume = '';
    this.locatie = '';
    this.brand = '';
    this.telefon = '';
    this.email = '';
  }
}
