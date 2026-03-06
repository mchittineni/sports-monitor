import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import LiveSportsTVPanel from '../components/LiveSportsTVPanel';

describe('LiveSportsTVPanel', () => {
  it('renders the Live Sports TV panel title', () => {
    render(<LiveSportsTVPanel />);
    expect(screen.getByText('📺 Live Sports TV')).toBeInTheDocument();
  });

  it('renders the initial active channel (Sky Sports News)', () => {
    render(<LiveSportsTVPanel />);
    const iframe = screen.getByTitle('Sky Sports News Live Stream');
    expect(iframe).toBeInTheDocument();
  });

  it('changes the active channel when another channel button is clicked', () => {
    render(<LiveSportsTVPanel />);

    // Click on CBS Sports HQ
    const cbsButton = screen.getByText('CBS Sports HQ');
    fireEvent.click(cbsButton);

    const iframe = screen.getByTitle('CBS Sports HQ Live Stream');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute(
      'src',
      expect.stringContaining('K1xwWEq2MHg')
    ); // Check fallback ID
  });

  it('toggles playback state when Live/Paused button is clicked', () => {
    render(<LiveSportsTVPanel />);

    // Initial state: Live (playing)
    const playButton = screen.getByText('Live');
    expect(playButton).toBeInTheDocument();

    // The iframe has autoplay=1 initially
    let iframe = screen.getByTitle('Sky Sports News Live Stream');
    expect(iframe).toHaveAttribute(
      'src',
      expect.stringContaining('autoplay=1')
    );

    // Pause it
    fireEvent.click(playButton);

    // It should now say Paused
    expect(screen.getByText('Playback paused')).toBeInTheDocument();
    expect(screen.getByText('Paused')).toBeInTheDocument();

    // Play it again
    fireEvent.click(screen.getByText('Paused'));

    // Iframe returns
    iframe = screen.getByTitle('Sky Sports News Live Stream');
    expect(iframe).toHaveAttribute(
      'src',
      expect.stringContaining('autoplay=1')
    );
  });

  it('toggles mute state when mute button is clicked', () => {
    render(<LiveSportsTVPanel />);

    // By default it is muted (mute=1)
    let iframe = screen.getByTitle('Sky Sports News Live Stream');
    expect(iframe).toHaveAttribute('src', expect.stringContaining('mute=1'));

    // Get mute button (title "Unmute")
    const muteButton = screen.getByTitle('Unmute');
    fireEvent.click(muteButton);

    // Check if URL now has mute=0
    iframe = screen.getByTitle('Sky Sports News Live Stream');
    expect(iframe).toHaveAttribute('src', expect.stringContaining('mute=0'));

    // The title changes to "Mute"
    expect(screen.getByTitle('Mute')).toBeInTheDocument();
  });
});
