import { Frequency } from "@xd/api-types/dist/generated-types/bpm";
import { toSentenceCase } from "@xd/utils/dist";

export const getFrequencyText = (frequency: Frequency) => {
  let str = 'Every ';
  switch (frequency) {
    case Frequency.ANNUAL:
      str += 'year';
      break;
    case Frequency.MONTHLY:
      str += 'month';
      break;
    case Frequency.SEMIANNUAL:
      str += '6 months';
      break;
    case Frequency.QUARTERLY:
      str += '3 months';
      break;
  }

  return toSentenceCase(str);
};

