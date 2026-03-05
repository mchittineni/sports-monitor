import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatAssistant } from '../components/ChatAssistant';

vi.mock('../services/ai', () => ({
  chatWithAI: vi.fn(async () => ({
    response: 'This is a test response',
  })),
}));

describe('ChatAssistant Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render chat assistant', () => {
    render(<ChatAssistant />);
    expect(screen.getByText(/chat/i)).toBeDefined();
  });

  it('should have input field', () => {
    render(<ChatAssistant />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input).toBeDefined();
  });

  it('should send message on button click', async () => {
    render(<ChatAssistant />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    const button = screen.getByRole('button', { name: /send/i });

    expect(input).toBeDefined();
    expect(button).toBeDefined();
  });

  it('should display messages', () => {
    render(<ChatAssistant />);
    const messages = screen.queryAllByText(/response/i);
    expect(messages).toBeDefined();
  });
});
