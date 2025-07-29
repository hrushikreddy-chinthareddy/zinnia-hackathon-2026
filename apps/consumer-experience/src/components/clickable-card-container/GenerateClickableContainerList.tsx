import { IconType, Icon } from '@zinnia/bloom/components';
import { toSentenceCase } from '@zinnia/utils';
import { FC } from 'react';

import { ClickableCardContainer } from './ClickableCardContainer';

interface ClickableCardLink {
  url: string;
  urlLabel: string;
  isInternal?: boolean;
  iconType?: IconType;
  linkText: string;
  visibility?: boolean;
}

interface GenerateClickableContainerListProps {
  links: ClickableCardLink[];
}

/**
 * Renders a list of clickable containers from a list of links.
 *
 * @param props - links to render
 * @returns A list of clickable cards
 */
export const GenerateClickableContainerList: FC<
  GenerateClickableContainerListProps
> = ({ links }) => {
  return (
    <>
      {links.map(({ visibility = true, ...link }, index) => {
        if (!visibility) {
          return null;
        }
        return (
          <ClickableCardContainer key={index}>
            <ClickableCardContainer.LinkContent
              linkTo={{
                url: link.url,
                label: link.urlLabel,
                isInternal: link.isInternal,
              }}
            >
              <div className="flex-center">
                {link.iconType && (
                  <Icon
                    type={link.iconType}
                    color="var(--color-base-icon-icon-dark)"
                  />
                )}

                <span className="typography-labels-field-label ml-md">
                  {toSentenceCase(link.linkText)}
                </span>
              </div>
            </ClickableCardContainer.LinkContent>
          </ClickableCardContainer>
        );
      })}
    </>
  );
};
