export class Organization {
  id: number;
  name: string;
  type: string;
  address: string;
  phone: string;
  description: string;
    constructor() {
    this.id = 0;
    this.name = '';
    this.type = '';
    this.address = '';
    this.phone = '';
    this.description = '';
  }
}
