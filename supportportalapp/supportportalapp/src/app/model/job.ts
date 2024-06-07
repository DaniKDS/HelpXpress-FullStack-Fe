export class Job {
  id: number;
  name: string;
  description: string;
  region: string;
  county: string;
  city: string;
  accessibilityFeatures: string;
  isDedicatedForDisability: boolean;
  disabilityType: string;
  employmentType: string;
  salaryRange: string;
  postingDate: Date | null;
  isRemote: boolean;
  employerId: string;
  employerName: string;
  employerPhone: string;
  status: string;

  constructor() {
    this.id = 0;
    this.name = '';
    this.description = '';
    this.region = '';
    this.county = '';
    this.city = '';
    this.accessibilityFeatures = '';
    this.isDedicatedForDisability = false;
    this.disabilityType = '';
    this.employmentType = '';
    this.salaryRange = '';
    this.postingDate = null;
    this.isRemote = false;
    this.employerId = '';
    this.employerName = '';
    this.employerPhone = '';
    this.status = '';
  }
}
