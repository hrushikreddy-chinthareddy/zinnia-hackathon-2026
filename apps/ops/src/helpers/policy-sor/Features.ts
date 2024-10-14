import { PolicyFeature, PolicyFeatureFeatureType } from '@deps/models/policy/sor-policy';

export class Features {
    public featuresByType: Record<string, PolicyFeature[]> = {};
    public policyFeatures: PolicyFeature[] = [];

    constructor(features: PolicyFeature[] = []) {
        this.policyFeatures = features;
        features.forEach(feature => {
            if (!feature.featureType) {
                return;
            }
            const cappedFeatureType = feature.featureType.toUpperCase();
            if (!this.featuresByType[cappedFeatureType]) {
                this.featuresByType[cappedFeatureType] = [];
            }
            this.featuresByType[cappedFeatureType].push(feature);
        });
    }

    public getFeaturesByType(featureType: PolicyFeatureFeatureType): PolicyFeature[] {
        if (!featureType) {
            return [];
        }
        return this.featuresByType[featureType.toUpperCase()] ?? [];
    }

    public getFirstFeatureByType(featureType: PolicyFeatureFeatureType): PolicyFeature | undefined {
        if (!featureType) {
            return undefined;
        }
        return this.getFeaturesByType(featureType)?.[0];
    }

    public get all(): PolicyFeature[] {
        return this.policyFeatures;
    }
}
