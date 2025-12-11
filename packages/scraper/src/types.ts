export interface College {
  school: string
  city: string
  state: string
  type: string
  conference: string
  division: string
}

export interface CollegeMetadata {
  lastUpdated: string
  totalCount: number
}

export interface CollegeResponse {
  colleges: College[]
  metadata: CollegeMetadata
}

export interface CollegeSearchResponse {
  colleges: College[]
  count: number
}

export interface CollegeStats {
  total: number
  byDivision: Record<string, number>
  byState: Record<string, number>
  byType: Record<string, number>
  topStates: Array<{ state: string; count: number }>
}
