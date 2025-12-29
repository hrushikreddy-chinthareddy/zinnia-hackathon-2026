import { render } from '@testing-library/react';

import AiLogo from './ai-logo';

describe('AiLogo', () => {
    it('renders a video element', () => {
        const { container } = render(<AiLogo />);
        const video = container.querySelector('video');
        expect(video).toBeInTheDocument();
    });

    it('renders video with default props', () => {
        const { container } = render(<AiLogo />);
        const video = container.querySelector('video') as HTMLVideoElement;

        expect(video).toBeInTheDocument();
        expect(video.src).toContain('/images/logos/zinnia-logo.webm');
        expect(video.autoplay).toBe(true);
        expect(video.loop).toBe(true);
        expect(video.muted).toBe(true);
        expect(video.playsInline).toBe(true);
        expect(video.style.width).toBe('30px');
        expect(video.style.height).toBe('30px');
    });

    it('applies custom width and height', () => {
        const { container } = render(<AiLogo width="100px" height="150px" />);
        const video = container.querySelector('video') as HTMLVideoElement;

        expect(video.style.width).toBe('100px');
        expect(video.style.height).toBe('150px');
    });

    it('applies custom autoPlay prop', () => {
        const { container, rerender } = render(<AiLogo autoPlay={true} />);
        let video = container.querySelector('video') as HTMLVideoElement;
        expect(video.autoplay).toBe(true);

        rerender(<AiLogo autoPlay={false} />);
        video = container.querySelector('video') as HTMLVideoElement;
        expect(video.autoplay).toBe(false);
    });

    it('applies custom loop prop', () => {
        const { container, rerender } = render(<AiLogo loop={true} />);
        let video = container.querySelector('video') as HTMLVideoElement;
        expect(video.loop).toBe(true);

        rerender(<AiLogo loop={false} />);
        video = container.querySelector('video') as HTMLVideoElement;
        expect(video.loop).toBe(false);
    });

    it('always has muted and playsInline attributes', () => {
        const { container } = render(<AiLogo />);
        const video = container.querySelector('video') as HTMLVideoElement;

        expect(video.muted).toBe(true);
        expect(video.playsInline).toBe(true);
    });

    it('uses the correct video source', () => {
        const { container } = render(<AiLogo />);
        const video = container.querySelector('video') as HTMLVideoElement;

        expect(video.src).toContain('/images/logos/zinnia-logo.webm');
    });
});
