export const getBeneficiaryColor = (index: number) => {
    if (index === 9) {
        return 'bg-lime-300';
    } else if (index === 8) {
        return 'bg-aqua-800';
    } else if (index === 7) {
        return 'bg-gray-500';
    } else if (index === 6) {
        return 'bg-yellow-800';
    } else if (index === 5) {
        return 'bg-cerulean-600';
    } else if (index === 4) {
        return 'bg-orange-500';
    } else if (index === 3) {
        return 'bg-aqua-400';
    } else if (index === 2) {
        return 'bg-red-600';
    } else if (index === 1) {
        return 'bg-yellow-400';
    } else {
        return 'bg-fuchsia-600';
    }
};

export const getContigentColor = (index: number) => {
    if (index === 5) {
        return 'bg-fuchsia-400';
    } else if (index === 4) {
        return 'bg-cerulean-400';
    } else if (index === 3) {
        return 'bg-primary';
    } else if (index === 2) {
        return 'bg-lime-400';
    } else if (index === 1) {
        return 'bg-red-400';
    } else {
        return 'bg-yellow-300';
    }
};
