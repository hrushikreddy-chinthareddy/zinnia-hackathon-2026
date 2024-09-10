import { Badge, BadgeProps } from '@zinnia/bloom/components';

import { toSentenceCase } from '@deps/helpers/string.helper';

export const StatusBadge = ({ label, ...props }: BadgeProps) => <Badge label={toSentenceCase(label)} {...props} />;
