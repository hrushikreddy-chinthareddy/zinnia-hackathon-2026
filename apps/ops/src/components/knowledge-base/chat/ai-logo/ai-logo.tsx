const AiLogo = ({
    width = '30px',
    height = '30px',
    autoPlay = true,
    loop = true,
}) => {
    return (
        <video
            src="/images/logos/zinnia-logo.webm"
            autoPlay={autoPlay}
            loop={loop}
            muted
            playsInline
            style={{ width, height }}
        />
    );
};

export default AiLogo;
