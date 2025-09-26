import { fireEvent, render, waitFor } from "@testing-library/react";

import { DEFAULT_LOCALE } from "@deps/helpers/routing.helpers";
import { DislikeReasonsPayload } from "@deps/types/knowledge-base";

import DislikeReasons from "./dislike-reasons";

const defaultDislikeReason: DislikeReasonsPayload = {
  reason: '',
  links: null,
  metadata: null
};

const mockBrowserLogError = jest.fn();
const mockBrowserLogTrace = jest.fn();

jest.mock('@deps/utils/browser-logging', () => {
  return {
    browserLogError: (...args: any[]) => mockBrowserLogError(...args),
    browserLogTrace: (...args: any[]) => mockBrowserLogTrace(...args),
  };
});

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: DEFAULT_LOCALE,
    },
  }),
}));

describe('DislikeReasons', () => {
  let onDislikeReasonChange: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    onDislikeReasonChange = jest.fn();
  });

  it('renders all radio options', () => {
    const { getByLabelText } = render(
      <DislikeReasons
        dislikeReason={defaultDislikeReason}
        onDislikeReasonChange={onDislikeReasonChange}
      />
    );

    expect(getByLabelText('chat.feedback.dislikeReasons.incorrectResponse')).toBeInTheDocument();
    expect(getByLabelText('chat.feedback.dislikeReasons.languageIssue')).toBeInTheDocument();
    expect(getByLabelText('chat.feedback.dislikeReasons.relevantDocumentMissing')).toBeInTheDocument();
    expect(getByLabelText('chat.feedback.dislikeReasons.infoMissing')).toBeInTheDocument();
  });

  it('selects a radio option and calls onDislikeReasonChange', async () => {
    const { getByLabelText } = render(
      <DislikeReasons
        dislikeReason={defaultDislikeReason}
        onDislikeReasonChange={onDislikeReasonChange}
      />
    );

    const firstRadio = getByLabelText('chat.feedback.dislikeReasons.incorrectResponse');
    fireEvent.click(firstRadio);

    await waitFor(() => {
      expect(onDislikeReasonChange).toHaveBeenCalledWith(
        expect.objectContaining({ reason: expect.any(String) })
      );
    });
  });

  it('renders links input when incorrectResponse is selected and updates payload', async () => {
    const { getByLabelText } = render(
      <DislikeReasons
        dislikeReason={defaultDislikeReason}
        onDislikeReasonChange={onDislikeReasonChange}
      />
    );

    const radio = getByLabelText('chat.feedback.dislikeReasons.incorrectResponse');
    fireEvent.click(radio);

    const linksInput = getByLabelText('chat.feedback.dislikeReasons.linksLabel');
    fireEvent.change(linksInput, { target: { value: 'https://example.com/doc1' } });

    await waitFor(() => {
      expect(onDislikeReasonChange).toHaveBeenCalledWith(
        expect.objectContaining({
          reason: expect.any(String),
          links: ['https://example.com/doc1']
        })
      );
    });
  });

  it('renders links input when relevantDocumentMissing is selected', async () => {
    const { getByLabelText } = render(
      <DislikeReasons
        dislikeReason={defaultDislikeReason}
        onDislikeReasonChange={onDislikeReasonChange}
      />
    );

    const radio = getByLabelText('chat.feedback.dislikeReasons.relevantDocumentMissing');
    fireEvent.click(radio);

    const linksInput = getByLabelText('chat.feedback.dislikeReasons.linksLabel');
    expect(linksInput).toBeInTheDocument();
  });

  it('opens OpsIntakeForm modal when infoMissing radio is selected and button is clicked', async () => {
    const { getByLabelText, getByText } = render(
      <DislikeReasons
        dislikeReason={defaultDislikeReason}
        onDislikeReasonChange={onDislikeReasonChange}
      />
    );

    const radio = getByLabelText('chat.feedback.dislikeReasons.infoMissing');
    fireEvent.click(radio);

    const opsFormButton = getByLabelText('ops-intake-form-btn');
    fireEvent.click(opsFormButton);

    await waitFor(() => {
      expect(getByText(/X/)).toBeVisible();
    });
  });

  it('closes OpsIntakeForm modal when modal close button is clicked', async () => {
    const { getByLabelText, getByText, queryByText } = render(
      <DislikeReasons
        dislikeReason={defaultDislikeReason}
        onDislikeReasonChange={onDislikeReasonChange}
      />
    );

    const radio = getByLabelText('chat.feedback.dislikeReasons.infoMissing');
    fireEvent.click(radio);

    const opsFormButton = getByLabelText('ops-intake-form-btn');
    fireEvent.click(opsFormButton);

    await waitFor(() => {
      expect(getByText(/X/)).toBeVisible();
    });

    const closeButton = getByText('X');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(queryByText('X')).not.toBeInTheDocument();
    });
  });

})