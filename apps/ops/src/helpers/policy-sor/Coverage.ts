import { CoverageLayer, CoverageParticipants, RiderType, Policy, PolicyCoverage } from '@zinnia/api-types/types/sor';

export class Coverage {
    private coverage: PolicyCoverage;
    private coverageLayerById: Record<string, CoverageLayer> = {};
    private coverageLayerByType: Record<string, CoverageLayer> = {};
    public allCoverageParticipants: CoverageParticipants[] = [];
    private coverageParticipantByPartyId: Record<string, CoverageParticipants> = {};
    constructor({ coverage = {} }: Policy = {}) {
        this.coverage = coverage;
        coverage?.coverageLayers?.forEach(coverageLayer => {
            if (coverageLayer.coverageId) {
                this.coverageLayerById[coverageLayer.coverageId] = coverageLayer;
            }
            if (coverageLayer.coverageType) {
                this.coverageLayerByType[coverageLayer.coverageType] = coverageLayer;
            }
            // BPB - this assumes that coverageParticipants won't be duplicated across coverageLayers.  Potentially a bad assumption, and may be worth reworking in the future
            if (coverageLayer.coverageParticipants) {
                coverageLayer.coverageParticipants.forEach(coverageParticipant => {
                    this.allCoverageParticipants.push(coverageParticipant);
                    if (coverageParticipant.partyId) {
                        this.coverageParticipantByPartyId[coverageParticipant.partyId] = coverageParticipant;
                    }
                });
            }
        });
    }

    public getCoverageLayerById(id: string | undefined): CoverageLayer | undefined {
        if (!id) {
            return;
        }
        return this.coverageLayerById[id];
    }

    public getCoverageLayerByType(coverageType: RiderType | undefined): CoverageLayer | undefined {
        if (!coverageType) {
            return undefined;
        }
        return this.coverageLayerByType[coverageType];
    }

    public getCoverageParticipantByPartyId(partyId: string | undefined): CoverageParticipants | undefined {
        if (!partyId) {
            return;
        }
        return this.coverageParticipantByPartyId[partyId];
    }

    public get baseDeathBenefit(): number | undefined {
        return this.coverage.totalCoverageAmount;
    }

    public get faceValue(): number | undefined {
        return this.coverage.totalCoverageAmount;
    }
}
