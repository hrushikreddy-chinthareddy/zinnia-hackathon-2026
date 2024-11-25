import usePomExperience from '@deps/hooks/usePomExperience';

export default function POM() {
    const isPomExperienceFeatureFlagEnabled = usePomExperience();
    if (!isPomExperienceFeatureFlagEnabled) {
        return null;
    }
    return <div>POM Page</div>;
}
