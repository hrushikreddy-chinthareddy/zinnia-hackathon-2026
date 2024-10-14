import { Root, createRoot } from 'react-dom/client';
import resolveConfig from 'tailwindcss/resolveConfig';

import myConfig from '../../tailwind.config';

const fullConfig = resolveConfig(myConfig);

type CssMeasurementUnit = 'px' | 'em' | 'rem' | '%' | 'vh' | 'vw' | 'vmin' | 'vmax';
export type CssValue = `${number}${CssMeasurementUnit}`;

/**
 * Get the maximum width (in pixels) among a set of JSX elements.
 * TODO: Add more units if necessary
 *
 * @param {JSX.Element[]} elements - The elements to measure.
 * @returns {Promise<number>} - A promise that resolves with the maximum width.
 */
export const getMaximumWidth = (elements: JSX.Element[]): Promise<number> =>
    new Promise((resolve, reject) => {
        let root: Root;
        try {
            // Create a temporary div to hold the elements
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            document.body.appendChild(tempDiv);

            // Render the elements to the temporary div
            elements.forEach(element => {
                const container = document.createElement('div');
                tempDiv.appendChild(container);
                root = createRoot(container);
                root.render(element);
            });

            // Wait for the next frame to ensure all elements have been rendered
            requestAnimationFrame(() => {
                // Find the maximum width among the rendered elements
                const maxWidth = Array.from(tempDiv.children).reduce(
                    (maxWidth, child) => Math.max(maxWidth, child.getBoundingClientRect().width),
                    0
                );

                // Clean up by unmounting the rendered elements and removing the temporary div
                root.unmount();
                document.body.removeChild(tempDiv);

                // Resolve the promise with the maximum width
                resolve(maxWidth);
            });
        } catch (error) {
            reject(new Error('An error occurred while calculating the maximum width'));
        }
    });

export default fullConfig;
