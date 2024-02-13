const accentColorGradientLinear = {
           type: 'Linear',
            direction: {
             from: {x: 0, y: 0.5 },
             to:   {x: 1, y: 0.5 },
           },
            stops: [
             {
               color: "#ffc600",
               position: 0
             },
             {
               color: "#ff7500",
               position: 0.7554000020027161
             },
             {
               color: "#ff1822",
               position: 1
             },
           ],
         };
const accentColorGradientDiagonal = {
           type: 'Linear',
            direction: {
             from: {x: 0, y: 0 },
             to:   {x: 1, y: 1 },
           },
            stops: [
             {
               color: "#ffc600",
               position: 0
             },
             {
               color: "#ff7500",
               position: 0.7554000020027161
             },
             {
               color: "#ff1822",
               position: 1
             },
           ],
         };
const baseSurfaceGradientSurfaceGradientDiagonal = accentColorGradientDiagonal;
const baseSurfaceGradientSurfaceGradientLinear = accentColorGradientLinear;
const baseBorderGradientBorderGradientLinear = accentColorGradientLinear;


export const Gradients = {
  /** This gradient is to be used only as a fill color (bars above cards, icons, etc.) 
  
  Not to be used in text.
   */
      accentColorGradientLinear,
  /** This gradient is to be used only as a fill color (bars above cards, icons, etc.) 
  
  Not to be used in text. */
      accentColorGradientDiagonal,
      baseSurfaceGradientSurfaceGradientDiagonal,
      baseSurfaceGradientSurfaceGradientLinear,
      baseBorderGradientBorderGradientLinear,
}