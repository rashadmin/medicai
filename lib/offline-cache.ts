interface CachedHospital {
  id: string
  name: string
  address: string
  phone: string
  distance: number
  type: string
  hasAmbulance: boolean
  lat: number
  lng: number
  cachedAt: number
}

interface CachedLocation {
  lat: number
  lng: number
  city?: string
  state?: string
  country?: string
  accuracy: string
  cachedAt: number
}

export class OfflineCache {
  private static readonly HOSPITALS_KEY = "medic-ai-cached-hospitals"
  private static readonly LOCATION_KEY = "medic-ai-cached-location"
  private static readonly SYNC_KEY = "medic-ai-last-sync"
  private static readonly MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000 // 7 days

  static cacheHospitals(hospitals: any[], location: any) {
    try {
      const cachedHospitals: CachedHospital[] = hospitals.map((hospital) => ({
        id: hospital.id,
        name: hospital.name,
        address: hospital.address,
        phone: hospital.phone,
        distance: hospital.distance,
        type: hospital.type,
        hasAmbulance: hospital.hasAmbulance,
        lat: hospital.lat,
        lng: hospital.lng,
        cachedAt: Date.now(),
      }))

      localStorage.setItem(this.HOSPITALS_KEY, JSON.stringify(cachedHospitals))

      // Cache location
      if (location) {
        const cachedLocation: CachedLocation = {
          lat: location.lat,
          lng: location.lng,
          city: location.city,
          state: location.state,
          country: location.country,
          accuracy: location.accuracy || "unknown",
          cachedAt: Date.now(),
        }
        localStorage.setItem(this.LOCATION_KEY, JSON.stringify(cachedLocation))
      }

      // Update sync time
      localStorage.setItem(this.SYNC_KEY, JSON.stringify(Date.now()))

      console.log(`Cached ${cachedHospitals.length} hospitals for offline use`)
    } catch (error) {
      console.error("Error caching hospitals:", error)
    }
  }

  static getCachedHospitals(): CachedHospital[] {
    try {
      const cached = localStorage.getItem(this.HOSPITALS_KEY)
      if (!cached) return []

      const hospitals: CachedHospital[] = JSON.parse(cached)

      // Filter out expired cache entries
      const validHospitals = hospitals.filter((hospital) => Date.now() - hospital.cachedAt < this.MAX_CACHE_AGE)

      // Update cache if we filtered out expired entries
      if (validHospitals.length !== hospitals.length) {
        localStorage.setItem(this.HOSPITALS_KEY, JSON.stringify(validHospitals))
      }

      return validHospitals
    } catch (error) {
      console.error("Error loading cached hospitals:", error)
      return []
    }
  }

  static getCachedLocation(): CachedLocation | null {
    try {
      const cached = localStorage.getItem(this.LOCATION_KEY)
      if (!cached) return null

      const location: CachedLocation = JSON.parse(cached)

      // Check if cache is expired
      if (Date.now() - location.cachedAt > this.MAX_CACHE_AGE) {
        localStorage.removeItem(this.LOCATION_KEY)
        return null
      }

      return location
    } catch (error) {
      console.error("Error loading cached location:", error)
      return null
    }
  }

  static getLastSyncTime(): Date | null {
    try {
      const cached = localStorage.getItem(this.SYNC_KEY)
      if (!cached) return null

      return new Date(JSON.parse(cached))
    } catch (error) {
      console.error("Error loading sync time:", error)
      return null
    }
  }

  static clearCache() {
    try {
      localStorage.removeItem(this.HOSPITALS_KEY)
      localStorage.removeItem(this.LOCATION_KEY)
      localStorage.removeItem(this.SYNC_KEY)
      console.log("Offline cache cleared")
    } catch (error) {
      console.error("Error clearing cache:", error)
    }
  }

  static getCacheSize(): { hospitals: number; hasLocation: boolean; lastSync: Date | null } {
    return {
      hospitals: this.getCachedHospitals().length,
      hasLocation: this.getCachedLocation() !== null,
      lastSync: this.getLastSyncTime(),
    }
  }
}
