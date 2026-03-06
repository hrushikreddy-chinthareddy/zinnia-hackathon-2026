import { isEndDated } from '@deps/helpers/date.helpers';
import { PolicyFeature, FeatureType } from '@zinnia/api-types/types/sor';

export class Features {
    public featuresByType: Record<string, PolicyFeature[]> = {};
    public policyFeatures: PolicyFeature[] = [];

    constructor(features: PolicyFeature[] = []) {
        this.policyFeatures = features;
        features.forEach((feature) => {
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

    public getFeaturesByType(featureType: FeatureType): PolicyFeature[] {
        if (!featureType) {
            return [];
        }
        return this.featuresByType[featureType.toUpperCase()] ?? [];
    }

    public getFirstFeatureByType(
        featureType: FeatureType
    ): PolicyFeature | undefined {
        if (!featureType) {
            return undefined;
        }
        const features = this.getFeaturesByType(featureType);
        const active = features.filter((f) => !isEndDated(f.endDate));
        return active?.[0] ?? features?.[0] ?? undefined;
    }

    public get all(): PolicyFeature[] {
        return this.policyFeatures;
    }
}
