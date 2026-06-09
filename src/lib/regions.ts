export interface District {
  value: string
  label: string
}

export interface Division {
  value: string
  label: string
  districts: District[]
}

export const DIVISIONS: Division[] = [
  {
    value: 'dhaka',
    label: 'Dhaka',
    districts: [
      { value: 'dhaka', label: 'Dhaka' },
      { value: 'gazipur', label: 'Gazipur' },
      { value: 'narayanganj', label: 'Narayanganj' },
      { value: 'narsingdi', label: 'Narsingdi' },
      { value: 'munshiganj', label: 'Munshiganj' },
      { value: 'manikganj', label: 'Manikganj' },
      { value: 'tangail', label: 'Tangail' },
      { value: 'kishoreganj', label: 'Kishoreganj' },
      { value: 'faridpur', label: 'Faridpur' },
      { value: 'madaripur', label: 'Madaripur' },
      { value: 'gopalganj', label: 'Gopalganj' },
      { value: 'rajbari', label: 'Rajbari' },
      { value: 'shariatpur', label: 'Shariatpur' },
    ],
  },
  {
    value: 'chittagong',
    label: 'Chittagong',
    districts: [
      { value: 'chittagong', label: 'Chittagong' },
      { value: 'coxs_bazar', label: "Cox's Bazar" },
      { value: 'rangamati', label: 'Rangamati' },
      { value: 'bandarban', label: 'Bandarban' },
      { value: 'khagrachari', label: 'Khagrachari' },
      { value: 'feni', label: 'Feni' },
      { value: 'comilla', label: 'Comilla' },
      { value: 'brahmanbaria', label: 'Brahmanbaria' },
      { value: 'chandpur', label: 'Chandpur' },
      { value: 'lakshmipur', label: 'Lakshmipur' },
      { value: 'noakhali', label: 'Noakhali' },
    ],
  },
  {
    value: 'rajshahi',
    label: 'Rajshahi',
    districts: [
      { value: 'rajshahi', label: 'Rajshahi' },
      { value: 'chapainawabganj', label: 'Chapainawabganj' },
      { value: 'natore', label: 'Natore' },
      { value: 'naogaon', label: 'Naogaon' },
      { value: 'bogra', label: 'Bogra' },
      { value: 'joypurhat', label: 'Joypurhat' },
      { value: 'sirajganj', label: 'Sirajganj' },
      { value: 'pabna', label: 'Pabna' },
    ],
  },
  {
    value: 'khulna',
    label: 'Khulna',
    districts: [
      { value: 'khulna', label: 'Khulna' },
      { value: 'bagerhat', label: 'Bagerhat' },
      { value: 'satkhira', label: 'Satkhira' },
      { value: 'jessore', label: 'Jessore' },
      { value: 'magura', label: 'Magura' },
      { value: 'narail', label: 'Narail' },
      { value: 'jhenaidah', label: 'Jhenaidah' },
      { value: 'chuadanga', label: 'Chuadanga' },
      { value: 'kushtia', label: 'Kushtia' },
      { value: 'meherpur', label: 'Meherpur' },
    ],
  },
  {
    value: 'sylhet',
    label: 'Sylhet',
    districts: [
      { value: 'sylhet', label: 'Sylhet' },
      { value: 'moulvibazar', label: 'Moulvibazar' },
      { value: 'habiganj', label: 'Habiganj' },
      { value: 'sunamganj', label: 'Sunamganj' },
    ],
  },
  {
    value: 'barisal',
    label: 'Barisal',
    districts: [
      { value: 'barisal', label: 'Barisal' },
      { value: 'bhola', label: 'Bhola' },
      { value: 'patuakhali', label: 'Patuakhali' },
      { value: 'barguna', label: 'Barguna' },
      { value: 'pirojpur', label: 'Pirojpur' },
      { value: 'jhalokati', label: 'Jhalokati' },
    ],
  },
  {
    value: 'rangpur',
    label: 'Rangpur',
    districts: [
      { value: 'rangpur', label: 'Rangpur' },
      { value: 'dinajpur', label: 'Dinajpur' },
      { value: 'gaibandha', label: 'Gaibandha' },
      { value: 'kurigram', label: 'Kurigram' },
      { value: 'nilphamari', label: 'Nilphamari' },
      { value: 'lalmonirhat', label: 'Lalmonirhat' },
      { value: 'thakurgaon', label: 'Thakurgaon' },
      { value: 'panchagarh', label: 'Panchagarh' },
    ],
  },
  {
    value: 'mymensingh',
    label: 'Mymensingh',
    districts: [
      { value: 'mymensingh', label: 'Mymensingh' },
      { value: 'netrokona', label: 'Netrokona' },
      { value: 'jamalpur', label: 'Jamalpur' },
      { value: 'sherpur', label: 'Sherpur' },
    ],
  },
]

export function getDistrictsByDivision(divisionValue: string): District[] {
  return DIVISIONS.find((d) => d.value === divisionValue)?.districts ?? []
}

export function getDivisionLabel(divisionValue: string): string {
  return DIVISIONS.find((d) => d.value === divisionValue)?.label ?? divisionValue
}

export function getDistrictLabel(divisionValue: string, districtValue: string): string {
  return (
    DIVISIONS.find((d) => d.value === divisionValue)
      ?.districts.find((d) => d.value === districtValue)?.label ?? districtValue
  )
}
