import { Badge, BadgeProps } from '@zinnia/bloom/components';

import { toSentenceCase } from '@deps/helpers/string.helpers';

export const StatusBadge = ({ label, ...props }: BadgeProps) => <Badge label={toSentenceCase(label)} {...props} />;
