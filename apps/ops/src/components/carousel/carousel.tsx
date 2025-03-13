import { Button } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import { FC, ReactNode, useCallback, useEffect, useState } from 'react';

import styles from './carousel.module.css';

interface CarouselProps {
    slides: ReactNode[];
    slideStyle?: string;
    emblaOptions?: EmblaOptionsType;
    containerHeight?: string;
    controls?: {
        controlClasses?: {
            prevClasses?: string;
            nextClasses?: string;
        };
        prevLabel: string;
        nextLabel: string;
        firstLabel?: string;
        lastLabel?: string;
    };
    slideItemsCount?: { start: number; end: number; total: number }[];
    bottomContent?: ReactNode;
}

const defaultOptions: EmblaOptionsType = {
    loop: false,
    axis: 'y',
};

const defaultControlsOptions = {
    controlClasses: {
        prevClasses: '',
        nextClasses: '',
    },
    firstLabel: 'First',
    prevLabel: 'Prev',
    nextLabel: 'Next',
    lastLabel: 'Last',
};

export const Carousel: FC<CarouselProps> = ({
    slides,
    slideStyle,
    emblaOptions = defaultOptions,
    containerHeight = '350px',
    controls = defaultControlsOptions,
    slideItemsCount = [],
    bottomContent,
}) => {
    const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions);
    const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
    const [nextBtnDisabled, setNextBtnDisabled] = useState(true);
    const [selectedSlide, setSelectedSlide] = useState(0);

    const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
        setPrevBtnDisabled(!emblaApi.canScrollPrev());
        setNextBtnDisabled(!emblaApi.canScrollNext());
        setSelectedSlide(emblaApi.selectedScrollSnap());
    }, []);

    useEffect(() => {
        if (!emblaApi) return;

        onSelect(emblaApi);
        emblaApi.on('reInit', onSelect).on('select', onSelect);
    }, [emblaApi, onSelect]);
    return (
        <>
            <div className={styles.embla}>
                <div className={styles.emblaViewport} ref={emblaRef}>
                    <div
                        className={clsx(styles.emblaContainer, { [styles.vertical]: emblaOptions?.axis === 'y' })}
                        style={{ height: containerHeight }}
                    >
                        {slides.map((slide, index) => {
                            return (
                                <div key={index} className={clsx([styles.emblaSlide, slideStyle])}>
                                    {slide}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            {bottomContent && bottomContent}

            <div className={styles.controlsContainer}>
                {controls?.firstLabel && (
                    <Button
                        disabled={prevBtnDisabled}
                        mode="link"
                        size="small"
                        className={clsx(styles.first, [controls?.controlClasses?.prevClasses])}
                        onClick={() => emblaApi?.scrollTo(0)}
                    >
                        {controls?.firstLabel}
                    </Button>
                )}

                <Button
                    mode="link"
                    disabled={prevBtnDisabled}
                    size="small"
                    className={clsx(styles.prev, [controls?.controlClasses?.prevClasses])}
                    onClick={() => emblaApi?.scrollPrev()}
                >
                    {controls?.prevLabel}
                </Button>
                <Button
                    disabled={nextBtnDisabled}
                    mode="link"
                    size="small"
                    className={clsx(styles.next, [controls?.controlClasses?.nextClasses])}
                    onClick={() => emblaApi?.scrollNext()}
                >
                    {controls?.nextLabel}
                </Button>
                {controls?.lastLabel && (
                    <Button
                        disabled={nextBtnDisabled}
                        mode="link"
                        size="small"
                        className={clsx(styles.last, [controls?.controlClasses?.nextClasses])}
                        onClick={() => emblaApi?.scrollTo(slides.length - 1)}
                    >
                        {controls?.lastLabel}
                    </Button>
                )}

                {slideItemsCount.length > 0 && (
                    <span className={clsx('typography-labels-label-md', styles.pageNumber)}>
                        {slideItemsCount?.[selectedSlide]?.start}-{slideItemsCount?.[selectedSlide]?.end} of{' '}
                        {slideItemsCount?.[selectedSlide]?.total}
                    </span>
                )}
            </div>
        </>
    );
};
