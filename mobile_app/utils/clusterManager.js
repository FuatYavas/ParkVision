/**
 * Clustering utility for parking lots
 * Groups nearby parking lots when zoomed out
 * Native implementation for Expo compatibility
 */
export class ClusterManager {
    constructor() {
        this.points = [];
        this.radius = 0.01; // Clustering radius in degrees (~1km)
    }

    /**
     * Load parking lots into clustering system
     * @param {Array} parkingLots - Array of parking lot objects
     */
    load(parkingLots) {
        this.points = parkingLots.map(lot => ({
            id: lot.id,
            latitude: lot.latitude,
            longitude: lot.longitude,
            properties: lot
        }));
    }

    /**
     * Get clusters for current map region
     * @param {Object} region - Map region with lat, lng, zoom
     * @returns {Array} Array of clusters and individual points
     */
    getClusters(region) {
        if (!region || !this.points.length) return [];
        
        const zoom = this.getZoomLevel(region);
        
        // If zoomed in enough, return individual points
        if (zoom > 13) {
            return this.points.map(point => ({
                type: 'Feature',
                geometry: {
                    coordinates: [point.longitude, point.latitude]
                },
                properties: {
                    cluster: false,
                    ...point.properties
                }
            }));
        }
        
        // Simple clustering algorithm
        const clusters = [];
        const processed = new Set();
        
        this.points.forEach((point, i) => {
            if (processed.has(i)) return;
            
            const nearby = [];
            this.points.forEach((other, j) => {
                if (i === j || processed.has(j)) return;
                
                const distance = this.getDistance(
                    point.latitude, point.longitude,
                    other.latitude, other.longitude
                );
                
                if (distance < this.radius) {
                    nearby.push(j);
                }
            });
            
            if (nearby.length > 0) {
                // Create cluster
                nearby.push(i);
                nearby.forEach(idx => processed.add(idx));
                
                const avgLat = nearby.reduce((sum, idx) => sum + this.points[idx].latitude, 0) / nearby.length;
                const avgLng = nearby.reduce((sum, idx) => sum + this.points[idx].longitude, 0) / nearby.length;
                
                clusters.push({
                    type: 'Feature',
                    geometry: {
                        coordinates: [avgLng, avgLat]
                    },
                    properties: {
                        cluster: true,
                        cluster_id: i,
                        point_count: nearby.length
                    }
                });
            } else {
                // Individual point
                processed.add(i);
                clusters.push({
                    type: 'Feature',
                    geometry: {
                        coordinates: [point.longitude, point.latitude]
                    },
                    properties: {
                        cluster: false,
                        ...point.properties
                    }
                });
            }
        });
        
        return clusters;
    }

    /**
     * Calculate zoom level from region
     */
    getZoomLevel(region) {
        const { longitudeDelta } = region;
        const zoom = Math.round(Math.log(360 / longitudeDelta) / Math.LN2);
        return Math.min(zoom, 20);
    }
    
    /**
     * Calculate distance between two points (Haversine formula)
     */
    getDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    /**
     * Get children of a cluster
     */
    getClusterExpansionZoom(clusterId) {
        return 15;
    }

    /**
     * Get leaves (individual points) of a cluster
     */
    getLeaves(clusterId, limit = 10) {
        return this.points.slice(0, limit);
    }
}

// Export singleton instance
export default new ClusterManager();
