import { render } from "@testing-library/react"

import ChatQuestion from "./chat-question"

describe('ChatQuestion', () => {
  it('renders the chat question and avatar', () => {
    const { getByTestId, getByText } = render(<ChatQuestion question="Hello, chatbot!" />)
    expect(getByText("Hello, chatbot!")).toBeInTheDocument()
    expect(getByTestId("question-avatar")).toBeInTheDocument()
  })
})